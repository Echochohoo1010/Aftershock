import { ExploreIIContent } from "../types"

export const fiscalStimulusExploreII: ExploreIIContent = {
  events: [
    {
      id: "stimulus-announcement",
      title: "Fiscal Stimulus Package Announcement",
      description: "Government announces $500B stimulus package including infrastructure spending and tax cuts",
      type: "positive",
      timestamp: new Date("2024-03-01"),
      magnitude: 0.9,
      responses: [
        "Financial markets rally as investors anticipate economic growth and increased corporate earnings",
        "Construction and infrastructure companies see immediate stock price increases of 15-25%",
        "Economic forecasters raise GDP growth projections by 0.8-1.2% for the upcoming fiscal year"
      ]
    },
    {
      id: "infrastructure-rollout",
      title: "Infrastructure Projects Begin",
      description: "Major infrastructure projects commence across transportation, broadband, and energy sectors",
      type: "positive",
      timestamp: new Date("2024-06-01"),
      magnitude: 0.8,
      responses: [
        "Construction employment increases by 150,000 jobs as projects ramp up nationwide",
        "Materials demand surge drives commodity prices up 8-12% for steel, cement, and equipment",
        "Local economies in project areas see immediate benefits from worker spending and supply purchases"
      ]
    },
    {
      id: "tax-cut-implementation",
      title: "Tax Relief Takes Effect",
      description: "Middle-class tax cuts and small business credits begin flowing to households and firms",
      type: "positive",
      timestamp: new Date("2024-04-15"),
      magnitude: 0.7,
      responses: [
        "Consumer spending increases 6% as families receive average tax savings of $2,400 annually",
        "Small businesses invest in equipment and hiring with improved cash flow from tax credits",
        "Retail sector experiences strongest growth in 18 months as disposable income rises"
      ]
    },
    {
      id: "inflation-concerns",
      title: "Inflation Pressures Emerge",
      description: "Rising demand from stimulus spending meets supply constraints, driving price increases",
      type: "alert",
      timestamp: new Date("2024-09-01"),
      magnitude: 0.6,
      responses: [
        "Consumer prices increase 4.2% year-over-year, highest level in 24 months",
        "Federal Reserve signals potential interest rate adjustments to manage inflation expectations",
        "Labor unions begin negotiating higher wages to maintain purchasing power for workers"
      ]
    },
    {
      id: "debt-sustainability-debate",
      title: "Public Debt Concerns Rise",
      description: "Economists and policymakers debate long-term fiscal sustainability of stimulus spending",
      type: "alert",
      timestamp: new Date("2024-12-01"),
      magnitude: 0.5,
      responses: [
        "Credit rating agencies warn of potential downgrades if fiscal trajectory is not addressed",
        "Political debate intensifies over future tax increases versus spending cuts to manage debt",
        "Bond markets show increased sensitivity to fiscal policy announcements and debt projections"
      ]
    },
    {
      id: "multiplier-effects",
      title: "Economic Multiplier Effects Accelerate",
      description: "Secondary and tertiary economic benefits from stimulus begin to compound",
      type: "positive",
      timestamp: new Date("2024-10-15"),
      magnitude: 0.8,
      responses: [
        "Service sector employment grows as increased economic activity drives demand for business services",
        "Manufacturing output increases 12% as domestic demand strengthens and business confidence improves",
        "Regional economic development accelerates in areas with major infrastructure investments"
      ]
    }
  ],
  eventTypes: [
    "Policy Implementation",
    "Market Response",
    "Employment Impact",
    "Inflation Response",
    "Debt Concerns",
    "Multiplier Effects",
    "Business Investment",
    "Consumer Response"
  ],
  eventResponses: {
    "Policy Implementation": [
      "Fiscal stimulus legislation passes with bipartisan support for infrastructure and targeted tax relief measures",
      "Treasury Department establishes oversight mechanisms to ensure efficient allocation of stimulus funds",
      "Federal agencies coordinate implementation timeline to maximize economic impact and minimize administrative delays"
    ],
    "Market Response": [
      "Stock markets experience significant gains as investors anticipate improved corporate earnings from economic stimulus",
      "Bond yields fluctuate as markets balance growth expectations against concerns about increased government borrowing",
      "Commodity markets rally on expectations of increased infrastructure demand and economic activity"
    ],
    "Employment Impact": [
      "Job creation accelerates in construction, manufacturing, and service sectors directly and indirectly affected by stimulus",
      "Unemployment rate drops by 1.5-2.0 percentage points as both public and private sector hiring increases",
      "Labor participation rate improves as discouraged workers re-enter the job market amid improved opportunities"
    ],
    "Inflation Response": [
      "Price pressures build gradually as increased demand encounters supply chain constraints and capacity limits",
      "Central bank monitoring intensifies with readiness to adjust monetary policy if inflation exceeds target ranges",
      "Wage-price spiral risks emerge as tight labor markets lead to increased compensation demands"
    ],
    "Business Investment": [
      "Private capital expenditure increases as businesses respond to improved demand outlook and tax incentives",
      "Small and medium enterprises expand operations and hire additional workers with improved access to credit",
      "Technology and innovation investment accelerates as companies modernize to meet increased demand"
    ],
    "Consumer Response": [
      "Household spending patterns shift toward durable goods and services as confidence and disposable income improve",
      "Savings rates initially decline as consumers increase spending but later stabilize as economic uncertainty reduces",
      "Consumer confidence indices reach multi-year highs as employment prospects and income growth improve"
    ]
  },
  chainReactionPatterns: {
    primaryEffects: [
      "Direct government spending creates immediate employment and income for affected sectors and regions",
      "Tax cuts increase household disposable income and business cash flow, enabling increased spending and investment",
      "Infrastructure improvements enhance long-term productivity potential of the economy"
    ],
    secondaryEffects: [
      "Increased consumer and business spending creates demand for goods and services across the broader economy",
      "Employment gains in directly affected sectors lead to job creation in supporting and service industries",
      "Improved business confidence drives additional private investment beyond the direct stimulus measures"
    ],
    tertiaryEffects: [
      "Enhanced economic growth trajectory attracts additional private investment and business expansion decisions",
      "Improved fiscal position from higher tax revenues allows for continued public investment in growth-supporting programs",
      "Demonstration of effective fiscal policy coordination improves overall economic policy credibility and effectiveness"
    ]
  }
}