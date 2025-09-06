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
import { Share2, Shapes, FileText, Users } from "lucide-react"
import { generatePolicyPDF, type PolicyReportData } from "./pdf-report"

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
  { from: "economic_growth", to: "unemployment", strength: -0.7, type: "negative" },
  { from: "economic_growth", to: "inflation", strength: 0.5, type: "positive" },
  { from: "inflation", to: "consumer_spending", strength: -0.4, type: "negative" },
  { from: "unemployment", to: "consumer_spending", strength: -0.6, type: "negative" },
  { from: "consumer_spending", to: "business_investment", strength: 0.6, type: "positive" },
  { from: "business_investment", to: "economic_growth", strength: 0.7, type: "positive" },
  { from: "public_debt", to: "economic_growth", strength: -0.3, type: "negative" }
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
      { from: "government_spending", to: "economic_growth", strength: 0.8, type: "positive" },
      { from: "government_spending", to: "public_debt", strength: 0.9, type: "positive" },
      { from: "government_spending", to: "unemployment", strength: -0.6, type: "negative" },
      { from: "economic_growth", to: "unemployment", strength: -0.7, type: "negative" },
      { from: "economic_growth", to: "consumer_confidence", strength: 0.6, type: "positive" },
      { from: "consumer_confidence", to: "business_investment", strength: 0.7, type: "positive" },
      { from: "business_investment", to: "economic_growth", strength: 0.5, type: "positive" },
      { from: "public_debt", to: "economic_growth", strength: -0.3, type: "negative" },
      { from: "economic_growth", to: "inflation", strength: 0.4, type: "positive" },
      { from: "inflation", to: "consumer_confidence", strength: -0.3, type: "negative" }
    ]
  },
  {
    id: "carbon-tax",
    title: "Carbon Tax Implementation",
    description: "This simulation models 10,000 Dutch households deciding whether to buy cars over 15 years from 2008 after the government uses taxes to make dirty cars expensive and clean cars cheaper. Each person is different - some love cycling, others need cars, some get company vehicles, others buy their own.",
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
      { from: "carbon_emissions", to: "energy_prices", strength: 0.7, type: "positive" },
      { from: "energy_prices", to: "consumer_spending", strength: -0.5, type: "negative" },
      { from: "energy_prices", to: "renewable_investment", strength: 0.8, type: "positive" },
      { from: "renewable_investment", to: "innovation", strength: 0.6, type: "positive" },
      { from: "innovation", to: "economic_growth", strength: 0.5, type: "positive" },
      { from: "carbon_emissions", to: "economic_growth", strength: -0.3, type: "negative" },
      { from: "energy_prices", to: "carbon_emissions", strength: -0.7, type: "negative" },
      { from: "carbon_emissions", to: "government_revenue", strength: 0.8, type: "positive" },
      { from: "government_revenue", to: "renewable_investment", strength: 0.6, type: "positive" },
      { from: "innovation", to: "carbon_emissions", strength: -0.5, type: "negative" }
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

export default function CustomPolicyAnalyst() {
  const [policyTitle, setPolicyTitle] = useState("")
  const [policyDescription, setPolicyDescription] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null)
  const [highlightedRelationship, setHighlightedRelationship] = useState<{ from: string; to: string } | null>(null)
  const [variables, setVariables] = useState(defaultVariables)
  const [relationships, setRelationships] = useState(defaultRelationships)
  const [showCaseStudies, setShowCaseStudies] = useState(false)
  const [activeTab, setActiveTab] = useState<"explore1" | "explore2" | "explore3">("explore1")
  const [selectedEvent, setSelectedEvent] = useState<ReactionEvent | null>(null)
  const [quickTags, setQuickTags] = useState<string[]>([])
  const [events, setEvents] = useState<ReactionEvent[]>([])
  const [chatHistory, setChatHistory] = useState<Array<{ role: string, content: string }>>([])

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

      // Generate quick tags based on variables
      const tags = variables.slice(0, 5).map(v => v.replace(/_/g, ' '));
      setQuickTags(tags);
    }
  }

  const handleReset = () => {
    setPolicyTitle("")
    setPolicyDescription("")
    setIsSubmitted(false)
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

    // Convert relationship types to match CausalGraph component requirements
    const typedRelationships = caseStudy.relationships.map(rel => ({
      ...rel,
      type: rel.type === "positive" || rel.type === "negative" || rel.type === "complex"
        ? rel.type as "positive" | "negative" | "complex"
        : "complex"
    }))

    setRelationships(typedRelationships)
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
    <div className="container mx-auto p-4 max-w-7xl">
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
        <div className="space-y-8 ">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column: Active Simulator - Takes 2/3 of space */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden shadow-md">
                <div className="p-4 my-2 border-b bg-background justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">
                      {activeTab === "explore1" ? "Causal Graph" :
                        activeTab === "explore2" ? "Chain Reactions" : "Agent Dynamics"}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {activeTab === "explore1"
                        ? "Visualize and modify causal relationships between variables"
                        : activeTab === "explore2"
                          ? "Monitor real-time system responses to policy changes"
                          : "Force-directed agent-based model with collision physics"}
                    </p>
                  </div>

                  <div className="flex my-2 border rounded-sm text-sm overflow-hidden w-fit">
                    <Button
                      variant={activeTab === "explore1" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("explore1")}
                      className={`rounded-none ${activeTab === "explore1" ? "bg-black text-white" : ""}`}
                    >
                      <Shapes className="w-4 h-4 mr-1" />
                      Explore I
                    </Button>
                    <Button
                      variant={activeTab === "explore2" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("explore2")}
                      className={`rounded-none ${activeTab === "explore2" ? "bg-black text-white" : ""}`}
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Explore II
                    </Button>
                    <Button
                      variant={activeTab === "explore3" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveTab("explore3")}
                      className={`rounded-none ${activeTab === "explore3" ? "bg-black text-white" : ""}`}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Explore III
                    </Button>
                  </div>
                </div>

                {/* Simulation Context - Always visible */}
                <Card className="mx-4 mb-4 p-3 border bg-gray-50">
                  <h3 className="text-sm font-semibold mb-1 text-gray-900">Context</h3>
                  <p className="text-gray-700 text-xs mb-2">{policyDescription}</p>
                  <div className="flex gap-3 text-xs text-gray-600">
                    <span>Agents: 100</span>
                    <span>Timeline: 180mo</span>
                    <span>AI: Yes</span>
                  </div>
                </Card>

                <div className="h-screen">
                  {activeTab === "explore1" ? (
                    <div className="p-4 h-full">
                      <CausalGraph
                        variables={variables}
                        relationships={relationships}
                        highlightedNode={highlightedNode}
                        highlightedRelationship={highlightedRelationship}
                      />
                    </div>
                  ) : activeTab === "explore2" ? (
                    <ChainReactionPanel
                      isActive={isSubmitted}
                      policyInput={`${policyTitle}: ${policyDescription}`}
                      onEventSelect={handleEventSelect}
                      selectedEventId={selectedEvent?.id}
                      onEventsUpdate={handleEventsUpdate}
                    />
                  ) : (
                    <div className="h-full overflow-hidden">
                      <AgentVisualizationSelector
                        caseStudy={policyTitle}
                        title="Agent-Based Simulation"
                        width={600}
                        height={500}
                      />
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Right column: Policy Assistant - Takes 1/3 of space */}
            <div className="lg:col-span-1">
              <Card className="overflow-hidden shadow-md h-full">
                <div className="p-4 border-b bg-gray-50">
                  <h2 className="text-xl font-bold">Policy Assistant</h2>
                  <p className="text-sm text-gray-600">
                    Ask questions about policy impacts and explore scenarios
                  </p>

                  {/* Quick tags for highlighting */}
                  {quickTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {quickTags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => {
                            // Find the original variable name with underscores
                            const originalVar = variables.find(v => v.replace(/_/g, ' ') === tag);
                            if (originalVar) handleHighlightNode(originalVar);
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="h-[480px]">
                  <ScenarioChat
                    scenario={{
                      id: "1",
                      title: policyTitle,
                      description: policyDescription,
                      variables: variables,
                    }}
                    onHighlightNode={handleHighlightNode}
                    onHighlightRelationship={handleHighlightRelationship}
                    onUpdateGraph={handleUpdateGraph}
                    selectedEvent={selectedEvent}
                    generateEventAnalysis={generateEventAnalysis}
                    activeSimulator={activeTab}
                    onChangeSimulator={setActiveTab}
                    onChatUpdate={handleChatUpdate}
                  />
                </div>
              </Card>
            </div>
          </div>

          {/* Insights Panel */}

          {!isSubmitted &&
            <Card className="p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">Integrated Policy Insights</h2>
              <p className="text-gray-600 mb-4">
                This comprehensive analysis combines causal relationships (Explore I), temporal chain reactions (Explore II),
                and agent-based dynamics (Explore III) to provide a multi-dimensional view of policy impacts.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-2 flex items-center">
                    <Shapes className="w-4 h-4 mr-2" />
                    Causal Structure
                  </h3>
                  <p className="text-sm text-gray-600">
                    The causal graph reveals key relationships between {variables.length} variables,
                    with {relationships.filter(r => Math.abs(r.strength) > 0.6).length} strong connections
                    that suggest significant policy leverage points.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-bold mb-2 flex items-center">
                    <Share2 className="w-4 h-4 mr-2" />
                    Temporal Effects
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chain reactions show how policy effects cascade through the system over time,
                    with initial stakeholder responses leading to broader impacts across multiple domains.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg ">
                  <h3 className="font-bold mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Agent Dynamics
                  </h3>
                  <p className="text-sm text-gray-600">
                    Force-directed simulation reveals emergent behaviors and interaction patterns between
                    different agent types, showing how policy adoption spreads through social networks.
                  </p>
                </div>
              </div>
            </Card>
          }
        </div>
      )}
    </div>
  )
}