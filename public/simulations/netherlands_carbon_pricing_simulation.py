import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
try:
    import openpyxl
except ImportError:
    print("Warning: openpyxl not installed. Excel export may not work. Install with: pip install openpyxl")
from dataclasses import dataclass, replace
from typing import List, Dict, Tuple, Optional
import random
from scipy.stats import lognorm, beta, uniform
import seaborn as sns
import copy
import json
import os
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

@dataclass
class Vehicle:
    """Vehicle archetype with specifications"""
    type: str
    example_band: str
    co2_gkm: float
    base_price: float
    fuel_factor: Tuple[float, float]
    performance_score: float
    
    def get_fuel_factor(self) -> float:
        """Get a random fuel factor within the specified range"""
        return np.random.uniform(self.fuel_factor[0], self.fuel_factor[1])

@dataclass
class Agent:
    """Household agent with characteristics and vehicle"""
    id: int
    income: float
    driving_km: float
    policy_awareness: float
    is_company_car: bool
    is_urban: bool = True
    cycling_preference: float = 0.0
    will_never_buy_car: bool = False
    vehicle: Vehicle = None
    vehicle_age: int = 0
    replacement_due: bool = False
    social_proof: float = 0.0

    # Fuel cost pressure system (for Policy B: fuel_tax)
    fuel_burden_threshold: float = 0.08  # 8% of income threshold
    replacement_pressure: float = 0.0    # Accumulates when fuel costs are high

    # Decision tracking for reporting
    last_decision_month: int = -1
    last_decision_reason: str = ""
    decision_utility_breakdown: Dict = None
    
    def __post_init__(self):
        if self.is_company_car:
            self.policy_awareness += 0.2
            self.policy_awareness = min(1.0, self.policy_awareness)
        if self.decision_utility_breakdown is None:
            self.decision_utility_breakdown = {}

@dataclass
class SimulationReport:
    """Comprehensive 3-year simulation report"""
    report_id: str
    year_start: int
    year_end: int
    timestamp: str
    
    # Market dynamics
    market_summary: Dict
    vehicle_transitions: Dict
    policy_impacts: Dict
    
    # Agent behavior insights
    agent_decisions: Dict
    decision_drivers: Dict
    demographic_patterns: Dict
    
    # Environmental and economic outcomes
    emissions_impact: Dict
    economic_impact: Dict
    
    # Policy effectiveness
    policy_effectiveness: Dict
    
    # Narrative insights
    policy_narratives: List[str]
    trend_analysis: Dict
    
    def __post_init__(self):
        # Initialize empty dicts/lists if None provided
        if self.vehicle_transitions is None:
            self.vehicle_transitions = {}
        if self.decision_drivers is None:
            self.decision_drivers = {}
        if self.policy_narratives is None:
            self.policy_narratives = []
        if self.trend_analysis is None:
            self.trend_analysis = {}

class NetherlandsCarbonPricingSimulation:
    """Enhanced agent-based simulation with comprehensive reporting"""
    
    def __init__(self, n_agents=10000, time_horizon=180, policy_type='vehicle_tax'):
        # Policy validation
        if policy_type not in ['vehicle_tax', 'fuel_tax']:
            raise ValueError(f"policy_type must be 'vehicle_tax' or 'fuel_tax', got: {policy_type}")

        self.policy_type = policy_type  # 'vehicle_tax' or 'fuel_tax'
        self.n_agents = n_agents
        self.time_horizon = time_horizon
        self.current_month = 0
        
        # Vehicle archetypes with user-friendly names
        self.vehicles = {
            'ICE-S': Vehicle('ICE-S', 'Small Petrol', 115, 20000, (1.15, 1.25), 0.6),
            'ICE-M': Vehicle('ICE-M', 'Mid Petrol', 145, 28000, (1.15, 1.30), 1.0),
            'DIE-M': Vehicle('DIE-M', 'Mid Diesel', 120, 30000, (1.10, 1.20), 1.1),
            'HEV-S': Vehicle('HEV-S', 'Small Hybrid', 85, 24000, (1.15, 1.25), 0.9),
            'BEV-M': Vehicle('BEV-M', 'Mid Electric', 0, 35000, (0.0, 0.0), 1.2)
        }
        
        # Policy parameters - FIXED: consistent naming
        self.bpm_alpha = 0
        self.bpm_beta = 40
        self.bpm_thresholds = {0: 110, 36: 95, 72: 80}
        
        # Feebate parameters
        self.feebate_rebates = {90: 1500, 110: 750}
        self.feebate_fees = {130: 1000, 160: 2000}
        
        # MRB bands
        self.mrb_bands = {0: 0, 51: 150, 96: 300, 131: 500, 161: 700}
        
        # BIK rates
        self.bik_rates = {0: 0.04, 51: 0.10, 111: 0.22}

        # Initialize policy-specific parameters based on user choice
        self._initialize_policy_parameters(policy_type)
        
        # Salience weights
        self.w_up = 1.0
        self.w_own = 0.7
        self.w_fuel = 0.5
        
        # Learning parameters
        self.learning_elasticity = 0.15
        self.range_penalty_decay = 0.99
        
        # Lambda coefficients
        self.lambda1_performance = 2000
        self.lambda2_range_penalty = 9000
        self.lambda3_social_proof = 3000
        self.lambda4_green_pref = 2000
        
        # Decision parameters - CORRECTED: back to realistic Dutch levels
        self.decision_noise = 8000  # Restored to original
        self.base_hazard_replacement = 0.03  # Reduced for Dutch cultural resistance
        self.base_hazard_new = 0.008  # Much lower for strong cycling culture
        
        # Car ownership targets
        self.car_ownership_targets = {
            0: 0.54, 36: 0.55, 72: 0.57, 108: 0.59, 144: 0.61
        }
        
        # BEV supply constraints - more realistic for Dutch market
        self.bev_supply_cap = {
            0: 20, 36: 50, 72: 150, 108: 400
        }
        
        # Policy effectiveness ramp
        self.policy_effectiveness_ramp = 0.3
        
        # Fuel prices
        self.fuel_prices = {'petrol': 1.70, 'diesel': 1.30, 'electricity': 0.22}
        
        # Real-world fuel gap
        self.real_world_gap = {'petrol': 1.25, 'diesel': 1.20, 'hybrid': 1.30}
        
        # Initialize agents and fleet
        self.agents = self._create_agents()
        self._initialize_fleet()
        
        # Tracking variables
        self.monthly_outputs = []
        self.annual_outputs = []
        self.cumulative_sales = {vtype: 0 for vtype in self.vehicles.keys()}
        
        # Enhanced tracking for detailed reporting
        self.three_year_reports = []
        self.decision_tracking = {
            'monthly_decisions': [],
            'policy_attributions': [],
            'utility_breakdowns': []
        }
        
        # Track historical sales for comparison
        self.historical_sales_by_period = {}
        
        # Track policy changes and their impacts
        self.policy_events = []
        self.baseline_metrics = None
        
        # Monthly agent data for visualization (only stores last simulation)
        self.monthly_agent_data = []
        self.visualization_data = {
            'agent_snapshots': [],  # Monthly snapshots of all agents
            'emission_trends': {},  # Track emission changes over time
            'vehicle_choices': {},  # Track vehicle choice patterns
            'metadata': {
                'emission_levels': {
                    1: 'No Emission (Cycling/Walking + Electric BEV-M)',
                    2: 'Light Emission (Hybrid HEV-S, ~85g CO2/km)', 
                    3: 'Mid Emission (Small Petrol ICE-S ~115g + Diesel DIE-M ~120g)',
                    4: 'High Emission (Mid Petrol ICE-M, ~145g CO2/km)'
                },
                'emission_volume_categories': {
                    'zero-emissions': 'Zero Emissions',
                    'very-low': 'Very Low (<1 tonne/year)',
                    'low': 'Low (1-2 tonnes/year)',
                    'moderate': 'Moderate (2-3 tonnes/year)',
                    'high': 'High (3-4 tonnes/year)',
                    'very-high': 'Very High (>4 tonnes/year)',
                    'no-vehicle': 'No Vehicle'
                }
            }
        }
    
    def get_vehicle_display_name(self, vtype: str) -> str:
        """Get user-friendly vehicle name"""
        names = {
            'ICE-S': 'Small Petrol Cars',
            'ICE-M': 'Mid-size Petrol Cars', 
            'DIE-M': 'Mid-size Diesel Cars',
            'HEV-S': 'Small Hybrid Cars',
            'BEV-M': 'Mid-size Electric Cars'
        }
        return names.get(vtype, vtype)
    
    def get_co2_context(self, co2_gkm: float) -> str:
        """Get contextual description for CO2 emissions"""
        if co2_gkm == 0:
            return "zero-emission"
        elif co2_gkm <= 50:
            return "ultra-low emission"
        elif co2_gkm <= 95:
            return "low emission"
        elif co2_gkm <= 130:
            return "moderate emission"
        else:
            return "high emission"
    
    def get_emission_level(self, co2_gkm: float) -> int:
        """Get emission level (1-4) for visualization - reclassified by emission groups"""
        if co2_gkm == 0:
            return 1  # No emission (electric vehicles: BEV-M)
        elif co2_gkm <= 90:
            return 2  # Light emission (hybrids: HEV-S, 85g)
        elif co2_gkm <= 125:
            return 3  # Mid emission (small petrol ICE-S 115g + diesel DIE-M 120g)
        else:
            return 4  # High emission (mid petrol: ICE-M, 145g)
    
    def get_emission_volume_category(self, agent: Agent) -> str:
        """Calculate emission volume category based on CO2 and driving distance"""
        if not agent.vehicle:
            return "no-vehicle"
        
        annual_co2_kg = (agent.vehicle.co2_gkm * agent.driving_km) / 1000  # Convert g to kg
        
        if annual_co2_kg == 0:
            return "zero-emissions"  # Electric vehicles
        elif annual_co2_kg <= 1000:
            return "very-low"  # <1 tonne/year
        elif annual_co2_kg <= 2000:
            return "low"  # 1-2 tonnes/year
        elif annual_co2_kg <= 3000:
            return "moderate"  # 2-3 tonnes/year
        elif annual_co2_kg <= 4000:
            return "high"  # 3-4 tonnes/year
        else:
            return "very-high"  # >4 tonnes/year
    
    def _create_agents(self) -> List[Agent]:
        """Create household agents with enhanced decision tracking"""
        agents = []
        
        # Income distribution
        income_median = 38000
        income_sd = 0.6
        incomes = lognorm.rvs(income_sd, scale=income_median, size=self.n_agents)
        
        # Driving demand
        driving_km = np.random.normal(13000, 5000, self.n_agents)
        driving_km = np.maximum(driving_km, 1000)
        
        # Policy awareness
        policy_awareness = beta.rvs(2, 3, size=self.n_agents)
        
        # Company car status
        company_car_status = np.random.choice([True, False], size=self.n_agents, p=[0.4, 0.6])
        
        # Urban/rural distribution
        urban_status = np.random.choice([True, False], size=self.n_agents, p=[0.8, 0.2])

        # Calculate median income for income-based fuel sensitivity
        median_income = np.median(incomes)

        for i in range(self.n_agents):
            is_urban = urban_status[i]
            
            # Cycling preference distribution
            if is_urban:
                cycling_pref = beta.rvs(2, 1.5)
            else:
                cycling_pref = beta.rvs(1.5, 2)
            
            # Determine never-buy-car status - reflecting Dutch cycling culture
            never_buy_prob = 0.20  # Higher baseline for Dutch culture
            if is_urban:
                never_buy_prob += cycling_pref * 0.15  # Scale with urban cycling preference
            else:
                never_buy_prob += cycling_pref * 0.10  # Rural Dutch still have cycling culture
            
            # Company cars reduce resistance to car ownership
            if company_car_status[i]:
                never_buy_prob *= 0.3  # Much lower for company car users
            
            will_never_buy = np.random.random() < never_buy_prob

            # Calculate income-based fuel burden threshold
            base_threshold = 0.08  # 8% base threshold
            sensitivity_exponent = 0.3
            income_based_threshold = base_threshold * (incomes[i] / median_income) ** sensitivity_exponent

            agent = Agent(
                id=i,
                income=incomes[i],
                driving_km=driving_km[i],
                policy_awareness=policy_awareness[i],
                is_company_car=company_car_status[i],
                is_urban=is_urban,
                cycling_preference=cycling_pref,
                will_never_buy_car=will_never_buy,
                fuel_burden_threshold=income_based_threshold,
                decision_utility_breakdown={}
            )
            agents.append(agent)
            
        return agents

    def _initialize_policy_parameters(self, policy_type: str):
        """Initialize parameters specific to the chosen policy type"""
        if policy_type == 'vehicle_tax':
            # Policy A: Netherlands Vehicle Purchase Tax System
            print("Initializing Policy A parameters: Netherlands vehicle purchase tax system")

            # Vehicle purchase tax parameters (BPM/Feebate) - already initialized above
            # MRB and BIK also remain active

            # Disable fuel carbon tax
            self.enable_bc_carbon_tax = False
            self.carbon_tax_rates = {}
            self.fuel_carbon_content = {}

        elif policy_type == 'fuel_tax':
            # Policy B: British Columbia Fuel Carbon Tax System
            print("Initializing Policy B parameters: British Columbia fuel carbon tax system")

            # Enable fuel carbon tax
            self.enable_bc_carbon_tax = True

            # Carbon tax rate schedule (€/tonne CO2, following BC progression)
            self.carbon_tax_rates = {
                0: 6.97,   # Month 0: €6.97/tonne (equivalent to C$10/tonne)
                12: 10.45, # Month 12: €10.45/tonne
                24: 13.94, # Month 24: €13.94/tonne
                36: 17.42, # Month 36: €17.42/tonne
                48: 20.89  # Month 48: €20.89/tonne (final rate)
            }

            # Fuel carbon content constants (g CO2/liter)
            self.fuel_carbon_content = {
                'gasoline': 2310,  # g CO2/liter
                'diesel': 2640     # g CO2/liter
            }

    def calculate_agent_annual_emissions(self, agent: Agent) -> float:
        """Calculate annual CO2 emissions for an agent in kg"""
        if not agent.vehicle or agent.will_never_buy_car:
            return 0.0  # No emissions for cycling/walking

        # Get vehicle CO2 per km
        co2_gkm = agent.vehicle.co2_gkm

        # Get actual driving distance (may be reduced in Policy B)
        driving_km = self.get_agent_actual_driving_distance(agent)

        # Calculate annual emissions in kg
        annual_emissions_kg = (co2_gkm * driving_km) / 1000

        return annual_emissions_kg

    def get_agent_actual_driving_distance(self, agent: Agent) -> float:
        """Get agent's actual driving distance, accounting for policy-specific behavioral changes"""
        base_driving_km = agent.driving_km

        if self.policy_type == 'vehicle_tax':
            # Policy A: Driving distance remains unchanged, people switch cars instead
            return base_driving_km

        elif self.policy_type == 'fuel_tax':
            # Policy B: People reduce driving to save on fuel costs
            # Reduction based on fuel burden and carbon tax rate
            fuel_burden = self.calculate_monthly_fuel_burden(agent, self.current_month)

            # Higher fuel burden → more driving reduction
            if fuel_burden > agent.fuel_burden_threshold:
                # Progressive reduction: higher burden = more reduction
                excess_burden = fuel_burden - agent.fuel_burden_threshold
                reduction_factor = min(0.3, excess_burden * 2)  # Max 30% reduction
                return base_driving_km * (1 - reduction_factor)
            else:
                # Small reduction even below threshold due to fuel price awareness
                carbon_tax_rate = self.get_current_carbon_tax_rate(self.current_month)
                if carbon_tax_rate > 0:
                    awareness_reduction = min(0.1, carbon_tax_rate / 100)  # Max 10% reduction
                    return base_driving_km * (1 - awareness_reduction)

        return base_driving_km

    def get_agent_fuel_sensitivity_stats(self) -> dict:
        """Return fuel sensitivity statistics by income quintiles"""
        if not self.agents:
            return {}

        # Get all agent incomes and fuel burden thresholds
        agent_data = [(agent.income, agent.fuel_burden_threshold) for agent in self.agents]
        agent_data.sort(key=lambda x: x[0])  # Sort by income

        n_agents = len(agent_data)
        quintile_size = n_agents // 5

        stats = {}
        quintile_labels = ['Quintile 1 (Lowest)', 'Quintile 2', 'Quintile 3', 'Quintile 4', 'Quintile 5 (Highest)']

        for i in range(5):
            start_idx = i * quintile_size
            end_idx = start_idx + quintile_size if i < 4 else n_agents  # Last quintile gets remainder

            quintile_data = agent_data[start_idx:end_idx]
            incomes = [data[0] for data in quintile_data]
            thresholds = [data[1] for data in quintile_data]

            stats[quintile_labels[i]] = {
                'avg_income': np.mean(incomes),
                'min_income': np.min(incomes),
                'max_income': np.max(incomes),
                'avg_fuel_burden_threshold': np.mean(thresholds),
                'min_threshold': np.min(thresholds),
                'max_threshold': np.max(thresholds),
                'count': len(quintile_data)
            }

        return stats

    def _initialize_fleet(self):
        """Initialize starting fleet"""
        eligible_agents = [i for i, agent in enumerate(self.agents) if not agent.will_never_buy_car]
        n_car_owners = int(0.54 * len(eligible_agents))
        car_owner_indices = np.random.choice(eligible_agents, n_car_owners, replace=False)
        
        car_ages = np.random.normal(11, 4.4, n_car_owners)
        car_ages = np.maximum(car_ages, 0)
        car_ages = np.minimum(car_ages, 20)
        
        vehicle_types = list(self.vehicles.keys())
        
        for i, agent_idx in enumerate(car_owner_indices):
            vehicle_type = np.random.choice(vehicle_types, p=[0.40, 0.25, 0.30, 0.03, 0.02])
            
            self.agents[agent_idx].vehicle = copy.deepcopy(self.vehicles[vehicle_type])
            self.agents[agent_idx].vehicle_age = int(car_ages[i])
            
            age = car_ages[i]
            replacement_prob = min(0.8, 0.1 + (age - 10) * 0.05)
            self.agents[agent_idx].replacement_due = np.random.random() < replacement_prob
    
    def get_current_car_ownership_target(self) -> float:
        """Get current car ownership target based on Dutch growth pattern"""
        target = 0.54
        for month_threshold, new_target in sorted(self.car_ownership_targets.items()):
            if self.current_month >= month_threshold:
                target = new_target
        return target
    
    def get_current_bev_supply_cap(self) -> int:
        """Get current BEV supply cap based on month"""
        cap = 50
        for month_threshold, new_cap in sorted(self.bev_supply_cap.items()):
            if self.current_month >= month_threshold:
                cap = new_cap
        return cap
    
    def get_policy_effectiveness(self) -> float:
        """Get current policy effectiveness"""
        if self.current_month <= 24:
            ramp_progress = self.current_month / 24.0
            return self.policy_effectiveness_ramp + (1 - self.policy_effectiveness_ramp) * ramp_progress
        return 1.0
    
    def calculate_bpm(self, co2_gkm: float, month: int) -> float:
        """Calculate BPM (purchase tax) - disabled for fuel_tax policy"""
        if self.policy_type == 'fuel_tax':
            return 0.0  # No vehicle purchase tax under fuel tax policy
        effectiveness = self.get_policy_effectiveness()
        
        threshold = 110
        for change_month, new_threshold in sorted(self.bpm_thresholds.items()):
            if month >= change_month:
                threshold = new_threshold
        
        if co2_gkm <= threshold:
            return 0
        else:
            base_tax = self.bpm_alpha + self.bpm_beta * (co2_gkm - threshold)
            return base_tax * effectiveness
    
    def calculate_feebate(self, co2_gkm: float) -> float:
        """Calculate feebate - disabled for fuel_tax policy"""
        if self.policy_type == 'fuel_tax':
            return 0.0  # No feebate system under fuel tax policy

        effectiveness = self.get_policy_effectiveness()
        
        if co2_gkm <= 90:
            return self.feebate_rebates[90] * effectiveness
        elif co2_gkm <= 110:
            return self.feebate_rebates[110] * effectiveness
        elif co2_gkm <= 130:
            return 0
        elif co2_gkm <= 160:
            return -self.feebate_fees[130] * effectiveness
        else:
            return -self.feebate_fees[160] * effectiveness
    
    def calculate_mrb(self, co2_gkm: float) -> float:
        """Calculate MRB"""
        for threshold, amount in sorted(self.mrb_bands.items(), reverse=True):
            if co2_gkm >= threshold:
                return amount
        return 0
    
    def calculate_bik(self, co2_gkm: float) -> float:
        """Calculate BIK"""
        for threshold, rate in sorted(self.bik_rates.items(), reverse=True):
            if co2_gkm >= threshold:
                return rate
        return 0.04

    def get_current_carbon_tax_rate(self, month: int) -> float:
        """Get current BC-style carbon tax rate in €/tonne CO2"""
        if not self.enable_bc_carbon_tax:
            return 0.0

        # Find the applicable rate based on month
        rate = 6.97  # Default to initial rate
        for month_threshold, tax_rate in sorted(self.carbon_tax_rates.items()):
            if month >= month_threshold:
                rate = tax_rate
        return rate

    def calculate_fuel_carbon_tax(self, fuel_type: str, liters: float, month: int) -> float:
        """Calculate BC-style carbon tax on fuel consumption in euros"""
        if not self.enable_bc_carbon_tax:
            return 0.0

        # Get fuel type mapping for carbon content
        fuel_mapping = {
            'petrol': 'gasoline',
            'diesel': 'diesel'
        }

        carbon_fuel_type = fuel_mapping.get(fuel_type, fuel_type)
        if carbon_fuel_type not in self.fuel_carbon_content:
            return 0.0

        # Calculate tax: liters * g_CO2_per_liter * tax_rate_per_tonne / (1000g/kg * 1000kg/tonne)
        carbon_content_g_per_liter = self.fuel_carbon_content[carbon_fuel_type]
        tax_rate_per_tonne = self.get_current_carbon_tax_rate(month)

        total_co2_tonnes = (liters * carbon_content_g_per_liter) / (1000 * 1000)
        tax_amount = total_co2_tonnes * tax_rate_per_tonne

        return tax_amount

    def calculate_annual_fuel_consumption(self, vehicle: Vehicle, agent: Agent) -> tuple[float, str]:
        """Calculate annual fuel consumption and return (liters, fuel_type)"""
        if vehicle.type == 'BEV-M':
            # Electric vehicle - return kWh as "liters" for consistency
            kwh_per_100km = 20
            annual_kwh = (kwh_per_100km * agent.driving_km / 100)
            return annual_kwh, 'electricity'
        else:
            # ICE/Hybrid vehicles
            if 'DIE' in vehicle.type:
                fuel_type = 'diesel'
                l_per_100km = 5.5
                real_world_multiplier = self.real_world_gap['diesel']
            elif 'HEV' in vehicle.type:
                fuel_type = 'petrol'
                l_per_100km = 4.5
                real_world_multiplier = self.real_world_gap['hybrid']
            else:  # ICE-S, ICE-M
                fuel_type = 'petrol'
                l_per_100km = 6.5
                real_world_multiplier = self.real_world_gap['petrol']

            vehicle_fuel_factor = vehicle.get_fuel_factor()
            age_deterioration = 1.0 + (agent.vehicle_age if agent.vehicle else 0) * 0.01

            real_l_per_100km = l_per_100km * vehicle_fuel_factor * real_world_multiplier * age_deterioration
            annual_liters = (real_l_per_100km * agent.driving_km / 100)

            return annual_liters, fuel_type

    def calculate_annual_fuel_cost(self, vehicle: Vehicle, agent: Agent, month: int) -> tuple[float, dict]:
        """Calculate annual fuel cost with breakdown of base cost vs carbon tax"""
        annual_consumption, fuel_type = self.calculate_annual_fuel_consumption(vehicle, agent)

        # Base fuel cost (without carbon tax)
        base_cost = self.fuel_prices[fuel_type] * annual_consumption

        # Carbon tax cost (BC system)
        carbon_tax_cost = 0.0
        if self.enable_bc_carbon_tax and fuel_type in ['petrol', 'diesel']:
            # Map fuel types for carbon tax calculation
            carbon_tax_cost = self.calculate_fuel_carbon_tax(fuel_type, annual_consumption, month)

        total_cost = base_cost + carbon_tax_cost

        # Return cost breakdown
        breakdown = {
            'base_cost': base_cost,
            'carbon_tax_cost': carbon_tax_cost,
            'total_cost': total_cost,
            'fuel_type': fuel_type,
            'annual_consumption': annual_consumption
        }

        return total_cost, breakdown

    def calculate_monthly_fuel_burden(self, agent: Agent, month: int) -> float:
        """Calculate monthly fuel cost burden as ratio of monthly income"""
        if not agent.vehicle:
            return 0.0

        # Get annual fuel cost (includes base cost + carbon tax)
        annual_fuel_cost, _ = self.calculate_annual_fuel_cost(agent.vehicle, agent, month)

        # Convert to monthly costs
        monthly_fuel_cost = annual_fuel_cost / 12
        monthly_income = agent.income / 12

        # Calculate burden ratio
        fuel_burden_ratio = monthly_fuel_cost / monthly_income if monthly_income > 0 else 0.0

        return fuel_burden_ratio

    def update_replacement_pressure(self):
        """Update replacement pressure for agents based on fuel cost burden (Policy B: fuel_tax)"""
        if not self.enable_bc_carbon_tax:
            return  # Only apply pressure when fuel tax is active

        for agent in self.agents:
            if not agent.vehicle or agent.will_never_buy_car:
                continue

            # Calculate current fuel burden
            fuel_burden_ratio = self.calculate_monthly_fuel_burden(agent, self.current_month)

            # If fuel burden exceeds threshold, increase replacement pressure
            if fuel_burden_ratio > agent.fuel_burden_threshold:
                agent.replacement_pressure += 0.02

                # If pressure becomes too high, force replacement consideration
                if agent.replacement_pressure > 0.15:
                    agent.replacement_due = True

    def calculate_tco(self, vehicle: Vehicle, agent: Agent, month: int) -> float:
        """Calculate Total Cost of Ownership"""
        bpm = self.calculate_bpm(vehicle.co2_gkm, month)
        feebate = self.calculate_feebate(vehicle.co2_gkm)
        upfront = vehicle.base_price + bpm - feebate
        
        mrb = self.calculate_mrb(vehicle.co2_gkm)
        bik = 0
        if agent.is_company_car:
            bik_rate = self.calculate_bik(vehicle.co2_gkm)
            bik = bik_rate * vehicle.base_price
        
        ownership_annual = mrb + bik

        # Use new fuel cost calculation method (includes base cost + carbon tax)
        fuel_annual, _ = self.calculate_annual_fuel_cost(vehicle, agent, month)
        
        horizon = 3
        ownership_total = ownership_annual * horizon
        fuel_total = fuel_annual * horizon
        
        w_own_effective = 1.0 if agent.is_company_car else self.w_own
        
        tco = (self.w_up * upfront + 
               w_own_effective * ownership_total + 
               self.w_fuel * fuel_total)
        
        return tco
    
    def calculate_vehicle_utility_with_breakdown(self, vehicle: Vehicle, agent: Agent, month: int) -> Tuple[float, Dict]:
        """Calculate utility with detailed breakdown for decision tracking"""
        if agent.will_never_buy_car:
            return -999999, {"never_buy_car": True}
        
        tco = self.calculate_tco(vehicle, agent, month)
        normalized_tco = tco / 1000.0
        
        # Calculate components separately for tracking
        performance_utility = self.lambda1_performance * vehicle.performance_score
        
        # Range penalty breakdown
        range_penalty = 0
        range_breakdown = {}
        if vehicle.type == 'BEV-M':
            base_penalty = self.lambda2_range_penalty * (self.range_penalty_decay ** month)
            rural_penalty = 2000 if not agent.is_urban else 0
            high_driving_penalty = 1000 if agent.driving_km > 15000 else 0
            
            range_penalty = base_penalty + rural_penalty + high_driving_penalty
            range_breakdown = {
                "base_penalty": base_penalty,
                "rural_penalty": rural_penalty,
                "high_driving_penalty": high_driving_penalty
            }
        
        social_proof_utility = self.lambda3_social_proof * agent.social_proof
        
        # Income factor
        income_factor = 0
        if vehicle.type == 'BEV-M' and agent.income > 60000:
            income_factor = 1000
        
        green_pref = np.random.normal(0, self.lambda4_green_pref / 5)
        
        # Company car boost
        company_car_boost = 0
        if agent.is_company_car and vehicle.co2_gkm <= 110:
            company_car_boost = 2000
        
        # Cycling penalty - strengthened for Dutch culture
        cycling_penalty = agent.cycling_preference * 4000  # Increased base penalty
        if agent.is_urban and agent.cycling_preference > 0.5:  # Lower threshold
            cycling_penalty += 2000  # Higher additional penalty
        elif not agent.is_urban and agent.cycling_preference > 0.4:  # Rural cycling culture
            cycling_penalty += 1000
        
        # Calculate policy benefits for tracking
        policy_benefits = {}
        if month > 0:
            bpm = self.calculate_bpm(vehicle.co2_gkm, month)
            feebate = self.calculate_feebate(vehicle.co2_gkm)
            mrb = self.calculate_mrb(vehicle.co2_gkm)
            
            policy_benefits = {
                "bpm_tax": -bpm,
                "feebate_rebate": feebate,
                "mrb_annual": -mrb,
                "total_policy_benefit": -bpm + feebate - (mrb * 3)
            }
        
        utility = (-normalized_tco + 
                  performance_utility - 
                  range_penalty + 
                  social_proof_utility + 
                  green_pref + 
                  income_factor + 
                  company_car_boost - 
                  cycling_penalty)
        
        # Detailed breakdown for decision tracking
        breakdown = {
            "tco": -normalized_tco,
            "performance": performance_utility,
            "range_penalty": -range_penalty,
            "range_breakdown": range_breakdown,
            "social_proof": social_proof_utility,
            "green_preference": green_pref,
            "income_factor": income_factor,
            "company_boost": company_car_boost,
            "cycling_penalty": -cycling_penalty,
            "policy_benefits": policy_benefits,
            "total_utility": utility
        }
        
        return utility, breakdown
    
    def update_social_proof(self):
        """Update social proof for all agents - FIXED: handle empty case"""
        agents_with_vehicles = [a for a in self.agents if a.vehicle]
        
        if not agents_with_vehicles:
            # If no one has vehicles yet, set low social proof for all
            for agent in self.agents:
                agent.social_proof = 0.1
            return
            
        low_co2_agents = [a for a in agents_with_vehicles if a.vehicle.co2_gkm <= 110]
        low_co2_rate = len(low_co2_agents) / len(agents_with_vehicles)
        
        very_low_co2_agents = [a for a in agents_with_vehicles if a.vehicle.co2_gkm <= 50]
        very_low_co2_rate = len(very_low_co2_agents) / len(agents_with_vehicles)
        
        for agent in self.agents:
            base_social_proof = low_co2_rate * 0.7
            very_low_boost = very_low_co2_rate * 0.3
            urban_multiplier = 1.2 if agent.is_urban else 0.8
            noise = np.random.normal(0, 0.03)
            
            combined_effect = (base_social_proof + very_low_boost) * urban_multiplier + noise
            agent.social_proof = max(0, min(1, combined_effect))
    
    def apply_learning_effects(self):
        """Apply experience curve effects"""
        for vtype in ['BEV-M', 'HEV-S']:
            if self.cumulative_sales[vtype] > 200:
                cumulative_thousands = self.cumulative_sales[vtype] / 1000.0
                price_reduction = min(0.15, cumulative_thousands * 0.02)
                target_price_factor = 1 - price_reduction
                
                current_factor = self.vehicles[vtype].base_price / (35000 if vtype == 'BEV-M' else 24000)
                adjustment_rate = 0.95
                new_factor = current_factor * adjustment_rate + target_price_factor * (1 - adjustment_rate)
                
                if vtype == 'BEV-M':
                    self.vehicles[vtype].base_price = 35000 * new_factor
                else:
                    self.vehicles[vtype].base_price = 24000 * new_factor
    
    def simulate_month_with_tracking(self):
        """Enhanced month simulation with detailed decision tracking"""
        # Update social proof and learning effects
        self.update_social_proof()
        self.apply_learning_effects()

        # Update fuel cost pressure system (Policy B: fuel_tax)
        self.update_replacement_pressure()
        
        # Track decisions this month
        monthly_decision_data = {
            'month': self.current_month,
            'year': (self.current_month // 12) + 1,
            'decisions': [],
            'policy_impacts': [],
            'market_summary': {}
        }
        
        purchases_this_month = []
        bev_sales_this_month = 0
        current_bev_cap = self.get_current_bev_supply_cap()
        
        # Decision tracking variables
        policy_influenced_decisions = 0
        cycling_prevented_purchases = 0
        supply_constrained_bev = 0
        high_income_bev_adopters = 0
        company_car_low_co2_adopters = 0
        
        for agent in self.agents:
            if agent.will_never_buy_car:
                continue
                
            should_consider_buying = (not agent.vehicle) or agent.replacement_due
            
            if should_consider_buying:
                base_hazard = self.base_hazard_replacement if agent.replacement_due else self.base_hazard_new
                
                # Apply cycling preference reduction - strengthened
                cycling_reduction = 0
                if not agent.vehicle:
                    # Stronger cycling culture impact
                    cycling_reduction = agent.cycling_preference * 0.7  # Increased from 0.5
                    if agent.is_urban:
                        cycling_reduction += 0.1  # Extra urban cycling culture
                    base_hazard *= (1 - cycling_reduction)
                    if cycling_reduction > 0.25:  # Lower threshold
                        cycling_prevented_purchases += 1
                
                # Calculate utilities with breakdown
                utilities = {}
                breakdowns = {}
                for vtype, vehicle in self.vehicles.items():
                    util, breakdown = self.calculate_vehicle_utility_with_breakdown(vehicle, agent, self.current_month)
                    utilities[vtype] = util
                    breakdowns[vtype] = breakdown
                
                best_vehicle_type = max(utilities, key=utilities.get)
                best_utility = utilities[best_vehicle_type]
                best_breakdown = breakdowns[best_vehicle_type]
                
                # Apply BEV supply constraints
                original_choice = best_vehicle_type
                if best_vehicle_type == 'BEV-M' and bev_sales_this_month >= current_bev_cap:
                    supply_constrained_bev += 1
                    non_bev_utilities = {k: v for k, v in utilities.items() if k != 'BEV-M'}
                    if non_bev_utilities:
                        best_vehicle_type = max(non_bev_utilities, key=non_bev_utilities.get)
                        best_utility = non_bev_utilities[best_vehicle_type]
                        best_breakdown = breakdowns[best_vehicle_type]
                
                # Decision to buy - CORRECTED: more restrictive for Dutch culture
                if best_utility > -40000:  # More restrictive threshold reflecting Dutch resistance
                    utility_factor = max(0.001, 1 / (1 + np.exp(-best_utility / self.decision_noise)))
                    buy_probability = utility_factor * base_hazard
                    
                    if agent.replacement_due:
                        buy_probability = max(buy_probability, 0.01)  # Higher minimum
                    
                    if np.random.random() < buy_probability:
                        # Make purchase
                        agent.vehicle = copy.deepcopy(self.vehicles[best_vehicle_type])
                        agent.vehicle_age = 0
                        agent.replacement_due = False
                        agent.last_decision_month = self.current_month
                        agent.decision_utility_breakdown = best_breakdown
                        
                        purchases_this_month.append(best_vehicle_type)
                        self.cumulative_sales[best_vehicle_type] += 1
                        
                        if best_vehicle_type == 'BEV-M':
                            bev_sales_this_month += 1
                        
                        # Track decision reasons
                        decision_reason = self._determine_decision_reason(agent, best_vehicle_type, best_breakdown, original_choice)
                        agent.last_decision_reason = decision_reason
                        
                        # Count specific decision types for reporting
                        if "policy benefit" in decision_reason.lower():
                            policy_influenced_decisions += 1
                        if best_vehicle_type == 'BEV-M' and agent.income > 60000:
                            high_income_bev_adopters += 1
                        if agent.is_company_car and agent.vehicle.co2_gkm <= 110:
                            company_car_low_co2_adopters += 1
                        
                        # Store detailed decision data
                        monthly_decision_data['decisions'].append({
                            'agent_id': agent.id,
                            'vehicle_type': best_vehicle_type,
                            'reason': decision_reason,
                            'utility_breakdown': best_breakdown,
                            'agent_characteristics': {
                                'income': agent.income,
                                'is_company_car': agent.is_company_car,
                                'is_urban': agent.is_urban,
                                'cycling_preference': agent.cycling_preference,
                                'driving_km': agent.driving_km
                            }
                        })
        
        # Store monthly decision tracking data
        monthly_decision_data['market_summary'] = {
            'total_purchases': len(purchases_this_month),
            'policy_influenced': policy_influenced_decisions,
            'cycling_prevented': cycling_prevented_purchases,
            'bev_supply_constrained': supply_constrained_bev,
            'high_income_bev_adopters': high_income_bev_adopters,
            'company_car_low_co2_adopters': company_car_low_co2_adopters,
            'bev_sales': bev_sales_this_month,
            'bev_supply_cap': current_bev_cap
        }
        
        self.decision_tracking['monthly_decisions'].append(monthly_decision_data)
        
        # Age existing vehicles and check for replacement
        for agent in self.agents:
            if agent.vehicle:
                agent.vehicle_age += 1
                if agent.vehicle_age > 12 and not agent.replacement_due:
                    replacement_prob = min(0.15, 0.02 + (agent.vehicle_age - 12) * 0.015)
                    if np.random.random() < replacement_prob:
                        agent.replacement_due = True
        
        # Record regular monthly outputs
        self._record_monthly_outputs(purchases_this_month)
        
        # Record annual outputs every 12 months
        if (self.current_month + 1) % 12 == 0:
            self._record_annual_outputs()
        
        # Generate 3-year reports every 36 months
        if (self.current_month + 1) % 36 == 0 and self.current_month >= 35:
            self._generate_three_year_report()
        
        # Capture monthly agent data for visualization
        self._capture_monthly_agent_data()
        
        self.current_month += 1
    
    def _determine_decision_reason(self, agent: Agent, vehicle_type: str, breakdown: Dict, original_choice: str) -> str:
        """Determine the primary reason for an agent's vehicle purchase decision"""
        reasons = []
        
        # Check for policy influence
        if 'policy_benefits' in breakdown and breakdown['policy_benefits'].get('total_policy_benefit', 0) > 1000:
            policy_benefit = breakdown['policy_benefits']['total_policy_benefit']
            reasons.append(f"Policy benefits (€{policy_benefit:.0f} over 3 years)")
        
        # Check for supply constraint impact
        if original_choice == 'BEV-M' and vehicle_type != 'BEV-M':
            reasons.append("Electric vehicle supply constraints forced alternative choice")
        
        # Check for company car influence
        if agent.is_company_car and breakdown.get('company_boost', 0) > 0:
            reasons.append("Company car tax advantages for low-emission vehicles")
        
        # Check for high income BEV adoption
        if vehicle_type == 'BEV-M' and agent.income > 60000:
            reasons.append("High income early electric vehicle adoption")
        
        # Check for cycling preference impact
        if breakdown.get('cycling_penalty', 0) < -2000:
            reasons.append("Strong cycling preference nearly prevented purchase")
        
        # Check for range anxiety
        if vehicle_type != 'BEV-M' and 'range_breakdown' in breakdown:
            range_penalty = breakdown.get('range_penalty', 0)
            if range_penalty < -3000:
                reasons.append("Range anxiety prevented electric vehicle choice")
        
        # Check for social proof influence
        if breakdown.get('social_proof', 0) > 1000:
            reasons.append("Social influence toward low-emission vehicles")
        
        # Default reasons if no specific factors identified
        if not reasons:
            if vehicle_type == 'BEV-M':
                reasons.append("Environmental preference and performance")
            elif vehicle_type in ['HEV-S']:
                reasons.append("Compromise between efficiency and familiarity")
            else:
                reasons.append("Traditional vehicle preference and cost considerations")
        
        return "; ".join(reasons)
    
    def _capture_monthly_agent_data(self):
        """Capture detailed agent data for each month for visualization"""
        monthly_snapshot = {
            'month': self.current_month,
            'year': (self.current_month // 12) + 1,
            'agents': []
        }
        
        for agent in self.agents:
            agent_data = {
                'id': agent.id,
                'income': float(agent.income),
                'driving_km': float(agent.driving_km),  # Base driving distance
                'actual_driving_km': float(agent.driving_km),  # Policy-adjusted driving distance
                'is_urban': bool(agent.is_urban),
                'is_company_car': bool(agent.is_company_car),
                'cycling_preference': float(agent.cycling_preference),
                'will_never_buy_car': bool(agent.will_never_buy_car),
                'vehicle_info': None,
                'emission_level': 1,  # Level 1: No emission (cycling/walking)
                'emission_volume_category': 'no-vehicle',
                'annual_co2_kg': 0.0
            }
            
            if agent.vehicle:
                # Use policy-specific emissions calculation
                annual_co2_kg = self.calculate_agent_annual_emissions(agent)
                actual_driving_km = self.get_agent_actual_driving_distance(agent)

                agent_data['actual_driving_km'] = float(actual_driving_km)
                agent_data.update({
                    'vehicle_info': {
                        'type': str(agent.vehicle.type),
                        'example_band': str(agent.vehicle.example_band),
                        'co2_gkm': float(agent.vehicle.co2_gkm),
                        'base_price': float(agent.vehicle.base_price),
                        'performance_score': float(agent.vehicle.performance_score),
                        'age': int(agent.vehicle_age)
                    },
                    'emission_level': int(self.get_emission_level(agent.vehicle.co2_gkm)),
                    'emission_volume_category': str(self.get_emission_volume_category(agent)),
                    'annual_co2_kg': float(annual_co2_kg)
                })
            
            monthly_snapshot['agents'].append(agent_data)
        
        self.monthly_agent_data.append(monthly_snapshot)
        
        # Update visualization data structure
        self.visualization_data['agent_snapshots'] = self.monthly_agent_data
    
    def clear_previous_simulation_data(self):
        """Clear data from previous simulation to save memory"""
        self.monthly_agent_data = []
        self.monthly_outputs = []
        self.annual_outputs = []
        self.decision_tracking = {
            'monthly_decisions': [],
            'policy_attributions': [],
            'utility_breakdowns': []
        }
        self.three_year_reports = []
        self.visualization_data['agent_snapshots'] = []
        print("Previous simulation data cleared")
    
    def export_visualization_data(self, filename: str = "netherlands_simulation_visualization_data.json"):
        """Export detailed monthly agent data for frontend visualization"""
        
        # Calculate summary statistics for each month
        monthly_summaries = []
        for snapshot in self.monthly_agent_data:
            agents_with_vehicles = [a for a in snapshot['agents'] if a['vehicle_info'] is not None]
            
            # Emission level distribution
            emission_levels = {}
            for i in range(1, 6):
                emission_levels[i] = len([a for a in snapshot['agents'] if a['emission_level'] == i])
            
            # Emission volume categories
            volume_categories = {}
            for category in ['zero-emissions', 'very-low', 'low', 'moderate', 'high', 'very-high', 'no-vehicle']:
                volume_categories[category] = len([a for a in snapshot['agents'] 
                                                 if a['emission_volume_category'] == category])
            
            # Vehicle type distribution
            vehicle_types = {}
            for agent in agents_with_vehicles:
                vtype = agent['vehicle_info']['type']
                vehicle_types[vtype] = vehicle_types.get(vtype, 0) + 1
            
            # Average emissions
            total_annual_co2 = sum(a['annual_co2_kg'] for a in snapshot['agents'])
            avg_co2_per_agent = total_annual_co2 / len(snapshot['agents']) if snapshot['agents'] else 0
            
            monthly_summary = {
                'month': int(snapshot['month']),
                'year': int(snapshot['year']),
                'total_agents': int(len(snapshot['agents'])),
                'agents_with_vehicles': int(len(agents_with_vehicles)),
                'car_ownership_rate': float(len(agents_with_vehicles) / len(snapshot['agents'])) if snapshot['agents'] else 0.0,
                'emission_level_distribution': {int(k): int(v) for k, v in emission_levels.items()},
                'emission_volume_distribution': {str(k): int(v) for k, v in volume_categories.items()},
                'vehicle_type_distribution': {str(k): int(v) for k, v in vehicle_types.items()},
                'total_annual_co2_tonnes': float(total_annual_co2 / 1000),  # Convert to tonnes
                'avg_co2_per_agent_kg': float(avg_co2_per_agent)
            }
            monthly_summaries.append(monthly_summary)
        
        # Prepare export data
        export_data = {
            'simulation_metadata': {
                'n_agents': int(self.n_agents),
                'time_horizon_months': int(self.time_horizon),
                'time_horizon_years': float(self.time_horizon / 12),
                'total_months_simulated': int(len(self.monthly_agent_data)),
                'generation_timestamp': str(datetime.now().isoformat())
            },
            'reference_data': self.visualization_data['metadata'],
            'monthly_summaries': monthly_summaries,
            'detailed_agent_data': self.monthly_agent_data,
            'policy_parameters': {
                'bpm_thresholds': self.bpm_thresholds,
                'feebate_rebates': self.feebate_rebates,
                'feebate_fees': self.feebate_fees,
                'mrb_bands': self.mrb_bands,
                'bik_rates': self.bik_rates
            },
            'vehicle_archetypes': {
                vtype: {
                    'type': vehicle.type,
                    'example_band': vehicle.example_band,
                    'co2_gkm': vehicle.co2_gkm,
                    'base_price': vehicle.base_price,
                    'performance_score': vehicle.performance_score,
                    'emission_level': self.get_emission_level(vehicle.co2_gkm),
                    'display_name': self.get_vehicle_display_name(vtype)
                } for vtype, vehicle in self.vehicles.items()
            }
        }
        
        with open(filename, 'w') as f:
            json.dump(export_data, f, indent=2)
        
        file_size_mb = os.path.getsize(filename) / (1024 * 1024)
        print(f"Exported visualization data to {filename}")
        print(f"File size: {file_size_mb:.1f} MB")
        print(f"Contains {len(self.monthly_agent_data)} months of detailed agent data")
        print(f"Ready for frontend visualization and analysis")
        
        return filename
    
    def export_agents_to_excel(self, filename: str = "agents_monthly_tracking.xlsx"):
        """Export simplified monthly tracking of all agents to Excel file (or CSV if openpyxl not available)"""
        if not self.monthly_agent_data:
            print("No agent data available. Run simulation first.")
            return None
            
        print(f"Exporting {len(self.monthly_agent_data)} months of data for {self.n_agents} agents...")
        
        # Create a list to store all rows - simplified structure
        all_rows = []
        
        for month_data in self.monthly_agent_data:
            month = month_data['month']
            year = month_data['year']
            
            for agent_data in month_data['agents']:
                # Determine vehicle type (show Cycling/Walking for no-car agents)
                if agent_data['vehicle_info']:
                    vehicle_type = agent_data['vehicle_info']['type']
                    emission_level = agent_data['emission_level']
                else:
                    vehicle_type = 'Cycling/Walking'
                    emission_level = 1  # Level 1: No emissions for cycling/walking (same as electric)
                
                row = {
                    'Month': month,
                    'Year': year,
                    'Agent_ID': agent_data['id'],
                    'Vehicle_Type': vehicle_type,
                    'Emission_Level': emission_level
                }
                all_rows.append(row)
        
        # Create DataFrame
        df = pd.DataFrame(all_rows)
        
        # Try Excel export first, fallback to CSV if openpyxl not available
        try:
            # Create simple Excel file with just the essential data
            with pd.ExcelWriter(filename, engine='openpyxl') as writer:
                # Main data sheet - only essential columns
                df.to_excel(writer, sheet_name='Agent_Data', index=False)
                
                # Simple summary showing vehicle type distribution by month
                monthly_summary = df.groupby(['Month', 'Year', 'Vehicle_Type']).size().reset_index(name='Count')
                monthly_pivot = monthly_summary.pivot_table(
                    index=['Month', 'Year'], 
                    columns='Vehicle_Type', 
                    values='Count', 
                    fill_value=0
                ).reset_index()
                
                monthly_pivot.to_excel(writer, sheet_name='Monthly_Summary', index=False)
            
            file_size_mb = os.path.getsize(filename) / (1024 * 1024)
            print(f"✅ Excel file exported: {filename}")
            print(f"📊 File size: {file_size_mb:.1f} MB")
            print(f"📋 Contains {len(all_rows)} rows of agent data across {len(self.monthly_agent_data)} months")
            print(f"📈 Sheets: Agent_Data (main), Monthly_Summary (vehicle counts by month)")
            
        except ImportError:
            print(f"⚠️  openpyxl not available. Exporting to CSV instead...")
            # Export main data to CSV
            csv_filename = filename.replace('.xlsx', '.csv')
            df.to_csv(csv_filename, index=False)
            
            # Export summary data to separate CSV
            monthly_summary = df.groupby(['Month', 'Year', 'Vehicle_Type']).size().reset_index(name='Count')
            monthly_pivot = monthly_summary.pivot_table(
                index=['Month', 'Year'], 
                columns='Vehicle_Type', 
                values='Count', 
                fill_value=0
            ).reset_index()
            
            summary_filename = filename.replace('.xlsx', '_summary.csv')
            monthly_pivot.to_csv(summary_filename, index=False)
            
            file_size_mb = os.path.getsize(csv_filename) / (1024 * 1024)
            print(f"✅ CSV files exported: {csv_filename} and {summary_filename}")
            print(f"📊 Main file size: {file_size_mb:.1f} MB")
            print(f"📋 Contains {len(all_rows)} rows of agent data across {len(self.monthly_agent_data)} months")
            print(f"💡 To get Excel format with multiple sheets, install: pip install openpyxl")
            
            filename = csv_filename
        
        return filename
    
    def export_simulation_to_json(self, output_path: str = "../outputs/simulation_data.json"):
        """Export simulation data to JSON format for web visualization"""
        if not self.monthly_agent_data:
            print("No agent data available. Run simulation first.")
            return None
            
        print(f"Exporting simulation data to JSON format...")
        
        # Convert data to visualization-friendly format
        frames = []
        
        for month_data in self.monthly_agent_data:
            month = month_data['month']
            year = month_data['year']
            
            # Create agents array for this frame
            agents = []
            clean_types = ['BEV-M', 'Cycling/Walking', 'HEV-S']
            
            for agent_data in month_data['agents']:
                # Determine vehicle type and emission level
                if agent_data['vehicle_info']:
                    vehicle_type = agent_data['vehicle_info']['type']
                    emission_level = agent_data['emission_level']
                else:
                    vehicle_type = 'Cycling/Walking'
                    emission_level = 1  # No emissions for cycling/walking
                
                agents.append({
                    "id": agent_data['id'],
                    "type": vehicle_type,
                    "emission_level": emission_level
                })
            
            # Calculate adoption rate (clean transport adoption)
            clean_count = sum(1 for agent in agents if agent['type'] in clean_types)
            adoption_rate = clean_count / len(agents) if agents else 0
            
            # Format time label
            month_in_year = ((month - 1) % 12) + 1
            year_num = ((month - 1) // 12) + 1
            
            frames.append({
                "t": f"Year {year_num}, Month {month_in_year}",
                "agents": agents,
                "adoptionRate": adoption_rate
            })
        
        # Write JSON file
        try:
            # Create output directory if it doesn't exist
            output_dir = os.path.dirname(output_path)
            if output_dir and not os.path.exists(output_dir):
                os.makedirs(output_dir)
                
            with open(output_path, 'w') as f:
                json.dump(frames, f, indent=2)
            
            file_size_mb = os.path.getsize(output_path) / (1024 * 1024)
            print(f"✅ JSON file exported: {output_path}")
            print(f"📊 File size: {file_size_mb:.1f} MB")
            print(f"📋 Contains {len(frames)} frames with {len(agents)} agents each")
            print(f"🎯 Format: Ready for web visualization")
            
            return output_path
            
        except Exception as e:
            print(f"❌ Error exporting JSON: {e}")
            return None
    
    def plot_emission_and_vehicle_trends(self):
        """Plot policy-specific 15-year trends of emission levels and vehicle choices"""
        if not self.monthly_agent_data:
            print("No agent data available. Run simulation first.")
            return
            
        # Prepare data for plotting
        months = []
        emission_distributions = []
        vehicle_distributions = []
        
        for month_data in self.monthly_agent_data:
            months.append(month_data['month'])
            
            # Count emission levels
            emission_counts = {1: 0, 2: 0, 3: 0, 4: 0}
            vehicle_counts = {'Cycling/Walking': 0, 'BEV-M': 0, 'HEV-S': 0, 'ICE-S': 0, 'DIE-M': 0, 'ICE-M': 0}
            
            for agent in month_data['agents']:
                emission_level = agent['emission_level']
                # Handle any emission levels outside 1-4 range (safety check)
                if emission_level in emission_counts:
                    emission_counts[emission_level] += 1
                else:
                    # Map any invalid levels to appropriate category
                    if emission_level == 0:
                        emission_counts[1] += 1  # Map old level 0 to level 1 (no emission)
                    else:
                        print(f"Warning: Unexpected emission level {emission_level} found")
                
                # Get vehicle type from the correct field
                if agent['vehicle_info']:
                    vehicle_type = agent['vehicle_info']['type']
                else:
                    vehicle_type = 'Cycling/Walking'
                
                if vehicle_type in vehicle_counts:
                    vehicle_counts[vehicle_type] += 1
            
            emission_distributions.append(emission_counts)
            vehicle_distributions.append(vehicle_counts)
        
        # Create plots
        # Create policy-specific title
        if self.policy_type == 'vehicle_tax':
            policy_name = 'Netherlands Vehicle Purchase Tax (BPM/Feebate)'
        elif self.policy_type == 'fuel_tax':
            policy_name = 'British Columbia Fuel Carbon Tax'
        else:
            policy_name = 'Unknown Policy'

        fig, axes = plt.subplots(2, 3, figsize=(20, 12))
        fig.suptitle(f'Policy Impact Analysis: {policy_name} - 15 Year Trends (100 Agents)',
                     fontsize=16, fontweight='bold')
        
        # Convert to years for x-axis
        years = [m/12 + 1 for m in months]
        
        # 1. Emission Level Distribution Over Time (Stacked Area)
        emission_data = {}
        for level in [1, 2, 3, 4]:
            emission_data[level] = [dist[level] for dist in emission_distributions]
        
        axes[0,0].stackplot(years, 
                           emission_data[1], emission_data[2], emission_data[3], emission_data[4],
                           labels=['Level 1 (No Emission - Cycling/Electric)', 'Level 2 (Light - Hybrid)', 'Level 3 (Mid - Small Petrol/Diesel)', 'Level 4 (High - Mid Petrol)'],
                           colors=['green', 'lightgreen', 'orange', 'red'], alpha=0.7)
        axes[0,0].set_title('Emission Level Distribution Over Time')
        axes[0,0].set_xlabel('Year')
        axes[0,0].set_ylabel('Number of Agents')
        axes[0,0].legend(loc='upper right')
        axes[0,0].grid(True, alpha=0.3)
        
        # 2. Vehicle Type Market Share Over Time
        vehicle_data = {}
        for vtype in ['Cycling/Walking', 'BEV-M', 'HEV-S', 'ICE-S', 'DIE-M', 'ICE-M']:
            vehicle_data[vtype] = [dist[vtype]/100*100 for dist in vehicle_distributions]  # Convert to percentage
        
        for vtype, color in zip(['BEV-M', 'HEV-S', 'ICE-S', 'DIE-M', 'ICE-M'], ['green', 'orange', 'blue', 'brown', 'red']):
            axes[0,1].plot(years, vehicle_data[vtype], label=vtype, linewidth=2, color=color)
        
        axes[0,1].set_title('Vehicle Type Market Share Over Time')
        axes[0,1].set_xlabel('Year')
        axes[0,1].set_ylabel('Market Share (%)')
        axes[0,1].legend()
        axes[0,1].grid(True, alpha=0.3)
        
        # 3. Car Ownership Rate vs No-Vehicle Rate
        car_owners = [100 - dist['Cycling/Walking'] for dist in vehicle_distributions]
        no_vehicle = [dist['Cycling/Walking'] for dist in vehicle_distributions]
        
        axes[1,0].plot(years, [c/100*100 for c in car_owners], label='Car Owners', linewidth=3, color='blue')
        axes[1,0].plot(years, [n/100*100 for n in no_vehicle], label='No Vehicle (Cycling/Walking)', linewidth=3, color='lightblue')
        axes[1,0].set_title('Car Ownership vs No-Vehicle Rates')
        axes[1,0].set_xlabel('Year')
        axes[1,0].set_ylabel('Percentage of Agents')
        axes[1,0].legend()
        axes[1,0].grid(True, alpha=0.3)
        
        # 4. Clean vs Polluting Vehicle Trends
        clean_vehicles = [emission_data[1][i] + emission_data[2][i] for i in range(len(months))]
        polluting_vehicles = [emission_data[3][i] + emission_data[4][i] for i in range(len(months))]
        
        axes[1,1].plot(years, [c/100*100 for c in clean_vehicles], label='Clean (No Vehicle + Electric + Hybrid)', 
                      linewidth=3, color='green')
        axes[1,1].plot(years, [p/100*100 for p in polluting_vehicles], label='Polluting (ICE Vehicles)', 
                      linewidth=3, color='red')
        axes[1,1].set_title('Clean vs Polluting Transport Choices')
        axes[1,1].set_xlabel('Year')
        axes[1,1].set_ylabel('Percentage of Agents')
        axes[1,1].legend()
        axes[1,1].grid(True, alpha=0.3)

        # 5. Average Emissions per Agent (Policy-Specific Behavior)
        avg_emissions_per_agent = []
        avg_driving_distance = []

        for month_data in self.monthly_agent_data:
            # Calculate average emissions per agent for this month
            total_emissions = sum(agent['annual_co2_kg'] for agent in month_data['agents'])
            avg_emissions = total_emissions / len(month_data['agents'])
            avg_emissions_per_agent.append(avg_emissions)

            # Calculate average actual driving distance
            agents_with_cars = [agent for agent in month_data['agents'] if agent['vehicle_info']]
            if agents_with_cars:
                avg_driving = sum(agent['actual_driving_km'] for agent in agents_with_cars) / len(agents_with_cars)
            else:
                avg_driving = 0
            avg_driving_distance.append(avg_driving)

        # Plot emissions per agent
        axes[0,2].plot(years, avg_emissions_per_agent, linewidth=3, color='purple', marker='o')

        if self.policy_type == 'vehicle_tax':
            axes[0,2].set_title('Policy A Behavior: Emissions per Agent\n(Vehicle switching, driving stays same)')
        elif self.policy_type == 'fuel_tax':
            axes[0,2].set_title('Policy B Behavior: Emissions per Agent\n(Driving reduction + some vehicle switching)')
        else:
            axes[0,2].set_title('Average Emissions per Agent')

        axes[0,2].set_xlabel('Year')
        axes[0,2].set_ylabel('Annual CO2 Emissions (kg)')
        axes[0,2].grid(True, alpha=0.3)

        # Plot average driving distance for car owners
        axes[1,2].plot(years, avg_driving_distance, linewidth=3, color='darkblue', marker='s')

        if self.policy_type == 'vehicle_tax':
            axes[1,2].set_title('Policy A: Avg Driving Distance\n(Stable - no driving reduction)')
        elif self.policy_type == 'fuel_tax':
            axes[1,2].set_title('Policy B: Avg Driving Distance\n(Reduced to save on fuel costs)')
        else:
            axes[1,2].set_title('Average Driving Distance (Car Owners)')

        axes[1,2].set_xlabel('Year')
        axes[1,2].set_ylabel('Kilometers per Year')
        axes[1,2].grid(True, alpha=0.3)

        # Add policy-specific milestone markers
        if self.policy_type == 'vehicle_tax':
            # Netherlands vehicle tax milestones
            for ax in axes.flat:
                ax.axvline(x=3, color='red', linestyle='--', alpha=0.5,
                          label='BPM Threshold: 95g CO2' if ax == axes[0,0] else '')
                ax.axvline(x=6, color='orange', linestyle='--', alpha=0.5,
                          label='BPM Threshold: 80g CO2' if ax == axes[0,0] else '')

        elif self.policy_type == 'fuel_tax':
            # BC fuel carbon tax milestones
            for ax in axes.flat:
                ax.axvline(x=2, color='green', linestyle='--', alpha=0.5,
                          label='Carbon Tax: €13.94/tonne' if ax == axes[0,0] else '')
                ax.axvline(x=4, color='darkgreen', linestyle='--', alpha=0.5,
                          label='Carbon Tax: €20.89/tonne' if ax == axes[0,0] else '')
        
        plt.tight_layout()
        plt.show()
        
        # Print summary statistics
        print(f"\n{'='*60}")
        print(f"15-YEAR SIMULATION SUMMARY")
        print(f"{'='*60}")
        
        final_emission = emission_distributions[-1]
        final_vehicles = vehicle_distributions[-1]
        
        print(f"\nFINAL STATE (Year 15):")
        print(f"  Emission Level 1 (No Emission - Cycling/Electric): {final_emission[1]} agents ({final_emission[1]/100*100:.1f}%)")
        print(f"  Emission Level 2 (Light - Hybrid): {final_emission[2]} agents ({final_emission[2]/100*100:.1f}%)")
        print(f"  Emission Level 3 (Mid - Small Petrol/Diesel): {final_emission[3]} agents ({final_emission[3]/100*100:.1f}%)")
        print(f"  Emission Level 4 (High - Mid Petrol): {final_emission[4]} agents ({final_emission[4]/100*100:.1f}%)")
        
        print(f"\nVEHICLE TYPE BREAKDOWN:")
        for vtype, count in final_vehicles.items():
            if count > 0:
                print(f"  {vtype}: {count} agents ({count/100*100:.1f}%)")
        
        clean_final = final_emission[1] + final_emission[2]
        polluting_final = final_emission[3] + final_emission[4]
        print(f"\nCLEAN TRANSPORT ADOPTION: {clean_final}/100 agents ({clean_final/100*100:.1f}%)")
        print(f"POLLUTING TRANSPORT: {polluting_final}/100 agents ({polluting_final/100*100:.1f}%)")
        
        print(f"\n{'='*60}\n")
    
    
    def _generate_three_year_report(self):
        """Generate enhanced 3-year report with better formatting and comparisons"""
        year_end = (self.current_month + 1) // 12
        year_start = year_end - 2
        
        print(f"\n{'='*80}")
        print(f"NETHERLANDS CO2 POLICY IMPACT REPORT - YEARS {year_start} to {year_end}")
        print(f"{'='*80}")
        
        # Get recent decision data (last 36 months)
        recent_decisions = [d for d in self.decision_tracking['monthly_decisions'] 
                          if d['month'] >= self.current_month - 35]
        
        # Market overview with enhanced formatting
        total_sales = sum(len(d['decisions']) for d in recent_decisions)
        vehicle_sales_by_type = {}
        for d in recent_decisions:
            for decision in d['decisions']:
                vtype = decision['vehicle_type']
                vehicle_sales_by_type[vtype] = vehicle_sales_by_type.get(vtype, 0) + 1
        
        # Get historical comparison data
        period_key = f"{year_start}-{year_end}"
        self.historical_sales_by_period[period_key] = vehicle_sales_by_type.copy()
        
        print(f"\nMARKET OVERVIEW (Years {year_start}-{year_end})")
        print(f"Total vehicle sales: {total_sales:,}")
        print("\nSales by vehicle type:")
        
        for vtype, sales in sorted(vehicle_sales_by_type.items()):
            display_name = self.get_vehicle_display_name(vtype)
            share = (sales / total_sales * 100) if total_sales > 0 else 0
            co2 = self.vehicles[vtype].co2_gkm
            co2_context = self.get_co2_context(co2)
            
            # Calculate trend vs previous period
            prev_period_key = f"{year_start-3}-{year_end-3}"
            trend_text = ""
            if prev_period_key in self.historical_sales_by_period:
                prev_sales = self.historical_sales_by_period[prev_period_key].get(vtype, 0)
                prev_total = sum(self.historical_sales_by_period[prev_period_key].values())
                if prev_total > 0:
                    prev_share = prev_sales / prev_total * 100
                    share_change = share - prev_share
                    if abs(share_change) > 1.0:
                        direction = "up" if share_change > 0 else "down"
                        trend_text = f", {abs(share_change):.1f}% {direction} from previous period"
            
            print(f"  {display_name}: {sales:,} sales ({share:.1f}%{trend_text})")
            print(f"    Emission level: {co2}g CO2/km ({co2_context})")
        
        # Policy impact analysis
        policy_influenced = sum(d['market_summary']['policy_influenced'] for d in recent_decisions)
        bev_constrained = sum(d['market_summary']['bev_supply_constrained'] for d in recent_decisions)
        high_income_bev = sum(d['market_summary']['high_income_bev_adopters'] for d in recent_decisions)
        company_low_co2 = sum(d['market_summary']['company_car_low_co2_adopters'] for d in recent_decisions)
        cycling_prevented = sum(d['market_summary']['cycling_prevented'] for d in recent_decisions)
        
        print(f"\nPOLICY EFFECTIVENESS ANALYSIS")
        policy_influence_rate = (policy_influenced / total_sales * 100) if total_sales > 0 else 0
        print(f"Policy-influenced purchases: {policy_influenced:,} agents ({policy_influence_rate:.1f} of all sales)")
        print(f"Company car tax driving low-emission adoption: {company_low_co2:,} purchases")
        print(f"High-income early electric vehicle adoption: {high_income_bev:,} purchases")
        print(f"Electric vehicle sales limited by supply: {bev_constrained:,} lost sales")
        
        # Environmental impact
        if total_sales > 0:
            weighted_co2 = sum(self.vehicles[vtype].co2_gkm * sales 
                             for vtype, sales in vehicle_sales_by_type.items())
            avg_new_co2 = weighted_co2 / total_sales
            
            baseline_co2 = 140
            co2_reduction = baseline_co2 - avg_new_co2
            reduction_pct = (co2_reduction / baseline_co2 * 100) if baseline_co2 > 0 else 0
            
            print(f"\nENVIRONMENTAL IMPACT")
            print(f"Average new vehicle emissions: {avg_new_co2:.1f}g CO2/km ({self.get_co2_context(avg_new_co2)})")
            print(f"Emissions reduction vs pre-policy baseline: {co2_reduction:.1f}g CO2/km ({reduction_pct:.1f}% improvement)")
            
            annual_km = 13000
            vehicle_lifetime = 15
            total_lifetime_savings = (co2_reduction * annual_km * vehicle_lifetime * total_sales) / 1000000
            print(f"Estimated lifetime CO2 savings: {total_lifetime_savings:,.0f} tonnes")
        
        # Dutch cultural factors
        print(f"\nDUTCH CULTURAL FACTORS")
        never_buy_count = len([a for a in self.agents if a.will_never_buy_car])
        print(f"Committed car-free households: {never_buy_count:,} ({never_buy_count/self.n_agents:.1%} of population)")
        print(f"Cycling preference prevented car purchases: {cycling_prevented:,} cases")
        
        current_owners = len([a for a in self.agents if a.vehicle])
        eligible_for_cars = len([a for a in self.agents if not a.will_never_buy_car])
        ownership_rate = current_owners / eligible_for_cars if eligible_for_cars > 0 else 0
        target_rate = self.get_current_car_ownership_target()
        print(f"Current car ownership rate: {ownership_rate:.1%} (government target: {target_rate:.1%})")
        
        # Policy timeline and future outlook
        print(f"\nPOLICY TIMELINE AND FUTURE OUTLOOK")
        current_bpm_threshold = 110
        for month_threshold, threshold in sorted(self.bpm_thresholds.items()):
            if self.current_month >= month_threshold:
                current_bpm_threshold = threshold
        
        policy_effectiveness = self.get_policy_effectiveness()
        print(f"Current purchase tax threshold: {current_bpm_threshold}g CO2/km")
        print(f"Policy effectiveness level: {policy_effectiveness:.1%} (fully ramped up)")
        
        bev_share = vehicle_sales_by_type.get('BEV-M', 0) / total_sales * 100 if total_sales > 0 else 0
        bev_supply_cap = self.get_current_bev_supply_cap()
        print(f"Electric vehicle market share: {bev_share:.1f}%")
        print(f"Electric vehicle supply capacity: {bev_supply_cap} vehicles per month")
        
        if bev_share < 30 and bev_constrained > 0:
            print(f"WARNING: Electric vehicle adoption limited by supply constraints")
            print(f"         Expect rapid growth when production capacity increases")
        elif bev_share > 40:
            print(f"TREND: Electric vehicle adoption accelerating toward mass market transition")
        
        # CALCULATE MISSING FIELDS FOR SimulationReport
        # Calculate vehicle transitions data
        vehicle_transitions = {}
        for d in recent_decisions:
            for decision in d['decisions']:
                vehicle_type = decision['vehicle_type']
                if vehicle_type not in vehicle_transitions:
                    vehicle_transitions[vehicle_type] = {'new_purchases': 0, 'replacements': 0}
                
                # For now, just count all as new purchases (you can enhance this later)
                vehicle_transitions[vehicle_type]['new_purchases'] += 1

        # Calculate decision drivers summary
        decision_drivers = {
            'policy_influence': policy_influenced / total_sales if total_sales > 0 else 0,
            'company_car_benefits': company_low_co2 / total_sales if total_sales > 0 else 0,
            'high_income_early_adoption': high_income_bev / total_sales if total_sales > 0 else 0,
            'supply_constraints': bev_constrained,
            'cycling_culture_resistance': cycling_prevented,
            'main_decision_factors': {}
        }

        # Analyze main decision reasons from recent decisions
        reason_counts = {}
        for d in recent_decisions:
            for decision in d['decisions']:
                reason = decision.get('reason', 'Unknown')
                reason_counts[reason] = reason_counts.get(reason, 0) + 1

        decision_drivers['main_decision_factors'] = dict(sorted(reason_counts.items(), 
                                                              key=lambda x: x[1], 
                                                              reverse=True)[:5])
        
        # Store structured report data - NOW WITH ALL REQUIRED FIELDS
        report_data = SimulationReport(
            report_id=f"NL_CO2_{year_start}-{year_end}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            year_start=year_start,
            year_end=year_end,
            timestamp=datetime.now().isoformat(),
            
            market_summary={
                'total_sales': total_sales,
                'vehicle_sales_by_type': vehicle_sales_by_type,
                'avg_new_co2': avg_new_co2 if total_sales > 0 else None,
                'bev_market_share': bev_share
            },
            
            vehicle_transitions=vehicle_transitions,  # NOW PROVIDED
            
            policy_impacts={
                'policy_influenced_purchases': policy_influenced,
                'policy_influence_rate': policy_influence_rate,
                'company_car_low_co2': company_low_co2,
                'bev_supply_constrained': bev_constrained,
                'current_bpm_threshold': current_bpm_threshold,
                'policy_effectiveness': policy_effectiveness
            },
            
            agent_decisions={
                'high_income_bev_adopters': high_income_bev,
                'cycling_prevented_purchases': cycling_prevented,
                'total_decision_count': total_sales
            },
            
            decision_drivers=decision_drivers,  # NOW PROVIDED
            
            demographic_patterns={
                'car_ownership_rate': ownership_rate,
                'never_buy_car_count': never_buy_count,
                'urban_agent_count': len([a for a in self.agents if a.is_urban])
            },
            
            emissions_impact={
                'avg_new_vehicle_co2': avg_new_co2 if total_sales > 0 else None,
                'co2_reduction_vs_baseline': co2_reduction if total_sales > 0 else None,
                'estimated_lifetime_co2_savings': total_lifetime_savings if total_sales > 0 else None
            },
            
            economic_impact={
                'total_sales_value': sum(self.vehicles[vtype].base_price * sales 
                                      for vtype, sales in vehicle_sales_by_type.items()),
                'bev_supply_cap': bev_supply_cap
            },
            
            policy_effectiveness={
                'bpm_threshold': current_bpm_threshold,
                'effectiveness_ramp': policy_effectiveness,
                'feebate_active': True
            },
            
            policy_narratives=[],
            trend_analysis={}
        )
        
        self.three_year_reports.append(report_data)
        
        print(f"\n{'='*80}")
        print(f"Report Period {year_start}-{year_end} Complete")
        print(f"{'='*80}\n")
    
    def _record_monthly_outputs(self, purchases: List[str]):
        """Record monthly simulation outputs"""
        sales_by_type = {vtype: purchases.count(vtype) for vtype in self.vehicles.keys()}
        
        if purchases:
            new_co2_intensity = np.mean([self.vehicles[vtype].co2_gkm for vtype in purchases])
            avg_price = np.mean([self.vehicles[vtype].base_price for vtype in purchases])
        else:
            new_co2_intensity = 0
            avg_price = 0
        
        company_car_purchases = 0
        for agent in self.agents:
            if agent.vehicle and agent.vehicle_age == 0 and agent.is_company_car:
                company_car_purchases += 1
        
        company_car_share = company_car_purchases / len(purchases) if purchases else 0
        
        agents_with_vehicles = [a for a in self.agents if a.vehicle]
        social_proof_index = np.mean([a.social_proof for a in agents_with_vehicles]) if agents_with_vehicles else 0
        
        self.monthly_outputs.append({
            'month': self.current_month,
            'sales_by_type': sales_by_type,
            'new_co2_intensity': new_co2_intensity,
            'avg_price': avg_price,
            'company_car_share': company_car_share,
            'social_proof_index': social_proof_index
        })
    
    def _record_annual_outputs(self):
        """Record annual simulation outputs"""
        agents_with_vehicles = [a for a in self.agents if a.vehicle]
        if not agents_with_vehicles:
            return
            
        fleet_co2 = []
        for agent in agents_with_vehicles:
            fleet_co2.extend([agent.vehicle.co2_gkm] * max(1, int(agent.driving_km / 1000)))
        
        fleet_avg_co2 = np.mean(fleet_co2) if fleet_co2 else 0
        
        total_co2 = sum(agent.vehicle.co2_gkm * agent.driving_km for agent in agents_with_vehicles)
        per_capita_co2 = total_co2 / (1000000 * self.n_agents)
        
        bpm_revenue = sum(self.calculate_bpm(agent.vehicle.co2_gkm, self.current_month) 
                         for agent in self.agents if agent.vehicle and agent.vehicle_age <= 1)
        mrb_revenue = sum(self.calculate_mrb(agent.vehicle.co2_gkm) 
                         for agent in agents_with_vehicles)
        
        self.annual_outputs.append({
            'year': (self.current_month + 1) // 12,
            'fleet_avg_co2': fleet_avg_co2,
            'per_capita_co2': per_capita_co2,
            'bpm_revenue': bpm_revenue,
            'mrb_revenue': mrb_revenue
        })
    
    def run_simulation(self):
        """Run the complete simulation with enhanced tracking and reporting"""
        # Clear any previous simulation data
        self.clear_previous_simulation_data()
        
        print(f"Starting Netherlands CO2 policy simulation...")
        print(f"Agents: {self.n_agents:,} | Duration: {self.time_horizon} months ({self.time_horizon/12:.1f} years)")
        print(f"3-year policy impact reports will be generated automatically")
        print(f"Monthly agent data will be captured for visualization")
        
        # Initial status
        agents_with_cars = len([a for a in self.agents if a.vehicle])
        never_buy_cars = len([a for a in self.agents if a.will_never_buy_car])
        eligible_for_cars = len([a for a in self.agents if not a.will_never_buy_car])
        initial_ownership_rate = agents_with_cars / eligible_for_cars if eligible_for_cars > 0 else 0
        
        print(f"\nInitial conditions:")
        print(f"  Car owners: {agents_with_cars:,} ({initial_ownership_rate:.1%})")
        print(f"  Car-free committed households: {never_buy_cars:,} ({never_buy_cars/self.n_agents:.1%})")
        print(f"  Eligible for car purchase: {eligible_for_cars:,}")
        
        for month in range(self.time_horizon):
            if month % 12 == 0:
                year = (month // 12) + 1
                if month == 0:
                    print(f"\nStarting simulation...")
                else:
                    print(f"Year {year} beginning...")
            
            self.simulate_month_with_tracking()
        
        print(f"Simulation complete! Generated {len(self.three_year_reports)} reports.")
        print(f"Captured {len(self.monthly_agent_data)} months of agent data.")
        
        return self.three_year_reports
    
    def save_reports_to_database_format(self, filename: str = "netherlands_co2_simulation_reports.json"):
        """Save all reports in database-ready JSON format"""
        reports_data = []
        for report in self.three_year_reports:
            # Convert dataclass to dictionary
            report_dict = {
                'report_id': report.report_id,
                'year_start': report.year_start,
                'year_end': report.year_end,
                'timestamp': report.timestamp,
                'market_summary': report.market_summary,
                'policy_impacts': report.policy_impacts,
                'agent_decisions': report.agent_decisions,
                'demographic_patterns': report.demographic_patterns,
                'emissions_impact': report.emissions_impact,
                'economic_impact': report.economic_impact,
                'policy_effectiveness': report.policy_effectiveness,
                'policy_narratives': report.policy_narratives,
                'trend_analysis': report.trend_analysis
            }
            reports_data.append(report_dict)
        
        with open(filename, 'w') as f:
            json.dump(reports_data, f, indent=2)
        
        print(f"Saved {len(reports_data)} reports to {filename} (database-ready format)")
        return filename
    
    def plot_results(self):
        """Plot simulation results with policy impact highlights"""
        monthly_df = pd.DataFrame(self.monthly_outputs)
        annual_df = pd.DataFrame(self.annual_outputs)
        
        fig, axes = plt.subplots(2, 3, figsize=(20, 12))
        fig.suptitle('Netherlands CO2 Policy Simulation - Enhanced Analysis', fontsize=16)
        
        # Monthly sales by vehicle type
        if not monthly_df.empty:
            sales_data = []
            for _, row in monthly_df.iterrows():
                for vtype, sales in row['sales_by_type'].items():
                    sales_data.append({'month': row['month'], 'vehicle_type': vtype, 'sales': sales})
            
            sales_df = pd.DataFrame(sales_data)
            if not sales_df.empty:
                pivot_sales = sales_df.pivot(index='month', columns='vehicle_type', values='sales').fillna(0)
                pivot_sales.plot(ax=axes[0,0], title='Monthly Sales by Vehicle Type')
                axes[0,0].set_ylabel('Sales')
                axes[0,0].axvline(x=36, color='red', linestyle='--', alpha=0.7, label='BPM threshold 110→95')
                axes[0,0].axvline(x=72, color='red', linestyle='--', alpha=0.7, label='BPM threshold 95→80')
        
        # New vehicle CO2 intensity with policy events
        if not monthly_df.empty:
            monthly_df.plot(x='month', y='new_co2_intensity', ax=axes[0,1], 
                          title='New Vehicle CO2 Intensity vs Policy Changes', color='blue')
            axes[0,1].axhline(y=110, color='orange', linestyle='--', alpha=0.7, label='Initial BPM threshold')
            axes[0,1].axhline(y=95, color='red', linestyle='--', alpha=0.7, label='Month 36 threshold')
            axes[0,1].axhline(y=80, color='darkred', linestyle='--', alpha=0.7, label='Month 72 threshold')
            axes[0,1].set_ylabel('CO2 (g/km)')
            axes[0,1].legend()
        
        # Policy influence over time
        if self.decision_tracking['monthly_decisions']:
            months = []
            policy_influence_rates = []
            for decision_data in self.decision_tracking['monthly_decisions']:
                if decision_data['market_summary']['total_purchases'] > 0:
                    rate = (decision_data['market_summary']['policy_influenced'] / 
                           decision_data['market_summary']['total_purchases'] * 100)
                    months.append(decision_data['month'])
                    policy_influence_rates.append(rate)
            
            if months:
                axes[0,2].plot(months, policy_influence_rates, color='green', linewidth=2)
                axes[0,2].set_title('Policy Influence Rate Over Time')
                axes[0,2].set_ylabel('Policy-influenced purchases (%)')
                axes[0,2].set_xlabel('Month')
        
        # Fleet average CO2
        if not annual_df.empty:
            annual_df.plot(x='year', y='fleet_avg_co2', ax=axes[1,0], 
                          title='Fleet Average CO2 Intensity', color='red')
            axes[1,0].set_ylabel('CO2 (g/km)')
        
        # BEV market share evolution
        if not monthly_df.empty:
            bev_shares = []
            months = []
            for _, row in monthly_df.iterrows():
                total_sales = sum(row['sales_by_type'].values())
                if total_sales > 0:
                    bev_share = row['sales_by_type'].get('BEV-M', 0) / total_sales * 100
                    bev_shares.append(bev_share)
                    months.append(row['month'])
            
            if months:
                axes[1,1].plot(months, bev_shares, color='purple', linewidth=2)
                axes[1,1].set_title('BEV Market Share Evolution')
                axes[1,1].set_ylabel('BEV Market Share (%)')
                axes[1,1].set_xlabel('Month')
                axes[1,1].axhline(y=35, color='gray', linestyle='--', alpha=0.7, label='Real NL 2024 (~35%)')
                axes[1,1].legend()
        
        # Revenue impact
        if not annual_df.empty:
            ax2 = axes[1,2]
            annual_df.plot(x='year', y='bpm_revenue', ax=ax2, color='blue', label='BPM Revenue')
            ax2.set_ylabel('BPM Revenue (€)', color='blue')
            ax2.tick_params(axis='y', labelcolor='blue')
            
            ax3 = ax2.twinx()
            annual_df.plot(x='year', y='mrb_revenue', ax=ax3, color='red', label='MRB Revenue')
            ax3.set_ylabel('MRB Revenue (€)', color='red')
            ax3.tick_params(axis='y', labelcolor='red')
            ax2.set_title('Tax Revenue Impact')
        
        plt.tight_layout()
        plt.show()
        
        # Summary
        if self.three_year_reports:
            print(f"\nSIMULATION SUMMARY")
            print(f"Generated {len(self.three_year_reports)} comprehensive reports")
            print(f"Reports include policy impacts, agent decisions, and market evolution")
            print(f"Data exported in database-ready format for frontend presentation")

# Run the full 10-year simulation
if __name__ == "__main__":
    print("Netherlands Carbon Policy Simulation")
    print("Select policy type:")
    print("[A] Netherlands vehicle purchase tax (BPM/Feebate)")
    print("[B] British Columbia fuel carbon tax")

    while True:
        choice = input("Enter choice (A/B): ").upper().strip()
        if choice == 'A':
            policy_type = 'vehicle_tax'
            print("Selected: Netherlands vehicle purchase tax policy")
            break
        elif choice == 'B':
            policy_type = 'fuel_tax'
            print("Selected: British Columbia fuel carbon tax policy")
            break
        else:
            print("Invalid choice. Please enter A or B.")

    print(f"Initializing simulation with {policy_type}...")
    sim = NetherlandsCarbonPricingSimulation(n_agents=100, time_horizon=180, policy_type=policy_type)
    reports = sim.run_simulation()

    print(f"Simulation complete with {policy_type} policy!")
    sim.plot_emission_and_vehicle_trends()