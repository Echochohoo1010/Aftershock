import { CaseContent, CaseId } from "./types"

// Dynamic imports for case-specific content
export async function loadCaseContent(caseId: CaseId): Promise<CaseContent> {
  try {
    switch (caseId) {
      case "carbon-tax": {
        const [contextModule, exploreIModule, exploreIIModule, exploreIIIModule] = await Promise.all([
          import("./carbon-tax/context"),
          import("./carbon-tax/explore-i-content"),
          import("./carbon-tax/explore-ii-content"),
          import("./carbon-tax/explore-iii-content")
        ])
        
        return {
          context: contextModule.carbonTaxContext,
          exploreI: exploreIModule.carbonTaxExploreI,
          exploreII: exploreIIModule.carbonTaxExploreII,
          exploreIII: exploreIIIModule.carbonTaxExploreIII
        }
      }
      
      case "fiscal-stimulus": {
        const [contextModule, exploreIModule, exploreIIModule, exploreIIIModule] = await Promise.all([
          import("./fiscal-stimulus/context"),
          import("./fiscal-stimulus/explore-i-content"),
          import("./fiscal-stimulus/explore-ii-content"),
          import("./fiscal-stimulus/explore-iii-content")
        ])
        
        return {
          context: contextModule.fiscalStimulusContext,
          exploreI: exploreIModule.fiscalStimulusExploreI,
          exploreII: exploreIIModule.fiscalStimulusExploreII,
          exploreIII: exploreIIIModule.fiscalStimulusExploreIII
        }
      }
      
      default:
        throw new Error(`Unknown case ID: ${caseId}`)
    }
  } catch (error) {
    console.error(`Failed to load content for case ${caseId}:`, error)
    throw new Error(`Failed to load content for case: ${caseId}`)
  }
}

// Helper function to get available case IDs
export function getAvailableCases(): CaseId[] {
  return ["carbon-tax", "fiscal-stimulus"]
}

// Helper function to get case metadata without loading full content
export function getCaseMetadata(caseId: CaseId) {
  switch (caseId) {
    case "carbon-tax":
      return {
        id: "carbon-tax",
        title: "Carbon Tax Implementation",
        icon: "🌿",
        description: "Netherlands transport sector carbon pricing simulation"
      }
    case "fiscal-stimulus":
      return {
        id: "fiscal-stimulus", 
        title: "Fiscal Stimulus Package",
        icon: "💰",
        description: "Government spending and tax relief economic stimulus"
      }
    default:
      throw new Error(`Unknown case ID: ${caseId}`)
  }
}