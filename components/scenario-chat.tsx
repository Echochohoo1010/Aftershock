"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  correlations?: Array<{
    from: string
    to: string
    value: number
    type: "positive" | "negative" | "complex"
  }>
  variables?: string[]
}

interface ScenarioChatProps {
  scenario: {
    id: string
    title: string
    description: string
    variables: string[]
  }
  onHighlightNode?: (variable: string | null) => void
  onHighlightRelationship?: (from: string, to: string) => void
}

export default function ScenarioChat({ scenario, onHighlightNode, onHighlightRelationship }: ScenarioChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello! I'm your AI policy assistant. I can help you explore the ${scenario.title} scenario. You can ask me about:

• Causal relationships between variables
• Potential policy interventions
• Unintended consequences
• Historical precedents
• Scenario simulations

What would you like to explore?`,
      timestamp: new Date(),
      variables: scenario.variables,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Extract correlations from text
  const extractCorrelations = (text: string) => {
    const correlations: Array<{
      from: string
      to: string
      value: number
      type: "positive" | "negative" | "complex"
    }> = []

    // Pattern to match correlation descriptions
    const patterns = [
      /(\w+(?:_\w+)*)\s*→\s*(\w+(?:_\w+)*)\s*$$(?:strength:|correlation:)?\s*([-]?\d*\.?\d+)$$/gi,
      /(\w+(?:_\w+)*)\s*to\s*(\w+(?:_\w+)*)\s*:\s*([-]?\d*\.?\d+)/gi,
      /correlation between\s*(\w+(?:_\w+)*)\s*and\s*(\w+(?:_\w+)*)\s*is\s*([-]?\d*\.?\d+)/gi,
    ]

    patterns.forEach((pattern) => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        const [, from, to, valueStr] = match
        const value = Number.parseFloat(valueStr)
        if (!Number.isNaN(value) && Math.abs(value) <= 1) {
          correlations.push({
            from: from.toLowerCase(),
            to: to.toLowerCase(),
            value,
            type: value > 0 ? "positive" : value < 0 ? "negative" : "complex",
          })
        }
      }
    })

    return correlations
  }

  // Format text with correlation tags
  const formatMessageContent = (content: string, correlations?: Array<any>) => {
    let formattedContent = content

    // Replace correlation patterns with tagged versions
    const correlationPattern = /([-]?\d*\.?\d+)(?=\s*(?:correlation|strength))/gi
    formattedContent = formattedContent.replace(correlationPattern, (match) => {
      const value = Number.parseFloat(match)
      if (!Number.isNaN(value) && Math.abs(value) <= 1) {
        const type = value > 0 ? "positive" : value < 0 ? "negative" : "complex"
        return `<correlation data-value="${value}" data-type="${type}">${match}</correlation>`
      }
      return match
    })

    return formattedContent
  }

  // Simulate AI responses with rich formatting
  const generateResponse = async (
    userMessage: string,
  ): Promise<{ content: string; correlations?: any[]; variables?: string[] }> => {
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("vaccination") || lowerMessage.includes("vaccine")) {
      const content = `Based on the causal model, vaccination policies have complex effects:

**Direct Effects:**
• Higher vaccination_rate → health_outcomes (strength: **0.8**)
• innovation_funding → vaccination_rate (strength: **0.6**)

**Indirect Effects:**
• Vaccination success can increase public_trust, but mandates might decrease it
• Economic benefits from better health_outcomes can justify increased funding

**Policy Recommendations:**
1. Combine funding increases with transparent communication
2. Consider voluntary vs. mandatory approaches based on trust levels
3. Monitor feedback loops between trust and compliance

The correlation between vaccination_rate and public_trust is **0.3**, indicating a complex relationship.`

      return {
        content,
        correlations: extractCorrelations(content),
        variables: ["vaccination_rate", "health_outcomes", "innovation_funding", "public_trust"],
      }
    }

    if (lowerMessage.includes("innovation") || lowerMessage.includes("funding") || lowerMessage.includes("research")) {
      const content = `Innovation funding creates cascading effects in our model:

**Primary Pathways:**
• research_funding → innovation_speed (correlation: **0.9**)
• innovation_speed → academic_citations (strength: **0.7**)
• talent_immigration → innovation_speed (correlation: **0.8**)

**Economic Impact:**
• innovation_speed → productivity_growth (strength: **0.6**)
• productivity_growth → economic_growth (correlation: **0.9**)

**Government Role:**
• govt_rd_funding → research_funding (strength: **0.8**)

**Strategic Considerations:**
The correlation between talent_immigration and productivity_growth is **0.7**, showing how skilled migration directly boosts economic performance.

Academic citations serve as a key metric, with innovation_speed to academic_citations showing a **0.7** correlation.`

      return {
        content,
        correlations: extractCorrelations(content),
        variables: [
          "research_funding",
          "innovation_speed",
          "academic_citations",
          "talent_immigration",
          "productivity_growth",
        ],
      }
    }

    if (lowerMessage.includes("talent") || lowerMessage.includes("immigration")) {
      const content = `Talent immigration has significant impacts on innovation and productivity:

**Direct Effects:**
• talent_immigration → innovation_speed (strength: **0.8**)
• talent_immigration → productivity_growth (correlation: **0.7**)

**Innovation Pathway:**
• innovation_speed → academic_citations (strength: **0.7**)
• academic_citations measure the impact of new ideas

**Economic Multiplier:**
• productivity_growth → economic_growth (correlation: **0.9**)

The relationship between talent_immigration and innovation_speed shows a **0.8** correlation, indicating that skilled migration is crucial for maintaining competitive advantage in research and development.`

      return {
        content,
        correlations: extractCorrelations(content),
        variables: ["talent_immigration", "innovation_speed", "productivity_growth", "academic_citations"],
      }
    }

    // Default response
    const content = `That's an interesting question about ${scenario.title}. Let me analyze this through our causal framework:

**Relevant Variables:**
${scenario.variables
  .slice(0, 3)
  .map((v) => `• ${v.replace("_", " ")}`)
  .join("\n")}

**Analysis Approach:**
1. Identify which variables your question affects directly
2. Trace causal pathways through the network
3. Consider feedback loops and unintended consequences
4. Assess uncertainty and confidence levels

Could you help me understand your question better? Are you interested in:
- A specific policy intervention?
- Comparing different approaches?
- Understanding historical patterns?
- Predicting future scenarios?`

    return {
      content,
      variables: scenario.variables.slice(0, 3),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await generateResponse(input.trim())
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        correlations: response.correlations,
        variables: response.variables,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVariableClick = (variable: string) => {
    if (onHighlightNode) {
      onHighlightNode(variable)
    }
  }

  const handleCorrelationClick = (correlation: any) => {
    if (onHighlightRelationship) {
      onHighlightRelationship(correlation.from, correlation.to)
    }
  }

  const renderMessageContent = (message: Message) => {
    let content = message.content

    // Replace **text** with bold formatting
    content = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")

    // Replace correlation values with clickable tags
    if (message.correlations) {
      message.correlations.forEach((corr) => {
        const pattern = new RegExp(`\\b${corr.value.toFixed(1)}\\b`, "g")
        content = content.replace(pattern, (match) => {
          const colorClass =
            corr.type === "positive"
              ? "bg-green-100 text-green-800 border-green-300"
              : corr.type === "negative"
                ? "bg-red-100 text-red-800 border-red-300"
                : "bg-purple-100 text-purple-800 border-purple-300"
          return `<span class="correlation-tag ${colorClass}" data-from="${corr.from}" data-to="${corr.to}">${match}</span>`
        })
      })
    }

    return content
  }

  return (
    <div className="flex flex-col h-96">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card className={`max-w-[80%] p-3 ${message.role === "user" ? "bg-black text-white" : "bg-gray-50"}`}>
              <div
                className="text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: renderMessageContent(message) }}
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  if (target.classList.contains("correlation-tag")) {
                    const from = target.getAttribute("data-from")
                    const to = target.getAttribute("data-to")
                    if (from && to && onHighlightRelationship) {
                      onHighlightRelationship(from, to)
                    }
                  }
                }}
              />

              {/* Variable Tags */}
              {message.variables && message.variables.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {message.variables.map((variable) => (
                    <Badge
                      key={variable}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleVariableClick(variable)}
                    >
                      {variable.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              )}

              {/* Correlation Tags */}
              {message.correlations && message.correlations.length > 0 && (
                <div className="mt-3 space-y-1">
                  <div className="text-xs text-gray-500 font-medium">Correlations:</div>
                  <div className="flex flex-wrap gap-1">
                    {message.correlations.map((corr, index) => (
                      <button
                        key={index}
                        onClick={() => handleCorrelationClick(corr)}
                        className={`text-xs px-2 py-1 rounded border cursor-pointer hover:shadow-sm transition-all ${
                          corr.type === "positive"
                            ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200"
                            : corr.type === "negative"
                              ? "bg-red-100 text-red-800 border-red-300 hover:bg-red-200"
                              : "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200"
                        }`}
                      >
                        {corr.from.replace("_", " ")} → {corr.to.replace("_", " ")}: {corr.value.toFixed(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className={`text-xs mt-2 ${message.role === "user" ? "text-gray-300" : "text-gray-500"}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-gray-50 p-3">
              <div className="flex items-center space-x-2">
                <div className="animate-pulse flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
                <span className="text-sm text-gray-500">AI is thinking...</span>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about policy scenarios, interventions, or causal relationships..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="bg-black text-white hover:bg-gray-800">
            Send
          </Button>
        </div>
      </form>

      <style jsx>{`
        .correlation-tag {
          display: inline-block;
          padding: 2px 6px;
          border-radius: 4px;
          border: 1px solid;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 500;
        }
        .correlation-tag:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  )
}
