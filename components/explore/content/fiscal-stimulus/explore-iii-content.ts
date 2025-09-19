import { ExploreIIIContent } from "../types"

export const fiscalStimulusExploreIII: ExploreIIIContent = {
  agentTypes: {
    'Low-Income': {
      color: '#ef4444',
      label: 'Low-Income Household',
      description: 'Households with limited disposable income, highly sensitive to employment opportunities and tax relief'
    },
    'Middle-Income': {
      color: '#3b82f6', 
      label: 'Middle-Income Household',
      description: 'Primary beneficiaries of tax cuts with moderate spending power and economic sensitivity'
    },
    'High-Income': {
      color: '#22c55e',
      label: 'High-Income Household', 
      description: 'Affluent households with higher savings rates and investment capacity'
    },
    'Small-Business': {
      color: '#f59e0b',
      label: 'Small Business',
      description: 'Local businesses eligible for tax credits and benefiting from increased consumer demand'
    },
    'Large-Corporation': {
      color: '#8b5cf6',
      label: 'Large Corporation',
      description: 'Major employers and contractors positioned to benefit from infrastructure spending'
    },
    'Construction': {
      color: '#06b6d4',
      label: 'Construction Sector',
      description: 'Construction companies and workers directly engaged in stimulus-funded infrastructure projects'
    },
    'Public-Sector': {
      color: '#84cc16',
      label: 'Government Entity',
      description: 'Federal, state, and local government agencies implementing stimulus programs'
    }
  },
  simulationParams: {
    numAgents: 200,
    timeHorizon: 24,
    description: "Economic agents representing households, businesses, and government entities responding to fiscal stimulus over 24 months. Each agent has distinct economic characteristics, spending patterns, and sensitivity to policy interventions."
  },
  behaviorRules: {
    adoptionFactors: [
      "income_level",
      "employment_status",
      "business_size", 
      "sector_exposure",
      "regional_location",
      "credit_access",
      "risk_tolerance",
      "policy_awareness"
    ],
    transitionProbabilities: {
      "income_sensitivity": 0.4,
      "employment_response": 0.35,
      "business_confidence": 0.3,
      "spending_propensity": 0.45,
      "investment_timing": 0.25
    },
    influenceFactors: [
      "Tax relief immediately affects household disposable income with varying marginal propensity to consume by income level",
      "Infrastructure spending creates direct employment opportunities concentrated in construction and related sectors",
      "Business tax credits incentivize capital investment and hiring decisions among eligible firms",
      "Multiplier effects propagate through supply chains as increased demand creates additional economic activity",
      "Regional variations in stimulus impact depend on local economic structure and infrastructure investment allocation"
    ]
  },
  physicsConfig: {
    gravityStrength: 0.05,
    collisionStrength: 0.7,
    alpha: 0.12
  }
}