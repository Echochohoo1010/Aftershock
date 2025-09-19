import { CaseContext } from "../types"

export const fiscalStimulusContext: CaseContext = {
  id: "fiscal-stimulus",
  title: "Fiscal Stimulus Package",
  description: "A comprehensive fiscal stimulus package aimed at boosting economic growth through increased government spending on infrastructure projects, tax cuts for middle-income households, and targeted support for small businesses affected by economic downturns.",
  timeline: "24 months",
  agents: 200,
  scope: "National Economy",
  icon: "💰",
  policyDetails: {
    instrument: "Government spending & tax cuts",
    target: "Economic recovery",
    mechanism: "Direct fiscal injection and household tax relief"
  },
  keyMetrics: ["GDP growth", "Employment rate", "Consumer spending"]
}