import { ExploreIIContent } from "../types"

export const carbonTaxExploreII: ExploreIIContent = {
  events: [
    {
      id: "carbon-tax-announcement",
      title: "Carbon Tax Policy Announcement",
      description: "Government announces €50/tonne CO2 tax on transport fuels, effective in 6 months",
      type: "neutral",
      timestamp: new Date("2008-01-15"),
      magnitude: 0.8,
      responses: [
        "Political parties align across spectrum with 65% parliamentary support for gradual implementation",
        "Environmental groups celebrate while transport industry requests transition period and support measures",
        "Public awareness campaigns launch to educate citizens about policy rationale and available alternatives"
      ]
    },
    {
      id: "energy-price-response",
      title: "Energy Market Adjustment",
      description: "Fuel prices increase by 12-15% as carbon tax takes effect, triggering market responses",
      type: "negative",
      timestamp: new Date("2008-07-01"),
      magnitude: 0.7,
      responses: [
        "Gasoline and diesel prices at pumps reflect full carbon tax burden, making clean alternatives more competitive",
        "Energy companies accelerate investment in renewable sources and electric vehicle charging infrastructure",
        "Consumer behavior starts shifting - public transport ridership increases by 8% in first month"
      ]
    },
    {
      id: "clean-tech-boom",
      title: "Clean Technology Investment Surge",
      description: "Venture capital and government funding flood into clean transport technologies",
      type: "positive", 
      timestamp: new Date("2008-10-01"),
      magnitude: 0.9,
      responses: [
        "€500M government fund for electric vehicle charging network creates 2,000 construction jobs",
        "Dutch automotive companies partner with battery manufacturers to localize EV supply chains",
        "Cycling infrastructure investment doubles as cities prepare for increased bike usage"
      ]
    },
    {
      id: "consumer-adoption",
      title: "Consumer Behavior Shifts",
      description: "Households begin changing transportation choices in response to price signals",
      type: "positive",
      timestamp: new Date("2009-03-15"),
      magnitude: 0.6,
      responses: [
        "Electric vehicle sales increase 40% year-over-year, though from a small base of early adopters",
        "Cycling to work increases 20% in urban areas as bike-sharing programs expand rapidly",
        "Rural households face harder choices and begin carpooling initiatives to reduce fuel costs"
      ]
    },
    {
      id: "industry-adaptation",
      title: "Industrial Sector Response",
      description: "Energy-intensive industries implement efficiency measures and seek competitiveness support",
      type: "alert",
      timestamp: new Date("2009-06-01"),
      magnitude: 0.5,
      responses: [
        "Manufacturing sector invests €200M in energy efficiency upgrades to reduce carbon tax exposure",
        "Trade associations negotiate with government for border carbon adjustments to protect competitiveness",
        "Some production shifts to less carbon-intensive processes, creating demand for new technologies"
      ]
    },
    {
      id: "social-equity-concerns",
      title: "Social Impact Assessment",
      description: "Studies reveal disproportionate impact on low-income and rural households",
      type: "alert",
      timestamp: new Date("2010-01-15"),
      magnitude: 0.7,
      responses: [
        "Government introduces rebate program providing €300 annual credits to households earning under €35,000",
        "Rural development fund allocates €100M for public transport connections to smaller communities",
        "Social services report increased demand for energy assistance programs among vulnerable populations"
      ]
    }
  ],
  eventTypes: [
    "Policy Implementation",
    "Market Response", 
    "Consumer Adaptation",
    "Industry Adjustment",
    "Social Response",
    "Regulatory Compliance",
    "Environmental Impact",
    "Economic Impact"
  ],
  eventResponses: {
    "Policy Implementation": [
      "Carbon tax legislation passes with phased implementation to allow market adjustment and infrastructure development",
      "Regulatory framework establishes monitoring systems to track emissions reductions and economic impacts",
      "Government creates dedicated carbon revenue fund to finance clean transport infrastructure and household rebates"
    ],
    "Market Response": [
      "Energy markets price in carbon costs immediately, creating 15-20% price premium for high-carbon transport fuels",
      "Investment flows redirect toward clean technology sectors as return profiles improve relative to fossil alternatives",
      "Financial markets develop new carbon pricing derivatives to help businesses manage transition risks"
    ],
    "Consumer Adaptation": [
      "Household transportation budgets shift as families evaluate cost-benefit of different mobility options",
      "Early adopters of electric vehicles benefit from lower operating costs and government purchase incentives",
      "Modal shift accelerates in urban areas where clean alternatives like cycling and public transit are readily available"
    ],
    "Industry Adjustment": [
      "Automotive industry accelerates research and development in electric and hybrid vehicle technologies",
      "Energy sector increases capital allocation toward renewable generation and grid infrastructure upgrades",
      "Logistics companies optimize routes and invest in fuel-efficient vehicle fleets to manage increased fuel costs"
    ],
    "Social Response": [
      "Public opinion remains split with urban residents showing higher support than rural communities",
      "Environmental awareness increases as carbon pricing makes climate costs visible in everyday decisions",
      "Social equity concerns drive policy refinements to protect vulnerable households from regressive impacts"
    ],
    "Environmental Impact": [
      "CO2 emissions from transport begin declining as price incentives encourage cleaner choices",
      "Air quality improvements become measurable in urban areas within 18-24 months of implementation",
      "Biodiversity benefits emerge from reduced pressure on fossil fuel extraction sites"
    ]
  },
  chainReactionPatterns: {
    primaryEffects: [
      "Immediate fuel price increases trigger consumer awareness and initial behavior changes",
      "Energy companies adjust business models and investment strategies toward clean alternatives",
      "Government carbon revenues enable funding for infrastructure and household support programs"
    ],
    secondaryEffects: [
      "Clean technology markets expand rapidly with improved economics relative to fossil alternatives",
      "Employment patterns shift as green jobs grow while some fossil fuel sector positions decline",
      "Regional economic differences emerge based on clean transport infrastructure availability"
    ],
    tertiaryEffects: [
      "Netherlands develops competitive advantages in clean technology export markets",
      "Social norms around transportation evolve as clean choices become mainstream and affordable",
      "Policy success influences EU-wide carbon pricing mechanisms and international climate negotiations"
    ]
  }
}