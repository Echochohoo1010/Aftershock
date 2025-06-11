"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ScenarioChatProps {
  scenario: {
    id: string
    title: string
    description: string
    variables: string[]
  }
}

export default function ScenarioChat({ scenario }: ScenarioChatProps) {
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

  // Simulate AI responses (in production, this would call a real API)
  const generateResponse = async (userMessage: string): Promise<string> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Simple response generation based on keywords
    const lowerMessage = userMessage.toLowerCase()

    if (lowerMessage.includes("vaccination") || lowerMessage.includes("vaccine")) {
      return `Based on the causal model, vaccination policies have complex effects:

**Direct Effects:**
• Higher vaccination rates → Improved health outcomes (strength: 0.8)
• Innovation funding → Higher vaccination rates (strength: 0.6)

**Indirect Effects:**
• Vaccination success can increase public trust, but mandates might decrease it
• Economic benefits from better health outcomes can justify increased funding

**Policy Recommendations:**
1. Combine funding increases with transparent communication
2. Consider voluntary vs. mandatory approaches based on trust levels
3. Monitor feedback loops between trust and compliance

Would you like me to simulate a specific intervention scenario?`
    }

    if (lowerMessage.includes("innovation") || lowerMessage.includes("funding")) {
      return `Innovation funding creates cascading effects in our model:

**Primary Pathways:**
• Research funding → Innovation speed (0.9 correlation)
• Innovation → Economic growth (0.6 correlation)
• Economic growth → More funding availability

**Trade-offs:**
• Safety regulations may slow innovation (-0.4) but increase public safety (0.8)
• Fast innovation without safety measures can reduce long-term trust

**Strategic Considerations:**
Balance speed vs. safety based on:
- Risk tolerance of the population
- Competitive pressures
- Regulatory environment

What specific funding scenario would you like to explore?`
    }

    if (lowerMessage.includes("what if") || lowerMessage.includes("scenario")) {
      return `Great question! Let me walk through that scenario using our causal model:

**Scenario Analysis Framework:**
1. **Direct Effects**: Immediate changes to connected variables
2. **Indirect Effects**: Second and third-order consequences
3. **Feedback Loops**: How changes might reinforce or dampen over time
4. **Uncertainty Factors**: Variables we can't fully predict

**Key Considerations:**
• Time horizons (short vs. long-term effects)
• Stakeholder responses and adaptations
• External factors that might interfere
• Measurement and evaluation challenges

Could you be more specific about the intervention you want to model? For example: "What if we increased X by Y% while keeping Z constant?"`
    }

    // Default response
    return `That's an interesting question about ${scenario.title}. Let me analyze this through our causal framework:

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
        content: response,
        timestamp: new Date(),
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

  return (
    <div className="flex flex-col h-96">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card className={`max-w-[80%] p-3 ${message.role === "user" ? "bg-black text-white" : "bg-gray-50"}`}>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
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
    </div>
  )
}
