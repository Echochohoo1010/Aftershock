"""
CS166 Carbon Pricing Simulation - Modified for App Integration
=================================================================
Modified to match Netherlands code interface while maintaining CS166 simulation logic.

Changes from original CS166 notebook:
1. Extended from 72 months (6 years) to 120 months (10 years)
2. Added export_simulation_to_json() method for web visualization
3. Maintains CS166's behavioral model and assumptions
4. Compatible with command-line policy selection

Usage:
    python CS166_modified_for_app.py vehicle_tax
    python CS166_modified_for_app.py fuel_tax
"""

import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import copy
import warnings
import json
import os
import sys
from dataclasses import dataclass
from typing import List, Dict, Tuple, Optional
from scipy.stats import lognorm, beta
from datetime import datetime

# Suppress warnings
warnings.filterwarnings('ignore')

# Set random seed for reproducibility
np.random.seed(42)

@dataclass
class Vehicle:
    """Vehicle archetype with specifications"""
    type: str
    description: str
    co2_gkm: float
    base_price: float
    fuel_factor: Tuple[float, float]

    def get_fuel_factor(self) -> float:
        """Sample a random fuel consumption multiplier."""
        return np.random.uniform(self.fuel_factor[0], self.fuel_factor[1])


@dataclass
class Agent:
    """Household agent with vehicle ownership characteristics"""
    id: int
    income: float
    driving_km: float
    policy_awareness: float
    is_company_car: bool
    cycling_preference: float = 0.0
    will_never_buy_car: bool = False
    vehicle: Optional[Vehicle] = None
    vehicle_age: int = 0
    replacement_due: bool = False

    def __post_init__(self):
        """Company car users have higher baseline policy awareness."""
        if self.is_company_car:
            self.policy_awareness = min(1.0, self.policy_awareness + 0.2)


class CS166CarbonPricingSimulation:
    """
    CS166 Monte Carlo simulation adapted for app integration.

    Maintains CS166's original behavioral model with 10-year time horizon.
    Compatible with Netherlands code's input/output interface.
    """

    def __init__(self, n_agents: int = 100, time_horizon: int = 120,
                 policy_type: str = 'vehicle_tax'):

        self.n_agents = n_agents
        self.time_horizon = time_horizon
        self.current_month = 0
        self.policy_type = policy_type

        # === Vehicle Archetypes (CS166 specifications) ===
        self.vehicles = {
            'ICE-S': Vehicle('ICE-S', 'Small Petrol (Fiesta/Yaris)',
                            128, 14738, (1.15, 1.25)),
            'ICE-M': Vehicle('ICE-M', 'Mid Petrol (Focus/Astra)',
                            166, 22700, (1.15, 1.30)),
            'DIE-M': Vehicle('DIE-M', 'Mid Diesel (Golf TDI)',
                            119, 25672, (1.10, 1.20)),
            'HEV-S': Vehicle('HEV-S', 'Hybrid (Prius)',
                            104, 30790, (1.15, 1.25)),
            'BEV-M': Vehicle('BEV-M', 'Electric (Tesla S)',
                            0, 47830, (0.0, 0.0)),
            'PHEV-M': Vehicle('PHEV-M', 'Plug-in Hybrid (Outlander/V60)',
                             46, 56843, (1.10, 1.20))
        }

        # === Netherlands Vehicle Tax Parameters (CS166 calibration) ===
        self.bpm_rate = 40
        self.bpm_thresholds = {0: 110, 36: 95, 60: 80}
        self.feebate_rebates = {90: 1500, 110: 750}
        self.feebate_fees = {130: 1000, 160: 2000}
        self.mrb_bands = {0: 0, 51: 150, 96: 300, 131: 500, 161: 700}
        self.bik_rates = {0: 0.04, 51: 0.10, 111: 0.22}

        # === BC Carbon Tax Parameters ===
        self.carbon_tax_rates = {
            0: 6.97, 12: 10.45, 24: 13.94, 36: 17.42, 48: 20.89
        }
        self.fuel_carbon_content = {'gasoline': 2310, 'diesel': 2640}

        # === CS166 Behavioral Parameters ===
        self.w_upfront = 1.0
        self.w_annual = 0.7
        self.w_fuel = 0.5
        self.decision_noise = 7000
        self.range_anxiety_initial = 3500
        self.range_anxiety_decay = 0.95
        self.phev_anxiety_factor = 0.2

        # === Market Parameters ===
        self.base_hazard_replacement = 0.08
        self.base_hazard_new = 0.020
        # Extended supply caps for 10-year simulation
        self.ev_supply_cap = {
            0: 5, 12: 10, 24: 15, 36: 25, 48: 35, 60: 50,
            72: 65, 84: 80, 96: 95, 108: 110
        }

        # === Fuel Prices ===
        self.fuel_prices = {
            'petrol': 1.70, 'diesel': 1.30,
            'electricity': {0: 0.127, 18: 0.170, 48: 0.192}
        }
        self.real_world_gap = {'petrol': 1.19, 'diesel': 1.06, 'hybrid': 1.11}

        # Initialize policy-specific settings
        self._configure_policy()

        # Create agents and initialize fleet
        self.agents = self._create_agents()
        self._initialize_fleet()

        # Tracking variables
        self.monthly_data = []
        self.cumulative_sales = {vtype: 0 for vtype in self.vehicles}

        # NEW: Track monthly agent data for JSON export (compatible with Netherlands format)
        self.monthly_agent_data = []

        # NEW: Track comprehensive monthly metrics
        self.monthly_metrics = []
        self.cumulative_policy_costs = 0  # Track total policy costs (subsidies - taxes)
        self.cumulative_emissions_avoided = 0  # Track emissions avoided vs baseline

    def _configure_policy(self):
        """Configure simulation for the selected policy type."""
        if self.policy_type == 'fuel_tax':
            # BC fuel tax: DISABLE all vehicle taxes
            self.enable_bc_tax = True
            self.bpm_rate = 0
            self.bpm_thresholds = {}
            self.feebate_rebates = {}
            self.feebate_fees = {}
            self.mrb_bands = {0: 0}
            self.bik_rates = {0: 0.22}
        else:
            self.enable_bc_tax = False

    def _create_agents(self) -> List[Agent]:
        """Create heterogeneous household agents."""
        agents = []

        incomes = lognorm.rvs(0.6, scale=38000, size=self.n_agents)
        driving_km = np.clip(np.random.normal(13000, 5000, self.n_agents), 1000, None)
        awareness = beta.rvs(2, 3, size=self.n_agents)
        company_car = np.random.choice([True, False], size=self.n_agents, p=[0.5, 0.5])

        for i in range(self.n_agents):
            cycling_pref = beta.rvs(2, 1.5)
            never_buy_prob = 0.03 if cycling_pref > 0.8 else 0.0
            if company_car[i]:
                never_buy_prob *= 0.3

            agent = Agent(
                id=i,
                income=incomes[i],
                driving_km=driving_km[i],
                policy_awareness=awareness[i],
                is_company_car=company_car[i],
                cycling_preference=cycling_pref,
                will_never_buy_car=np.random.random() < never_buy_prob
            )
            agents.append(agent)

        return agents

    def _initialize_fleet(self):
        """Initialize vehicle fleet with 45.1% ownership rate."""
        eligible = [i for i, a in enumerate(self.agents) if not a.will_never_buy_car]
        n_owners = int(0.451 * len(eligible))
        owner_indices = np.random.choice(eligible, n_owners, replace=False)

        ages = np.clip(np.random.normal(11*12, 4.4*12, n_owners), 0, 20*12)

        fleet_probs = [0.35, 0.30, 0.33, 0.02, 0.0, 0.0]

        for i, idx in enumerate(owner_indices):
            vtype = np.random.choice(list(self.vehicles.keys()), p=fleet_probs)
            self.agents[idx].vehicle = copy.deepcopy(self.vehicles[vtype])
            self.agents[idx].vehicle_age = int(ages[i])
            age_years = ages[i] / 12
            repl_prob = min(0.8, 0.1 + max(0, age_years - 10) * 0.05)
            self.agents[idx].replacement_due = np.random.random() < repl_prob

    # === Tax Calculation Methods ===

    def _get_bpm_threshold(self, month: int) -> float:
        """Get current BPM exemption threshold."""
        threshold = 110
        for m, th in sorted(self.bpm_thresholds.items()):
            if month >= m:
                threshold = th
        return threshold

    def _calculate_bpm(self, co2: float, month: int) -> float:
        """Calculate Vehicle Purchase Tax (BPM)."""
        if self.enable_bc_tax:
            return 0.0
        threshold = self._get_bpm_threshold(month)
        return max(0, self.bpm_rate * (co2 - threshold))

    def _calculate_feebate(self, co2: float) -> float:
        """Calculate feebate."""
        if self.enable_bc_tax:
            return 0.0
        for threshold, rebate in sorted(self.feebate_rebates.items()):
            if co2 <= threshold:
                return rebate
        for threshold, fee in sorted(self.feebate_fees.items(), reverse=True):
            if co2 >= threshold:
                return -fee
        return 0.0

    def _calculate_mrb(self, co2: float) -> float:
        """Calculate Annual Road Tax (MRB)."""
        if self.enable_bc_tax:
            return 0.0
        tax = 0
        for threshold, rate in sorted(self.mrb_bands.items(), reverse=True):
            if co2 >= threshold:
                return rate
        return 0

    def _calculate_bik(self, vehicle: Vehicle, agent: Agent) -> float:
        """Calculate Company Car Tax (BIK)."""
        if not agent.is_company_car:
            return 0.0
        rate = 0.22
        for threshold, r in sorted(self.bik_rates.items(), reverse=True):
            if vehicle.co2_gkm >= threshold:
                rate = r
                break
        return vehicle.base_price * rate

    def _get_carbon_tax_rate(self, month: int) -> float:
        """Get current BC carbon tax rate."""
        if not self.enable_bc_tax:
            return 0.0
        rate = 0
        for m, r in sorted(self.carbon_tax_rates.items()):
            if month >= m:
                rate = r
        return rate

    def _get_electricity_price(self, month: int) -> float:
        """Get electricity price."""
        price = 0.127
        for m, p in sorted(self.fuel_prices['electricity'].items()):
            if month >= m:
                price = p
        return price

    def _calculate_fuel_cost(self, vehicle: Vehicle, agent: Agent,
                             years: int = 3) -> float:
        """Calculate total fuel cost."""
        annual_km = agent.driving_km

        if vehicle.type == 'BEV-M':
            kwh_per_km = 0.161
            elec_price = self._get_electricity_price(self.current_month)
            return annual_km * kwh_per_km * elec_price * years

        if vehicle.type == 'PHEV-M':
            kwh_per_km = 0.15
            elec_price = self._get_electricity_price(self.current_month)
            electric_cost = annual_km * 0.30 * kwh_per_km * elec_price

            baseline = 4.5
            gap = self.real_world_gap['hybrid']
            factor = vehicle.get_fuel_factor()
            l_per_100km = baseline * gap * factor
            petrol_cost = (annual_km * 0.70 / 100) * l_per_100km * self.fuel_prices['petrol']

            return (electric_cost + petrol_cost) * years

        fuel_specs = {
            'ICE-S': ('petrol', 5.9, 'petrol'),
            'ICE-M': ('petrol', 7.4, 'petrol'),
            'DIE-M': ('diesel', 4.77, 'diesel'),
            'HEV-S': ('petrol', 4.3, 'hybrid')
        }

        fuel_type, baseline, gap_key = fuel_specs.get(vehicle.type, ('petrol', 7.0, 'petrol'))
        gap = self.real_world_gap[gap_key]
        factor = vehicle.get_fuel_factor()
        l_per_100km = baseline * gap * factor
        annual_liters = (annual_km / 100) * l_per_100km

        fuel_price = self.fuel_prices[fuel_type]
        if self.enable_bc_tax:
            tax_rate = self._get_carbon_tax_rate(self.current_month)
            carbon_key = 'gasoline' if fuel_type == 'petrol' else 'diesel'
            carbon_kg = self.fuel_carbon_content[carbon_key] / 1000
            fuel_price += tax_rate * carbon_kg / 1000

        return annual_liters * fuel_price * years

    def _calculate_utility(self, vehicle: Vehicle, agent: Agent, month: int) -> float:
        """Calculate utility (CS166 model)."""
        bpm = self._calculate_bpm(vehicle.co2_gkm, month)
        feebate = self._calculate_feebate(vehicle.co2_gkm)
        upfront = vehicle.base_price + bpm - feebate

        mrb = self._calculate_mrb(vehicle.co2_gkm)
        ownership = mrb * 3

        fuel = self._calculate_fuel_cost(vehicle, agent, years=3)

        tco = (self.w_upfront * upfront +
               self.w_annual * ownership +
               self.w_fuel * fuel)

        range_penalty = 0
        if vehicle.type == 'BEV-M':
            range_penalty = self.range_anxiety_initial * (self.range_anxiety_decay ** month)
        elif vehicle.type == 'PHEV-M':
            range_penalty = self.range_anxiety_initial * self.phev_anxiety_factor * (self.range_anxiety_decay ** month)

        bik_advantage = 0
        if agent.is_company_car and vehicle.co2_gkm <= 110:
            bik_current = self._calculate_bik(vehicle, agent)
            bik_baseline = vehicle.base_price * 0.22
            bik_advantage = (bik_baseline - bik_current) * 3 / 100

        policy_bonus = 0
        if vehicle.type in ['BEV-M', 'PHEV-M']:
            policy_benefit = -bpm + feebate - (mrb * 3)
            multiplier = 1.0 + agent.policy_awareness * (1.0 if agent.is_company_car else 0.6)
            policy_bonus = (policy_benefit / 1000) * (multiplier - 1.0) * 1.5

        cycling_penalty = 0
        if agent.vehicle is None:
            cycling_penalty = agent.cycling_preference * 3000

        utility = -(tco / 1000) - range_penalty + bik_advantage + policy_bonus - cycling_penalty
        utility += np.random.normal(0, self.decision_noise / 1000)

        return utility

    def _get_ev_supply_cap(self) -> int:
        """Get current monthly EV supply cap."""
        cap = 5
        for m, c in sorted(self.ev_supply_cap.items()):
            if self.current_month >= m:
                cap = c
        return cap

    def get_emission_level(self, co2_gkm: float) -> int:
        """Get emission level for visualization (1-4)."""
        if co2_gkm == 0:
            return 1  # No emission
        elif co2_gkm <= 90:
            return 2  # Light emission
        elif co2_gkm <= 125:
            return 3  # Mid emission
        else:
            return 4  # High emission

    def _capture_monthly_agent_data(self):
        """Capture agent data for JSON export (Netherlands format compatible)."""
        monthly_snapshot = {
            'month': self.current_month,
            'year': (self.current_month // 12) + 1,
            'agents': []
        }

        for agent in self.agents:
            agent_data = {
                'id': agent.id,
                'income': float(agent.income),
                'driving_km': float(agent.driving_km),
                'actual_driving_km': float(agent.driving_km),
                'is_urban': True,  # CS166 doesn't distinguish urban/rural
                'is_company_car': bool(agent.is_company_car),
                'cycling_preference': float(agent.cycling_preference),
                'will_never_buy_car': bool(agent.will_never_buy_car),
                'vehicle_info': None,
                'emission_level': 1,
                'emission_volume_category': 'no-vehicle',
                'annual_co2_kg': 0.0
            }

            if agent.vehicle:
                annual_co2_kg = (agent.vehicle.co2_gkm * agent.driving_km) / 1000

                # Emission volume category
                if annual_co2_kg == 0:
                    volume_cat = "zero-emissions"
                elif annual_co2_kg <= 1000:
                    volume_cat = "very-low"
                elif annual_co2_kg <= 2000:
                    volume_cat = "low"
                elif annual_co2_kg <= 3000:
                    volume_cat = "moderate"
                elif annual_co2_kg <= 4000:
                    volume_cat = "high"
                else:
                    volume_cat = "very-high"

                agent_data.update({
                    'vehicle_info': {
                        'type': str(agent.vehicle.type),
                        'example_band': str(agent.vehicle.description),
                        'co2_gkm': float(agent.vehicle.co2_gkm),
                        'base_price': float(agent.vehicle.base_price),
                        'age': int(agent.vehicle_age)
                    },
                    'emission_level': int(self.get_emission_level(agent.vehicle.co2_gkm)),
                    'emission_volume_category': str(volume_cat),
                    'annual_co2_kg': float(annual_co2_kg)
                })

            monthly_snapshot['agents'].append(agent_data)

        self.monthly_agent_data.append(monthly_snapshot)

    def simulate_month(self):
        """Simulate one month."""
        purchases = []
        ev_sales = 0
        ev_cap = self._get_ev_supply_cap()

        for agent in self.agents:
            if agent.will_never_buy_car:
                continue

            should_consider = (agent.vehicle is None) or agent.replacement_due

            if should_consider:
                hazard = self.base_hazard_replacement if agent.replacement_due else self.base_hazard_new

                if agent.vehicle is None:
                    hazard *= (1 - agent.cycling_preference * 0.7)

                utilities = {vtype: self._calculate_utility(v, agent, self.current_month)
                            for vtype, v in self.vehicles.items()}

                best_type = max(utilities, key=utilities.get)
                best_utility = utilities[best_type]

                if best_type in ['BEV-M', 'PHEV-M'] and ev_sales >= ev_cap:
                    non_ev = {k: v for k, v in utilities.items() if k not in ['BEV-M', 'PHEV-M']}
                    if non_ev:
                        best_type = max(non_ev, key=non_ev.get)
                        best_utility = non_ev[best_type]

                if best_utility > -40:
                    prob = 1 / (1 + np.exp(-best_utility / (self.decision_noise / 1000)))
                    buy_prob = prob * hazard

                    if agent.replacement_due:
                        buy_prob = max(buy_prob, 0.01)

                    if np.random.random() < buy_prob:
                        agent.vehicle = copy.deepcopy(self.vehicles[best_type])
                        agent.vehicle_age = 0
                        agent.replacement_due = False
                        purchases.append(best_type)
                        self.cumulative_sales[best_type] += 1

                        if best_type in ['BEV-M', 'PHEV-M']:
                            ev_sales += 1

        for agent in self.agents:
            if agent.vehicle:
                agent.vehicle_age += 1
                if agent.vehicle_age > 144 and not agent.replacement_due:
                    age_years = agent.vehicle_age / 12
                    repl_prob = min(0.8, 0.1 + max(0, age_years - 12) * 0.05)
                    agent.replacement_due = np.random.random() < repl_prob

        self._record_month(purchases)
        self._capture_monthly_agent_data()  # NEW: Capture for JSON export
        self.current_month += 1

    def _calculate_monthly_metrics(self, purchases: List[str]):
        """Calculate comprehensive monthly metrics for JSON export."""
        vehicles_owned = [a.vehicle for a in self.agents if a.vehicle]

        # 1. Fleet CO2 Emissions (tonnes CO2e)
        total_annual_emissions_kg = 0
        for agent in self.agents:
            if agent.vehicle:
                # Annual emissions for this vehicle
                annual_co2_kg = (agent.vehicle.co2_gkm * agent.driving_km) / 1000
                total_annual_emissions_kg += annual_co2_kg

        total_annual_emissions_tonnes = total_annual_emissions_kg / 1000
        monthly_emissions_tonnes = total_annual_emissions_kg / 12 / 1000  # Monthly emissions

        # Baseline emissions (if all had average ICE vehicles at 145 g/km)
        baseline_co2_gkm = 145  # Average ICE emissions
        baseline_annual_emissions_kg = sum(agent.driving_km * baseline_co2_gkm / 1000
                                          for agent in self.agents if agent.vehicle)
        baseline_annual_emissions_tonnes = baseline_annual_emissions_kg / 1000

        emissions_avoided_tonnes = baseline_annual_emissions_tonnes - total_annual_emissions_tonnes
        self.cumulative_emissions_avoided += emissions_avoided_tonnes

        # 2. Vehicle Market Shares
        type_counts = {vtype: 0 for vtype in self.vehicles}
        for v in vehicles_owned:
            type_counts[v.type] += 1

        total_vehicles = len(vehicles_owned)

        # Calculate market shares as percentages
        market_shares = {}
        for vtype in self.vehicles:
            market_shares[vtype] = (type_counts[vtype] / total_vehicles * 100) if total_vehicles > 0 else 0

        # 3. EV Adoption (BEV + PHEV)
        ev_count = type_counts['BEV-M'] + type_counts.get('PHEV-M', 0)
        ev_share_percent = (ev_count / total_vehicles * 100) if total_vehicles > 0 else 0
        bev_share_percent = (type_counts['BEV-M'] / total_vehicles * 100) if total_vehicles > 0 else 0
        phev_share_percent = (type_counts.get('PHEV-M', 0) / total_vehicles * 100) if total_vehicles > 0 else 0

        # 4. Policy Costs (calculate for this month's purchases)
        monthly_policy_cost = 0
        for vehicle_type in purchases:
            vehicle = self.vehicles[vehicle_type]
            # BPM tax (government revenue, negative cost)
            bpm = self._calculate_bpm(vehicle.co2_gkm, self.current_month)
            # Feebate (subsidy is positive cost, fee is negative cost)
            feebate = self._calculate_feebate(vehicle.co2_gkm)
            # Net policy cost = subsidies paid - taxes collected
            monthly_policy_cost += (feebate - bpm)

        self.cumulative_policy_costs += monthly_policy_cost

        # 5. Cost Effectiveness (€/tCO2 avoided)
        if self.cumulative_emissions_avoided > 0:
            cost_effectiveness = self.cumulative_policy_costs / self.cumulative_emissions_avoided
        else:
            cost_effectiveness = 0

        # 6. Average Fleet CO2 Intensity (g/km)
        if vehicles_owned:
            avg_fleet_co2 = np.mean([v.co2_gkm for v in vehicles_owned])
        else:
            avg_fleet_co2 = 0

        # Store comprehensive metrics
        metrics = {
            'month': self.current_month,
            'year': (self.current_month // 12) + 1,
            'month_in_year': (self.current_month % 12) + 1,

            # Fleet emissions
            'fleet_annual_emissions_tonnes': round(total_annual_emissions_tonnes, 2),
            'fleet_monthly_emissions_tonnes': round(monthly_emissions_tonnes, 2),
            'baseline_annual_emissions_tonnes': round(baseline_annual_emissions_tonnes, 2),
            'emissions_avoided_annual_tonnes': round(emissions_avoided_tonnes, 2),
            'cumulative_emissions_avoided_tonnes': round(self.cumulative_emissions_avoided, 2),

            # Cost effectiveness
            'monthly_policy_cost_euros': round(monthly_policy_cost, 2),
            'cumulative_policy_cost_euros': round(self.cumulative_policy_costs, 2),
            'cost_effectiveness_euros_per_tco2': round(cost_effectiveness, 2),

            # EV adoption
            'ev_adoption_percent': round(ev_share_percent, 2),
            'bev_adoption_percent': round(bev_share_percent, 2),
            'phev_adoption_percent': round(phev_share_percent, 2),
            'ev_count': ev_count,

            # Market shares (all vehicle types)
            'market_shares': {
                vtype: round(market_shares[vtype], 2) for vtype in self.vehicles
            },

            # Fleet characteristics
            'total_vehicles': total_vehicles,
            'avg_fleet_co2_gkm': round(avg_fleet_co2, 2),
            'car_ownership_rate': round((total_vehicles / self.n_agents * 100), 2),

            # Monthly sales
            'monthly_sales': {vtype: purchases.count(vtype) for vtype in self.vehicles},
            'total_monthly_sales': len(purchases)
        }

        self.monthly_metrics.append(metrics)

        return metrics

    def _record_month(self, purchases: List[str]):
        """Record monthly statistics."""
        vehicles_owned = [a.vehicle for a in self.agents if a.vehicle]

        if vehicles_owned:
            avg_co2 = np.mean([v.co2_gkm for v in vehicles_owned])
        else:
            avg_co2 = 0

        type_counts = {vtype: 0 for vtype in self.vehicles}
        for v in vehicles_owned:
            type_counts[v.type] += 1

        total_vehicles = len(vehicles_owned)
        ev_count = type_counts['BEV-M'] + type_counts.get('PHEV-M', 0)
        ev_share = ev_count / total_vehicles if total_vehicles > 0 else 0

        sales_counts = {vtype: purchases.count(vtype) for vtype in self.vehicles}

        self.monthly_data.append({
            'month': self.current_month,
            'avg_co2': avg_co2,
            'total_vehicles': total_vehicles,
            'ev_share': ev_share,
            'ev_count': ev_count,
            'type_counts': type_counts,
            'sales': sales_counts,
            'total_sales': len(purchases),
            'car_ownership': total_vehicles / self.n_agents
        })

        # Calculate and store comprehensive metrics
        self._calculate_monthly_metrics(purchases)

    def run_simulation(self):
        """Run complete simulation (main interface method)."""
        print(f"Starting CS166 Carbon Pricing Simulation...")
        print(f"Policy: {self.policy_type}")
        print(f"Agents: {self.n_agents:,} | Duration: {self.time_horizon} months ({self.time_horizon/12:.1f} years)")

        self._record_month([])
        self._capture_monthly_agent_data()

        for month in range(self.time_horizon):
            if month % 12 == 0 and month > 0:
                year = (month // 12)
                print(f"Year {year} complete...")

            self.simulate_month()

        print(f"Simulation complete!")
        return pd.DataFrame(self.monthly_data)

    def export_monthly_metrics_to_json(self, output_path: str = "../monthly_metrics.json"):
        """
        Export comprehensive monthly metrics to JSON file.

        Includes:
        1. Fleet CO2 Trajectory (tonnes CO2e)
        2. Cost Effectiveness (€/tCO2)
        3. Electric Vehicle Adoption (% market share)
        4. All Vehicle Type Market Shares (%)
        """
        if not self.monthly_metrics:
            print("No metrics data available. Run simulation first.")
            return None

        print(f"Exporting monthly metrics to JSON format...")

        # Prepare summary statistics
        metrics_summary = {
            'simulation_info': {
                'policy_type': self.policy_type,
                'n_agents': self.n_agents,
                'time_horizon_months': self.time_horizon,
                'time_horizon_years': self.time_horizon / 12,
                'vehicle_types': list(self.vehicles.keys()),
                'generation_timestamp': datetime.now().isoformat()
            },
            'final_results': {
                'total_emissions_avoided_tonnes': round(self.cumulative_emissions_avoided, 2),
                'total_policy_cost_euros': round(self.cumulative_policy_costs, 2),
                'final_cost_effectiveness': round(
                    self.cumulative_policy_costs / self.cumulative_emissions_avoided
                    if self.cumulative_emissions_avoided > 0 else 0, 2
                ),
                'final_ev_adoption_percent': self.monthly_metrics[-1]['ev_adoption_percent'],
                'final_bev_adoption_percent': self.monthly_metrics[-1]['bev_adoption_percent'],
                'final_phev_adoption_percent': self.monthly_metrics[-1]['phev_adoption_percent'],
                'final_market_shares': self.monthly_metrics[-1]['market_shares'],
                'final_fleet_co2_gkm': self.monthly_metrics[-1]['avg_fleet_co2_gkm']
            },
            'monthly_data': self.monthly_metrics
        }

        try:
            output_dir = os.path.dirname(output_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)

            with open(output_path, 'w') as f:
                json.dump(metrics_summary, f, indent=2)

            file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            print(f"✅ Monthly metrics JSON exported: {output_path}")
            print(f"📊 File size: {file_size_mb:.2f} MB")
            print(f"📋 Contains {len(self.monthly_metrics)} months of comprehensive metrics")
            print(f"\n📈 Metrics included:")
            print(f"   - Fleet CO2 trajectory (tonnes CO2e)")
            print(f"   - Cost effectiveness (€/tCO2 avoided)")
            print(f"   - EV adoption (% BEV, PHEV, total)")
            print(f"   - All vehicle type market shares (%)")
            print(f"   - Baseline comparisons")
            print(f"   - Cumulative policy costs")

            return output_path

        except Exception as e:
            print(f"❌ Error exporting metrics JSON: {e}")
            return None

    def export_simulation_to_json(self, output_path: str = "../simulation_data.json"):
        """
        Export simulation data to JSON format (Netherlands format compatible).
        This matches the interface expected by the web visualization.
        """
        if not self.monthly_agent_data:
            print("No agent data available. Run simulation first.")
            return None

        print(f"Exporting simulation data to JSON format...")

        frames = []

        for month_data in self.monthly_agent_data:
            month = month_data['month']
            year = month_data['year']

            agents = []
            clean_types = ['BEV-M', 'PHEV-M', 'Cycling']

            for agent_data in month_data['agents']:
                if agent_data['vehicle_info']:
                    vehicle_type = agent_data['vehicle_info']['type']
                    emission_level = agent_data['emission_level']
                else:
                    vehicle_type = 'Cycling'
                    emission_level = 1

                agents.append({
                    "id": agent_data['id'],
                    "type": vehicle_type,
                    "emission_level": emission_level
                })

            clean_count = sum(1 for agent in agents if agent['type'] in clean_types)
            adoption_rate = clean_count / len(agents) if agents else 0

            total_fleet_emissions_kg = sum(
                agent_data['annual_co2_kg']
                for agent_data in month_data['agents']
            )
            total_fleet_emissions_tonnes = total_fleet_emissions_kg / 1000

            month_in_year = ((month - 1) % 12) + 1 if month > 0 else 1
            year_num = ((month - 1) // 12) + 1 if month > 0 else 1

            frames.append({
                "t": f"Year {year_num}, Month {month_in_year}",
                "agents": agents,
                "adoptionRate": adoption_rate,
                "totalEmissionsKg": total_fleet_emissions_kg,
                "totalEmissionsTonnes": total_fleet_emissions_tonnes
            })

        try:
            output_dir = os.path.dirname(output_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)

            with open(output_path, 'w') as f:
                json.dump(frames, f, indent=2)

            file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            print(f"✅ JSON file exported: {output_path}")
            print(f"📊 File size: {file_size_mb:.1f} MB")
            print(f"📋 Contains {len(frames)} frames with {len(agents)} agents each")
            print(f"🎯 Format: Compatible with web visualization")

            return output_path

        except Exception as e:
            print(f"❌ Error exporting JSON: {e}")
            return None


# Main execution
if __name__ == "__main__":
    # Accept policy type from command line
    policy_type = 'vehicle_tax'  # default

    if len(sys.argv) > 1:
        policy_arg = sys.argv[1].lower()
        if policy_arg in ['fuel', 'fuel_tax', 'b']:
            policy_type = 'fuel_tax'
            print("Running simulation: British Columbia Fuel Carbon Tax")
        elif policy_arg in ['vehicle', 'vehicle_tax', 'purchase', 'a']:
            policy_type = 'vehicle_tax'
            print("Running simulation: Netherlands Vehicle Purchase Tax")
        else:
            print(f"Warning: Unknown policy argument '{sys.argv[1]}', defaulting to 'vehicle_tax'")
            print("Valid options: vehicle_tax, fuel_tax")
    else:
        print("No policy specified, defaulting to: Netherlands Vehicle Purchase Tax")

    print(f"\nInitializing CS166 simulation with policy: {policy_type}")
    print(f"Duration: 120 months (10 years) | Agents: 100")
    print(f"Model: CS166 behavioral calibration (Kok 2015, Murray & Rivers 2015)")

    # Create simulation
    sim = CS166CarbonPricingSimulation(n_agents=100, time_horizon=120, policy_type=policy_type)

    # Run simulation
    results = sim.run_simulation()

    # Export to policy-specific JSON file
    output_filename = f"simulation_{policy_type}.json"
    output_path = f"../{output_filename}"
    sim.export_simulation_to_json(output_path=output_path)

    # Also save to generic simulation_data.json for backwards compatibility
    sim.export_simulation_to_json(output_path="../simulation_data.json")

    # NEW: Export comprehensive monthly metrics
    metrics_filename = f"monthly_metrics_{policy_type}.json"
    metrics_path = f"../{metrics_filename}"
    sim.export_monthly_metrics_to_json(output_path=metrics_path)

    # Also save generic metrics file
    sim.export_monthly_metrics_to_json(output_path="../monthly_metrics.json")

    print(f"\n✅ CS166 Simulation complete!")
    print(f"📊 Policy-specific JSON saved to: {output_filename}")
    print(f"📊 Generic JSON saved to: simulation_data.json")
    print(f"📈 Policy-specific metrics saved to: {metrics_filename}")
    print(f"📈 Generic metrics saved to: monthly_metrics.json")
    print(f"\n🔬 CS166 Model Characteristics:")
    print(f"   - 6 vehicle types (including PHEV)")
    print(f"   - Range anxiety decay: {sim.range_anxiety_decay}")
    print(f"   - Salience weights: upfront={sim.w_upfront}, annual={sim.w_annual}, fuel={sim.w_fuel}")
    print(f"   - Initial car ownership: 45.1%")
    print(f"   - No revenue recycling for fuel_tax policy")

    # Print key results
    print(f"\n📊 Key Results:")
    if sim.monthly_metrics:
        final = sim.monthly_metrics[-1]
        print(f"   - Final EV Adoption: {final['ev_adoption_percent']:.1f}%")
        print(f"   - Final Fleet CO2: {final['avg_fleet_co2_gkm']:.1f} g/km")
        print(f"   - Total Emissions Avoided: {sim.cumulative_emissions_avoided:.1f} tonnes CO2")
        print(f"   - Cost Effectiveness: €{final['cost_effectiveness_euros_per_tco2']:.0f}/tCO2")
        print(f"\n   Vehicle Market Shares (Year 10):")
        for vtype, share in final['market_shares'].items():
            print(f"     • {vtype}: {share:.1f}%")
