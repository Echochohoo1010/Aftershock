// Type definitions for case-specific content structure

export interface Relationship {
  from: string
  to: string
  strength: number
  type: "positive" | "negative"
}

export interface ExploreIContent {
  variables: string[]
  relationships: Relationship[]
  effects: {
    innovation?: string[]
    economicGrowth?: string[]
    positiveEffects?: string[]
    negativeEffects?: string[]
    socialImpact?: string[]
    environmentalImpact?: string[]
  }
  recommendations?: string[]
}

export interface ReactionEvent {
  id: string
  title: string
  description: string
  type: "positive" | "negative" | "neutral" | "alert"
  timestamp: Date
  magnitude: number
  responses?: string[]
}

export interface ExploreIIContent {
  events: ReactionEvent[]
  eventTypes: string[]
  eventResponses: Record<string, string[]>
  chainReactionPatterns?: {
    primaryEffects: string[]
    secondaryEffects: string[]
    tertiaryEffects: string[]
  }
}

export interface AgentType {
  color: string
  label: string
  description?: string
}

export interface ExploreIIIContent {
  agentTypes: Record<string, AgentType>
  simulationParams: {
    numAgents: number
    timeHorizon: number
    description: string
  }
  behaviorRules?: {
    adoptionFactors: string[]
    transitionProbabilities?: Record<string, number>
    influenceFactors?: string[]
  }
  physicsConfig?: {
    gravityStrength?: number
    collisionStrength?: number
    alpha?: number
  }
}

export interface CaseContext {
  id: string
  title: string
  description: string
  timeline: string
  agents: number
  scope: string
  icon?: string
  policyDetails: {
    instrument: string
    target: string
    mechanism: string
  }
  keyMetrics?: string[]
}

export interface CaseContent {
  context: CaseContext
  exploreI: ExploreIContent
  exploreII: ExploreIIContent
  exploreIII: ExploreIIIContent
}

export type CaseId = "fiscal-stimulus" | "carbon-tax"