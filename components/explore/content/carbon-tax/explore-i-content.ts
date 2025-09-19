import { ExploreIContent } from "../types"

export const carbonTaxExploreI: ExploreIContent = {
  variables: [
    "carbon_emissions",
    "energy_prices", 
    "renewable_investment",
    "consumer_spending",
    "innovation",
    "economic_growth",
    "government_revenue"
  ],
  relationships: [
    { from: "carbon_emissions", to: "energy_prices", strength: 0.7, type: "positive" as const },
    { from: "energy_prices", to: "consumer_spending", strength: -0.5, type: "negative" as const },
    { from: "energy_prices", to: "renewable_investment", strength: 0.8, type: "positive" as const },
    { from: "renewable_investment", to: "innovation", strength: 0.6, type: "positive" as const },
    { from: "innovation", to: "economic_growth", strength: 0.5, type: "positive" as const },
    { from: "carbon_emissions", to: "economic_growth", strength: -0.3, type: "negative" as const },
    { from: "energy_prices", to: "carbon_emissions", strength: -0.7, type: "negative" as const },
    { from: "carbon_emissions", to: "government_revenue", strength: 0.8, type: "positive" as const },
    { from: "government_revenue", to: "renewable_investment", strength: 0.6, type: "positive" as const },
    { from: "innovation", to: "carbon_emissions", strength: -0.5, type: "negative" as const }
  ],
  effects: {
    innovation: [
      "Carbon pricing drives R&D investment in clean technology sectors, with venture capital funding for green startups increasing by 35-50%",
      "Automotive industry accelerates development of electric vehicle technologies, reducing battery costs by 15-20% annually",
      "Energy sector innovation focuses on renewable integration and smart grid technologies to manage variable supply"
    ],
    economicGrowth: [
      "Short-term GDP reduction of 0.2-0.5% due to increased energy costs and adjustment period for businesses and consumers",
      "Medium-term neutral to positive growth as clean tech exports create new revenue streams and job opportunities",
      "Long-term GDP boost of 0.8-1.2% from competitive advantages in green technology sectors and reduced fossil fuel imports"
    ],
    positiveEffects: [
      "Accelerated adoption of clean transport options - cycling, electric vehicles, and public transit usage increases by 25%",
      "Air quality improvements reduce healthcare costs by €200-400 per household annually in urban areas",
      "Creation of 15,000-20,000 new jobs in renewable energy, electric vehicle manufacturing, and green infrastructure",
      "Energy independence increases as domestic renewable capacity reduces reliance on fossil fuel imports by 30%"
    ],
    negativeEffects: [
      "Higher transportation costs burden low-income households disproportionately, with fuel expenses rising 12-18%",
      "Industrial competitiveness concerns as energy-intensive sectors face cost disadvantages compared to non-carbon-taxed regions",
      "Rural communities experience greater impact due to limited public transport alternatives and longer commuting distances",
      "Temporary job losses in fossil fuel sectors affect approximately 5,000-8,000 workers requiring retraining programs"
    ],
    socialImpact: [
      "Behavioral change accelerates as price signals make environmental costs visible to consumers in daily decisions",
      "Public support varies by region - urban areas show 60% approval while rural areas show 35% approval for carbon pricing",
      "Educational campaigns and green job training programs help communities adapt to the energy transition"
    ],
    environmentalImpact: [
      "CO2 emissions from transport sector decrease by 15-25% over 10 years through modal shift and vehicle efficiency",
      "Air pollution in cities drops significantly - particulate matter reduced by 20% and NOx emissions by 30%",
      "Biodiversity benefits from reduced fossil fuel extraction and increased investment in natural carbon storage"
    ]
  },
  recommendations: [
    "Implement progressive rebate system to protect low-income households from regressive effects of carbon pricing",
    "Invest carbon tax revenues in public transport infrastructure to provide affordable clean alternatives",
    "Establish just transition programs for workers in fossil fuel industries to access green job opportunities",
    "Monitor regional disparities and provide targeted support for rural communities during the transition period"
  ]
}