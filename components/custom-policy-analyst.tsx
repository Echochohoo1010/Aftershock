"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import CausalGraph from "@/components/causal-graph"
import ChainReactionPanel from "@/components/chain-reaction-panel"
import ScenarioChat from "@/components/scenario-chat"
import AgentVisualizationSelector from "@/components/visualizations/AgentVisualizationSelector"
import ExploreContainer from "@/components/explore/ExploreContainer"
import AnalysisCanvas from "@/components/core/AnalysisCanvas"
import { Share2, Shapes, FileText, Users } from "lucide-react"
import { generatePolicyPDF, type PolicyReportData } from "./pdf-report"
import { CaseId } from "@/components/explore/content/types"

// Default economic policy causal graph
const defaultVariables = [
  "economic_growth",
  "inflation",
  "unemployment",
  "public_debt",
  "consumer_spending",
  "business_investment"
]

const defaultRelationships = [
  { from: "economic_growth", to: "unemployment", strength: -0.7, type: "negative" as const },
  { from: "economic_growth", to: "inflation", strength: 0.5, type: "positive" as const },
  { from: "inflation", to: "consumer_spending", strength: -0.4, type: "negative" as const },
  { from: "unemployment", to: "consumer_spending", strength: -0.6, type: "negative" as const },
  { from: "consumer_spending", to: "business_investment", strength: 0.6, type: "positive" as const },
  { from: "business_investment", to: "economic_growth", strength: 0.7, type: "positive" as const },
  { from: "public_debt", to: "economic_growth", strength: -0.3, type: "negative" as const }
]

// Predefined responses for different event types
const eventResponses = {
  "Policy Implementation": [
    "The policy implementation phase establishes the foundation for all subsequent effects. Key parameters have been calibrated based on historical precedents and current economic conditions.",
    "Initial policy parameters have been configured with attention to both short-term stimulus effects and long-term structural impacts on the economy.",
    "The implementation strategy includes phased rollout to allow for adaptive management and calibration based on early feedback loops."
  ],
  "Stakeholder Response": [
    "Business sector adaptation shows positive initial reception, with particular enthusiasm from small and medium enterprises that stand to benefit from the policy provisions.",
    "Key stakeholders are mobilizing resources to align with policy incentives, creating a multiplier effect that amplifies the intended outcomes.",
    "Early stakeholder engagement indicates strong buy-in from industry leaders, which typically correlates with successful policy diffusion across sectors."
  ],
  "Market Adjustment": [
    "Short-term market volatility is an expected transitional effect as market participants recalibrate expectations and pricing models to account for the new policy landscape.",
    "The observed market fluctuations are within predicted parameters and should stabilize as information asymmetries are resolved through continued policy communication.",
    "Market adjustment patterns suggest a temporary reallocation of capital that typically precedes a new equilibrium state aligned with policy objectives."
  ],
  "Regulatory Compliance": [
    "New compliance protocols are being established across affected sectors, with initial adoption rates tracking above baseline projections for similar policy interventions.",
    "The regulatory framework is adapting to accommodate policy requirements while minimizing administrative burden on implementing organizations.",
    "Compliance mechanisms show early signs of effectiveness, with key performance indicators suggesting strong alignment between policy intent and operational execution."
  ],
  "Economic Impact": [
    "GDP growth projections have been updated to reflect the policy's stimulative effects, with particular strength in sectors directly targeted by the intervention.",
    "Macroeconomic indicators are responding positively, with multiplier effects beginning to manifest across supply chains and adjacent economic sectors.",
    "The economic impact assessment shows promising early results, with leading indicators suggesting sustained growth potential beyond the initial implementation phase."
  ],
  "Social Response": [
    "Public opinion shifts indicate heightened awareness and engagement with the policy objectives, though sentiment remains mixed across different demographic segments.",
    "Social media analysis reveals increasing discussion volume around policy impacts, with sentiment trending toward cautious optimism in key stakeholder communities.",
    "Community response patterns suggest the emergence of advocacy networks that could amplify policy effectiveness through grassroots implementation support."
  ],
  "Resource Allocation": [
    "Budget redistribution processes are underway, with fiscal resources being realigned to support policy priorities while maintaining overall fiscal discipline.",
    "Resource allocation mechanisms are functioning as designed, directing capital and operational support to areas with highest impact potential.",
    "The resource deployment strategy is balancing immediate implementation needs with long-term sustainability considerations to ensure durable policy outcomes."
  ],
  "Long-term Effects": [
    "Sustainable development indicators are showing improvement, suggesting the policy is successfully addressing structural challenges without creating new externalities.",
    "Long-horizon projections indicate positive trajectory for key outcome metrics, with particular strength in areas related to system resilience and adaptive capacity.",
    "The policy appears to be establishing virtuous cycles that could generate self-reinforcing positive outcomes beyond the direct intervention period."
  ]
};

// Default responses for any event type not specifically covered
const defaultResponses = [
  "This event represents a critical juncture in the policy implementation process, with implications for both immediate outcomes and long-term system dynamics.",
  "The observed effects align with theoretical models of policy diffusion and impact, suggesting the intervention is functioning as designed.",
  "This development indicates the policy is engaging with target systems as intended, though continued monitoring is essential to track secondary and tertiary effects."
];

// Pre-filled case studies with custom causal graphs
const caseStudies = [
  {
    id: "fiscal-stimulus",
    title: "Fiscal Stimulus Package",
    description: "A comprehensive fiscal stimulus package aimed at boosting economic growth through increased government spending on infrastructure projects, tax cuts for middle-income households, and targeted support for small businesses affected by economic downturns.",
    icon: "💰",
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
    ]
  },
  {
    id: "carbon-tax",
    title: "Carbon Tax Implementation",
    description: "This simulation models 10,000 Dutch households deciding whether to buy cars over 10 years from 2008 after the government uses taxes to make dirty cars expensive and clean cars cheaper. Each person is different - some love cycling, others need cars, some get company vehicles, others buy their own.",
    icon: "🌿",
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
    ]
  }
]

// Interface for chain reaction events
interface ReactionEvent {
  id: string
  title: string
  description: string
  type: "positive" | "negative" | "neutral" | "alert"
  timestamp: Date
  magnitude: number
}

interface CustomPolicyAnalystProps {
  onSubmissionChange?: (isSubmitted: boolean) => void
}

export default function CustomPolicyAnalyst({ onSubmissionChange }: CustomPolicyAnalystProps = {}) {
  const [policyTitle, setPolicyTitle] = useState("")
  const [policyDescription, setPolicyDescription] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null)
  const [highlightedRelationship, setHighlightedRelationship] = useState<{ from: string; to: string } | null>(null)
  const [variables, setVariables] = useState(defaultVariables)
  const [relationships, setRelationships] = useState<Array<{
    from: string
    to: string
    strength: number
    type: "positive" | "negative" | "complex"
  }>>(defaultRelationships)
  const [showCaseStudies, setShowCaseStudies] = useState(false)
  const [activeTab, setActiveTab] = useState<"explore1" | "explore2" | "explore3">("explore1")
  const [selectedEvent, setSelectedEvent] = useState<ReactionEvent | null>(null)
  const [quickTags, setQuickTags] = useState<string[]>([])
  const [events, setEvents] = useState<ReactionEvent[]>([])
  const [chatHistory, setChatHistory] = useState<Array<{ role: string, content: string }>>([])
  const [selectedCase, setSelectedCase] = useState<CaseId | null>(null)

  // Memoize the recommendation text to prevent infinite re-renders
  const recommendationText = useMemo(() => {
    if (variables.length === 0) return 'key variables';
    const randomVariable = variables[Math.floor(Math.random() * variables.length)];
    const outcomeType = relationships.filter(r => r.type === "positive").length >
      relationships.filter(r => r.type === "negative").length ? " positive" : " mixed";

    return `Consider monitoring ${randomVariable.replace(/_/g, ' ')} closely as it shows potential for significant downstream effects. Long-term outcomes appear${outcomeType} based on the causal structure.`;
  }, [variables, relationships]);

  const handleSubmit = () => {
    if (policyTitle.trim() && policyDescription.trim()) {
      setIsSubmitted(true)
      setShowCaseStudies(false)
      onSubmissionChange?.(true)

      // Generate quick tags based on variables
      const tags = variables.slice(0, 5).map(v => v.replace(/_/g, ' '));
      setQuickTags(tags);
    }
  }

  const handleReset = () => {
    setPolicyTitle("")
    setPolicyDescription("")
    setIsSubmitted(false)
    onSubmissionChange?.(false)
    setHighlightedNode(null)
    setHighlightedRelationship(null)
    setVariables(defaultVariables)
    setRelationships(defaultRelationships)
    setSelectedEvent(null)
    setQuickTags([])
  }

  const handleHighlightNode = (variable: string | null) => {
    setHighlightedNode(variable)
  }

  const handleHighlightRelationship = (from: string, to: string) => {
    setHighlightedRelationship({ from, to })
  }

  const handleUpdateGraph = (newRelationships: Array<{ from: string; to: string; strength: number; type: string }>) => {
    setRelationships(prev => {
      const updated = [...prev]

      newRelationships.forEach(newRel => {
        const index = updated.findIndex(rel => rel.from === newRel.from && rel.to === newRel.to)
        if (index !== -1) {
          // Ensure the type is one of the allowed values
          const validType = newRel.type === "positive" || newRel.type === "negative" || newRel.type === "complex"
            ? newRel.type as "positive" | "negative" | "complex"
            : "complex";

          updated[index] = {
            ...updated[index],
            strength: newRel.strength,
            type: validType
          }
        } else {
          // Ensure the type is one of the allowed values for new relationships
          const validType = newRel.type === "positive" || newRel.type === "negative" || newRel.type === "complex"
            ? newRel.type as "positive" | "negative" | "complex"
            : "complex";

          updated.push({
            from: newRel.from,
            to: newRel.to,
            strength: newRel.strength,
            type: validType
          })
        }
      })

      return updated
    })
  }

  const selectCaseStudy = (caseStudy: typeof caseStudies[0]) => {
    setPolicyTitle(caseStudy.title)
    setPolicyDescription(caseStudy.description)
    setVariables(caseStudy.variables)
    // Set the selected case for the new ExploreContainer
    setSelectedCase(caseStudy.id as CaseId)

    setRelationships(caseStudy.relationships)
    setShowCaseStudies(false)
  }

  const handleEventSelect = (event: ReactionEvent) => {
    setSelectedEvent(event);
    // Add event to our tracked events if not already present
    setEvents(prev => {
      const exists = prev.some(e => e.id === event.id);
      if (!exists) {
        return [event, ...prev].slice(0, 20); // Keep last 20 events
      }
      return prev;
    });
  }

  // Function to update chat history - memoized to prevent infinite re-renders
  const updateChatHistory = useCallback((messages: Array<{ role: string, content: string }>) => {
    setChatHistory(messages.slice(-20)); // Keep last 20 messages
  }, [])

  const handleEventsUpdate = useCallback((newEvents: ReactionEvent[]) => {
    setEvents(newEvents);
  }, [])

  const handleChatUpdate = useCallback((messages: Array<{ role: string, content: string }>) => {
    setChatHistory(messages);
  }, [])

  // Generate analysis for a chain reaction event
  const generateEventAnalysis = (event: ReactionEvent) => {
    // Select a response based on the event title or use default
    const possibleResponses = eventResponses[event.title as keyof typeof eventResponses] || defaultResponses;
    const response = possibleResponses[Math.floor(Math.random() * possibleResponses.length)];

    return `${response} This ${event.type} event has a ${Math.round(event.magnitude)}% impact magnitude, indicating ${event.magnitude > 50 ? 'significant' : 'moderate'} system effects. ${event.description} The policy "${policyTitle}" appears to be ${event.type === 'positive' ? 'effectively addressing' : event.type === 'negative' ? 'facing challenges in' : 'gradually influencing'} this aspect of the system.`;
  }

  // Generate PDF report using @react-pdf/renderer
  const generatePDFReport = async () => {
    const reportData: PolicyReportData = {
      policyTitle,
      policyDescription,
      variables,
      relationships,
      events,
      chatHistory,
      generatedAt: new Date()
    }

    try {
      await generatePolicyPDF(reportData)
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Fallback to alert if PDF generation fails
      alert('Error generating PDF report. Please try again.')
    }
  }

  return (
    <div className={`${isSubmitted ? 'w-full h-full relative' : 'container mx-auto p-4 max-w-7xl'}`}>
      {/* Policy Input Form */}
      {!isSubmitted &&
        <Card className="p-6 mb-8 shadow-md max-w-4xl mx-auto ">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold">Policy Details</h2>
              <Button
                variant="outline"
                onClick={() => setShowCaseStudies(!showCaseStudies)}
                disabled={isSubmitted}
              >
                {showCaseStudies ? "Hide Case Studies" : "Load Case Study"}
              </Button>
            </div>

            {showCaseStudies && !isSubmitted && (
              <div className="mb-6 border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <h3 className="font-medium">Select a Pre-filled Case Study</h3>
                  <p className="text-xs text-gray-500 mt-1">Each case study includes a custom causal graph with relevant variables and relationships</p>
                </div>
                <div className="divide-y">
                  {caseStudies.map((study) => (
                    <div
                      key={study.id}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex items-start gap-3"
                      onClick={() => selectCaseStudy(study)}
                    >
                      <div className="text-2xl">{study.icon}</div>
                      <div>
                        <h4 className="font-medium">{study.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">{study.description}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {study.variables.slice(0, 3).map(variable => (
                            <span key={variable} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                              {variable.replace(/_/g, ' ')}
                            </span>
                          ))}
                          {study.variables.length > 3 && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                              +{study.variables.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="policy-title" className="text-lg font-medium">Policy Title</Label>
              <Input
                id="policy-title"
                value={policyTitle}
                onChange={(e) => setPolicyTitle(e.target.value)}
                placeholder="Enter policy title"
                disabled={isSubmitted}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="policy-description" className="text-lg font-medium">Policy Description</Label>
              <Textarea
                id="policy-description"
                value={policyDescription}
                onChange={(e) => setPolicyDescription(e.target.value)}
                placeholder="Describe your policy proposal in detail"
                rows={4}
                disabled={isSubmitted}
                className="mt-1"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              {isSubmitted ? (
                <>
                  <Button
                    onClick={generatePDFReport}
                    variant="default"
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Export PDF Report
                  </Button>
                  <Button onClick={handleReset} variant="outline" size="lg">
                    Reset Analysis
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!policyTitle.trim() || !policyDescription.trim()}
                  size="lg"
                  className="bg-black hover:bg-gray-800 text-white"
                >
                  Analyze Policy
                </Button>
              )}
            </div>
          </div>
        </Card>}

      {isSubmitted && (
        <AnalysisCanvas
          policyTitle={policyTitle}
          policyDescription={policyDescription}
          variables={variables}
          relationships={relationships}
          selectedCase={selectedCase}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          highlightedNode={highlightedNode}
          highlightedRelationship={highlightedRelationship}
          selectedEvent={selectedEvent}
          onEventSelect={handleEventSelect}
          onHighlightNode={handleHighlightNode}
          onHighlightRelationship={handleHighlightRelationship}
          onUpdateGraph={handleUpdateGraph}
          quickTags={quickTags}
          generateEventAnalysis={generateEventAnalysis}
          onChatUpdate={handleChatUpdate}
        />
      )}
    </div>
  )
}