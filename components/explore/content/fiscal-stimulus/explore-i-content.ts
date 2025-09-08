import { ExploreIContent } from "../types"

export const fiscalStimulusExploreI: ExploreIContent = {
  variables: [
    "government_spending",
    "economic_growth",
    "unemployment",
    "public_debt",
    "consumer_confidence",
    "business_investment",
    "inflation"
  ],
  relationships: [
    { from: "government_spending", to: "economic_growth", strength: 0.8, type: "positive" as const },
    { from: "government_spending", to: "public_debt", strength: 0.9, type: "positive" as const },
    { from: "government_spending", to: "unemployment", strength: -0.6, type: "negative" as const },
    { from: "economic_growth", to: "unemployment", strength: -0.7, type: "negative" as const },
    { from: "economic_growth", to: "consumer_confidence", strength: 0.6, type: "positive" as const },
    { from: "consumer_confidence", to: "business_investment", strength: 0.7, type: "positive" as const },
    { from: "business_investment", to: "economic_growth", strength: 0.5, type: "positive" as const },
    { from: "public_debt", to: "economic_growth", strength: -0.3, type: "negative" as const },
    { from: "economic_growth", to: "inflation", strength: 0.4, type: "positive" as const },
    { from: "inflation", to: "consumer_confidence", strength: -0.3, type: "negative" as const }
  ],
  effects: {
    innovation: [
      "Infrastructure spending drives demand for construction technology and smart city solutions, spurring R&D investment",
      "Small business support programs fund technology adoption and digital transformation initiatives",
      "Green infrastructure components of stimulus create demand for renewable energy and efficiency technologies"
    ],
    economicGrowth: [
      "Immediate GDP boost of 1.2-1.8% from direct government spending and multiplier effects on private consumption",
      "Employment creation in construction and services generates secondary spending waves throughout the economy",
      "Business confidence improvement leads to increased private investment and hiring decisions"
    ],
    positiveEffects: [
      "Unemployment reduction of 2-3 percentage points through direct job creation and indirect economic stimulus",
      "Infrastructure improvements enhance long-term productivity and competitiveness of the economy",
      "Tax cuts increase household disposable income by 5-8%, boosting consumer spending and economic activity",
      "Small business support prevents closures and maintains employment during economic downturns"
    ],
    negativeEffects: [
      "Public debt increases by 8-12% of GDP, requiring future fiscal consolidation or tax increases",
      "Inflation pressures emerge as increased demand meets supply constraints, potentially eroding purchasing power",
      "Crowding out effects may reduce private investment as government borrowing increases interest rates",
      "Temporary nature of stimulus creates uncertainty about sustainable long-term growth"
    ],
    socialImpact: [
      "Lower-income households benefit disproportionately from job creation and infrastructure improvements",
      "Regional disparities may be reduced if stimulus targets economically disadvantaged areas",
      "Public services improvement enhances quality of life and social cohesion in communities"
    ],
    environmentalImpact: [
      "Green infrastructure investments reduce carbon emissions and improve environmental quality",
      "Construction activity may temporarily increase emissions and resource consumption",
      "Long-term environmental benefits depend on sustainability criteria built into spending programs"
    ]
  },
  recommendations: [
    "Target infrastructure spending toward projects with high long-term productivity benefits",
    "Include green technology requirements in stimulus projects to maximize environmental co-benefits",
    "Design automatic stabilizers to phase out stimulus as economic recovery takes hold",
    "Monitor inflation indicators closely and adjust spending if price pressures become excessive"
  ]
}