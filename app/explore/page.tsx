"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import CausalGraph from "@/components/causal-graph"
import ScenarioChat from "@/components/scenario-chat"

const policyScenarios = [
  {
    id: "vaccination",
    title: "Vaccination Policy & Innovation",
    description:
      "Explore how vaccination policies affect public health outcomes, innovation incentives, and social trust",
    variables: ["vaccination_rate", "innovation_funding", "public_trust", "health_outcomes", "economic_impact"],
    relationships: [
      { from: "vaccination_rate", to: "health_outcomes", strength: 0.8, type: "positive" },
      { from: "innovation_funding", to: "vaccination_rate", strength: 0.6, type: "positive" },
      { from: "public_trust", to: "vaccination_rate", strength: 0.7, type: "positive" },
      { from: "health_outcomes", to: "economic_impact", strength: 0.5, type: "positive" },
      { from: "vaccination_rate", to: "public_trust", strength: 0.3, type: "complex" },
    ],
  },
  {
    id: "ai_research",
    title: "Academic Citations Measure the Impact of New Ideas",
    description:
      "Analyze how AI research funding, government support, and talent immigration contribute to innovation, productivity, and the academic impact of new ideas, using citations as a key metric.",
    variables: [
      "research_funding",
      "innovation_speed",
      "academic_citations",
      "economic_growth",
      "govt_rd_funding",
      "productivity_growth",
      "talent_immigration",
    ],
    relationships: [
      { from: "govt_rd_funding", to: "research_funding", strength: 0.8, type: "positive" },
      { from: "research_funding", to: "innovation_speed", strength: 0.9, type: "positive" },
      { from: "innovation_speed", to: "academic_citations", strength: 0.7, type: "positive" },
      { from: "innovation_speed", to: "productivity_growth", strength: 0.6, type: "positive" },
      { from: "talent_immigration", to: "innovation_speed", strength: 0.8, type: "positive" },
      { from: "talent_immigration", to: "productivity_growth", strength: 0.7, type: "positive" },
      { from: "productivity_growth", to: "economic_growth", strength: 0.9, type: "positive" },
    ],
  },
  {
    id: "talent_productivity",
    title: "Talent Immigration and Productivity Growth",
    description:
      "Examine how international talent migration contributes to national productivity, innovation, and long-term economic performance. Explore the role of research funding and policy in amplifying these effects.",
    variables: [
      "talent_immigration",
      "innovation_capacity",
      "productivity_growth",
      "economic_growth",
      "govt_rd_funding",
      "academic_citations",
    ],
    relationships: [
      { from: "talent_immigration", to: "innovation_capacity", strength: 0.8, type: "positive" },
      { from: "innovation_capacity", to: "productivity_growth", strength: 0.7, type: "positive" },
      { from: "productivity_growth", to: "economic_growth", strength: 0.9, type: "positive" },
      { from: "govt_rd_funding", to: "innovation_capacity", strength: 0.75, type: "positive" },
      { from: "talent_immigration", to: "productivity_growth", strength: 0.6, type: "positive" },
      { from: "innovation_capacity", to: "academic_citations", strength: 0.65, type: "positive" },
    ],
  },
]

export default function ExplorePage() {
  const [selectedScenario, setSelectedScenario] = useState(policyScenarios[0])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [customQuery, setCustomQuery] = useState("")
  const [highlightedNode, setHighlightedNode] = useState<string | null>(null)
  const [highlightedRelationship, setHighlightedRelationship] = useState<{ from: string; to: string } | null>(null)

  const handleScenarioSelect = (scenario: (typeof policyScenarios)[0]) => {
    setSelectedScenario(scenario)
    setHighlightedNode(null)
    setHighlightedRelationship(null)
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    // Simulate analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsAnalyzing(false)
  }

  const handleHighlightNode = (variable: string | null) => {
    setHighlightedNode(variable)
    setHighlightedRelationship(null)
  }

  const handleHighlightRelationship = (from: string, to: string) => {
    setHighlightedRelationship({ from, to })
    setHighlightedNode(null)
  }

  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="font-heading text-5xl font-bold mb-6">Policy Scenario Explorer</h1>
          <p className="text-xl text-gray-700 max-w-4xl leading-relaxed">
            Use causal AI to explore policy scenarios, understand complex relationships, and simulate interventions in
            real-world systems. This tool combines causal inference with generative AI to help policymakers reason about
            uncertainty and unintended consequences.
          </p>
        </div>

        {/* Scenario Selection */}
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-semibold mb-4">Select a Policy Scenario</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {policyScenarios.map((scenario) => (
              <Card
                key={scenario.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedScenario.id === scenario.id ? "ring-2 ring-black" : ""
                }`}
                onClick={() => handleScenarioSelect(scenario)}
              >
                <CardHeader>
                  <CardTitle className="font-heading text-lg">{scenario.title}</CardTitle>
                  <CardDescription>{scenario.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {scenario.variables.slice(0, 3).map((variable) => (
                      <Badge key={variable} variant="secondary" className="text-xs">
                        {variable.replace("_", " ")}
                      </Badge>
                    ))}
                    {scenario.variables.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{scenario.variables.length - 3} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Analysis Interface */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Causal Graph Visualization */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">Causal Graph</CardTitle>
              <CardDescription>
                Interactive visualization of causal relationships in the {selectedScenario.title.toLowerCase()} scenario
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CausalGraph
                variables={selectedScenario.variables}
                relationships={selectedScenario.relationships}
                highlightedNode={highlightedNode}
                highlightedRelationship={highlightedRelationship}
              />
            </CardContent>
          </Card>

          {/* Scenario Chat Interface */}
          <Card>
            <CardHeader>
              <CardTitle className="font-heading">AI Policy Assistant</CardTitle>
              <CardDescription>Chat with our AI to explore policy implications and generate scenarios</CardDescription>
            </CardHeader>
            <CardContent>
              <ScenarioChat
                scenario={selectedScenario}
                onHighlightNode={handleHighlightNode}
                onHighlightRelationship={handleHighlightRelationship}
              />
            </CardContent>
          </Card>
        </div>

        {/* Custom Analysis */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="font-heading">Custom Policy Analysis</CardTitle>
            <CardDescription>
              Describe a policy intervention or ask a specific question about the scenario
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., What would happen if we increased vaccination funding by 50% while implementing stricter safety regulations?"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleAnalyze}
              disabled={!customQuery.trim() || isAnalyzing}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isAnalyzing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                "Analyze Scenario"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Methodology */}
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">How It Works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-heading font-semibold mb-2">1. Causal Modeling</h3>
                <p className="text-sm text-gray-600">
                  We use directed acyclic graphs (DAGs) to represent causal relationships between policy variables,
                  based on domain expertise and empirical evidence.
                </p>
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">2. AI-Powered Analysis</h3>
                <p className="text-sm text-gray-600">
                  Large language models trained on policy research help generate scenarios, identify potential
                  unintended consequences, and suggest intervention strategies.
                </p>
              </div>
              <div>
                <h3 className="font-heading font-semibold mb-2">3. Interactive Exploration</h3>
                <p className="text-sm text-gray-600">
                  Users can manipulate variables, ask counterfactual questions, and explore different policy pathways
                  through natural language interaction.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
