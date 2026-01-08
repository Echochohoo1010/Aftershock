import { ExploreIIIContent } from "../types"

export const carbonTaxExploreIII: ExploreIIIContent = {
  agentTypes: {
    'Cycling': {
      color: '#22c55e',
      label: 'Active Transport',
      description: 'Environmentally conscious individuals who prefer cycling or walking for daily transport'
    },
    'BEV-M': {
      color: '#3b82f6',
      label: 'Electric Vehicle (Medium)',
      description: 'Early adopters of electric vehicles, typically urban professionals with moderate to high income'
    },
    'PHEV-M': {
      color: '#10b981',
      label: 'Plug-in Hybrid (Medium)',
      description: 'Transitional technology users adopting plug-in hybrid vehicles as a bridge to full electric'
    },
    'HEV-S': {
      color: '#06b6d4',
      label: 'Hybrid Vehicle (Small)',
      description: 'Pragmatic consumers choosing fuel-efficient hybrid vehicles as a compromise solution'
    },
    'ICE-S': {
      color: '#f59e0b',
      label: 'Gasoline Car (Small)',
      description: 'Traditional vehicle users with smaller, more efficient gasoline cars'
    },
    'DIE-M': {
      color: '#f97316',
      label: 'Diesel Car (Medium)',
      description: 'Long-distance commuters and rural residents who rely on diesel vehicles for efficiency'
    },
    'ICE-M': {
      color: '#ef4444',
      label: 'Gasoline Car (Medium)',
      description: 'Conventional vehicle owners with medium-sized gasoline cars, often for family use'
    }
  },
  simulationParams: {
    numAgents: 100,
    timeHorizon: 120,
    description: "Dutch households making vehicle choice decisions over 10 years (2008-2018) in response to carbon pricing policy. Each agent represents a household with unique preferences, income levels, and transportation needs."
  },
  behaviorRules: {
    adoptionFactors: [
      "household_income",
      "environmental_preference", 
      "infrastructure_access",
      "family_size",
      "commute_distance",
      "social_influence",
      "policy_incentives",
      "technology_familiarity"
    ],
    transitionProbabilities: {
      "income_sensitivity": 0.3,
      "environmental_concern": 0.25,
      "peer_influence": 0.2,
      "infrastructure_availability": 0.35,
      "cost_sensitivity": 0.4
    },
    influenceFactors: [
      "Carbon tax price signal affects all purchase decisions with varying sensitivity by household income",
      "Social network effects create clusters of similar vehicle choices within neighborhoods",
      "Infrastructure development (charging stations, bike lanes) enables clean transport adoption",
      "Government incentives provide purchase subsidies for electric vehicles and cycling equipment",
      "Early adopters influence neighbors through demonstration effects and word-of-mouth"
    ]
  },
  physicsConfig: {
    gravityStrength: 0.04,
    collisionStrength: 0.8,
    alpha: 0.15
  }
}