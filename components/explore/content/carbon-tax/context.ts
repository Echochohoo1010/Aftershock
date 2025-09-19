import { CaseContext } from "../types"

export const carbonTaxContext: CaseContext = {
  id: "carbon-tax",
  title: "Carbon Tax Implementation",
  description: "This simulation models 10,000 Dutch households deciding whether to buy cars over 10 years from 2008 after the government uses taxes to make dirty cars expensive and clean cars cheaper. Each person is different - some love cycling, others need cars, some get company vehicles, others buy their own.",
  timeline: "120 months",
  agents: 100,
  scope: "Netherlands",
  icon: "🌿",
  policyDetails: {
    instrument: "Carbon pricing",
    target: "Transport sector", 
    mechanism: "Tax on high-emission vehicles, subsidies for clean alternatives"
  },
  keyMetrics: ["Clean transport adoption", "CO2 emissions", "Vehicle choices"]
}