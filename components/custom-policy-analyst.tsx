"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, RotateCcw } from "lucide-react"

interface GeneratedRelationship {
  from: string
  to: string
  strength: number
  type: "positive" | "negative" | "complex"
  explanation: string
}

interface CustomPolicyAnalystProps {
  onGenerateGraph: (variables: string[], relationships: GeneratedRelationship[]) => void
  onUpdateChat: (analysis: string, variables: string[], relationships: GeneratedRelationship[]) => void
}

export default function CustomPolicyAnalyst({ onGenerateGraph, onUpdateChat }: CustomPolicyAnalystProps) {
  const [variableA, setVariableA] = useState("")
  const [variableB, setVariableB] = useState("")
  const [context, setContext] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedGraph, setGeneratedGraph] = useState<{
    variables: string[]
    relationships: GeneratedRelationship[]
    analysis: string
  } | null>(null)

  const generateCausalGraph = async () => {
    if (!variableA.trim() || !variableB.trim()) return

    setIsGenerating(true)

    // Simulate AI analysis delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate intermediate variables and relationships
    const cleanVarA = variableA.trim().toLowerCase().replace(/\s+/g, "_")
    const cleanVarB = variableB.trim().toLowerCase().replace(/\s+/g, "_")

    // Generate 2-3 intermediate variables based on context
    const intermediateVars = generateIntermediateVariables(cleanVarA, cleanVarB, context)
    const allVariables = [cleanVarA, ...intermediateVars, cleanVarB]

    // Generate 3-5 causal relationships
    const relationships = generateCausalRelationships(allVariables, cleanVarA, cleanVarB)

    // Generate analysis text
    const analysis = generateAnalysisText(cleanVarA, cleanVarB, relationships, context)

    const result = {
      variables: allVariables,
      relationships,
      analysis,
    }

    setGeneratedGraph(result)
    setIsGenerating(false)
  }

  const generateIntermediateVariables = (varA: string, varB: string, context: string): string[] => {
    // Context-aware intermediate variable generation
    const contextLower = context.toLowerCase()

    if (contextLower.includes("innovation") || contextLower.includes("research")) {
      return ["research_funding", "innovation_capacity", "knowledge_transfer"]
    }

    if (contextLower.includes("economic") || contextLower.includes("growth")) {
      return ["investment_levels", "market_confidence", "productivity_gains"]
    }

    if (contextLower.includes("policy") || contextLower.includes("regulation")) {
      return ["regulatory_framework", "compliance_costs", "stakeholder_engagement"]
    }

    if (contextLower.includes("social") || contextLower.includes("public")) {
      return ["public_awareness", "social_acceptance", "behavioral_change"]
    }

    if (contextLower.includes("technology") || contextLower.includes("digital")) {
      return ["tech_adoption", "digital_infrastructure", "skill_development"]
    }

    // Default intermediate variables
    return ["institutional_capacity", "resource_allocation", "implementation_effectiveness"]
  }

  const generateCausalRelationships = (
    variables: string[],
    startVar: string,
    endVar: string,
  ): GeneratedRelationship[] => {
    const relationships: GeneratedRelationship[] = []

    // Create a path from A to B through intermediate variables
    for (let i = 0; i < variables.length - 1; i++) {
      const from = variables[i]
      const to = variables[i + 1]

      // Generate realistic correlation strengths
      const strength = 0.4 + Math.random() * 0.5 // Between 0.4 and 0.9
      const type = strength > 0.7 ? "positive" : strength > 0.5 ? "complex" : "positive"

      relationships.push({
        from,
        to,
        strength: Number.parseFloat(strength.toFixed(1)),
        type,
        explanation: generateRelationshipExplanation(from, to, strength),
      })
    }

    // Add 1-2 additional cross-relationships for complexity
    if (variables.length >= 4) {
      // Add a relationship that skips one intermediate variable
      const skipRelationship = {
        from: variables[0],
        to: variables[2],
        strength: Number.parseFloat((0.3 + Math.random() * 0.4).toFixed(1)),
        type: "complex" as const,
        explanation: `Direct influence pathway between ${variables[0].replace("_", " ")} and ${variables[2].replace("_", " ")}`,
      }
      relationships.push(skipRelationship)

      // Add a feedback loop if we have enough variables
      if (variables.length >= 5) {
        const feedbackRelationship = {
          from: variables[variables.length - 2],
          to: variables[1],
          strength: Number.parseFloat((0.2 + Math.random() * 0.3).toFixed(1)),
          type: "positive" as const,
          explanation: `Feedback effect from ${variables[variables.length - 2].replace("_", " ")} back to ${variables[1].replace("_", " ")}`,
        }
        relationships.push(feedbackRelationship)
      }
    }

    return relationships
  }

  const generateRelationshipExplanation = (from: string, to: string, strength: number): string => {
    const fromClean = from.replace("_", " ")
    const toClean = to.replace("_", " ")

    if (strength > 0.7) {
      return `Strong positive relationship: ${fromClean} significantly enhances ${toClean}`
    }
    if (strength > 0.5) {
      return `Moderate relationship: ${fromClean} influences ${toClean} through multiple pathways`
    }
    return `Weak but meaningful connection: ${fromClean} has indirect effects on ${toClean}`
  }

  const generateAnalysisText = (
    varA: string,
    varB: string,
    relationships: GeneratedRelationship[],
    context: string,
  ): string => {
    const varAClean = varA.replace("_", " ")
    const varBClean = varB.replace("_", " ")

    return `## Causal Analysis: ${varAClean} → ${varBClean}

**Context:** ${context || "General policy analysis"}

**Generated Causal Pathway:**
${relationships
  .map(
    (rel) =>
      `• **${rel.from.replace("_", " ")}** → **${rel.to.replace("_", " ")}** (${rel.strength}): ${rel.explanation}`,
  )
  .join("\n")}

**Key Insights:**
1. **Direct Effects**: The primary pathway shows ${relationships.length} intermediate steps
2. **Strength Analysis**: Average correlation strength is ${(relationships.reduce((sum, rel) => sum + rel.strength, 0) / relationships.length).toFixed(2)}
3. **Policy Implications**: This pathway suggests that interventions targeting ${varAClean} will affect ${varBClean} through multiple mechanisms

**Recommendations:**
- Monitor intermediate variables for early indicators of change
- Consider multi-pronged interventions that address several pathway components
- Establish feedback mechanisms to track unintended consequences

Click on any correlation value or variable name to highlight it in the graph above.`
  }

  const handleApplyGraph = () => {
    if (generatedGraph) {
      onGenerateGraph(generatedGraph.variables, generatedGraph.relationships)
      onUpdateChat(generatedGraph.analysis, generatedGraph.variables, generatedGraph.relationships)
    }
  }

  const handleReset = () => {
    setVariableA("")
    setVariableB("")
    setContext("")
    setGeneratedGraph(null)
  }

  return (
    <Card className="w-full">
     
      <CardHeader>
        <CardTitle className="font-heading flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Custom Policy Analyst
        </CardTitle>
        <CardDescription>
          Enter two variables to generate a causal pathway analysis with intermediate relationships
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 ">

<div className="grid grid-cols-2 w-full">
      <div>
        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="variable-a">Variable A (Starting Point)</Label>
            <Input
              id="variable-a"
              placeholder="e.g., Government Funding"
              value={variableA}
              onChange={(e) => setVariableA(e.target.value)}
              disabled={isGenerating}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="variable-b">Variable B (Outcome)</Label>
            <Input
              id="variable-b"
              placeholder="e.g., Innovation Rate"
              value={variableB}
              onChange={(e) => setVariableB(e.target.value)}
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* Context Input */}
        <div className="space-y-2 ">
          <Label htmlFor="context">Policy Context (Optional)</Label>
          <Textarea
            id="context"
            placeholder="Describe the policy domain, specific context, or constraints that should influence the causal pathway..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={isGenerating}
            className="min-h-[80px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={generateCausalGraph}
            disabled={!variableA.trim() || !variableB.trim() || isGenerating}
            className="bg-black text-white hover:bg-gray-800 flex-1"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Analysis...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Causal Analysis
              </>
            )}
          </Button>
          <Button onClick={handleReset} variant="outline" disabled={isGenerating}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        </div>
<div>

 

        {/* Generated Results */}
        {generatedGraph && (
          <div className="border-l ml-4 px-6 space-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold">Generated Causal Pathway</h3>
              <Button onClick={handleApplyGraph} className="bg-green-600 hover:bg-green-700 text-white">
                <ArrowRight className="h-4 w-4 mr-2" />
                Apply to Graph & Chat
              </Button>
              <Button
  variant="outline"
  onClick={() => navigator.clipboard.writeText(generatedGraph.analysis)}
>
  Copy Analysis
</Button>

            </div>

            {/* Variable Flow Visualization */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-center flex-wrap gap-2">
                {generatedGraph.variables.map((variable, index) => (
                  <div key={variable} className="flex items-center">
                    <Badge variant="secondary" className="px-3 py-1">
                      {variable.replace("_", " ")}
                    </Badge>
                    {index < generatedGraph.variables.length - 1 && (
                      <ArrowRight className="h-4 w-4 mx-2 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Relationships Summary */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Generated Relationships:</h4>
              <div className="grid gap-2">
                {generatedGraph.relationships.map((rel, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rel.from.replace("_", " ")}</span>
                      <ArrowRight className="h-3 w-3 text-gray-400" />
                      <span className="font-medium">{rel.to.replace("_", " ")}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        rel.type === "positive"
                          ? "border-green-300 text-green-700"
                          : rel.type === "negative"
                            ? "border-red-300 text-red-700"
                            : "border-purple-300 text-purple-700"
                      }
                    >
                      {rel.strength}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>  </div> 

      
      </CardContent>
    </Card>
  )
}
