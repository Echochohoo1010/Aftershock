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
  correlations?: Array<{ from: string; to: string; value: number; type: string }>
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
  onUpdateGraph?: (relationships: Array<{ from: string; to: string; strength: number; type: string }>) => void
}

export default function ScenarioChat({
  scenario,
  onHighlightNode,
  onHighlightRelationship,
  onUpdateGraph,
}: ScenarioChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hi 👋🏼 I'm your AI policy assistant. I can help you explore the ${scenario.title} scenario. You can ask me about:

• Causal relationships between variables
• Potential policy interventions
• Unintended consequences
• Historical precedents
• Scenario simulations
• Causal graph insights

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
      const response = await fetch("/api/reason", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input.trim(), scenario }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) throw new Error(result.error)

      if (result.correlations?.length > 0 && onUpdateGraph) {
        onUpdateGraph(result.correlations)
      }

      if (result.variables?.length > 0 && onHighlightNode) {
        onHighlightNode(result.variables[0])
      }

      if (result.correlations?.length > 0 && onHighlightRelationship) {
        onHighlightRelationship(result.correlations[0].from, result.correlations[0].to)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: result.response || "No response generated.",
        timestamp: new Date(),
        correlations: result.correlations || [],
        variables: result.variables || [],
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error processing query:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
        correlations: [],
        variables: [],
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

  const handleCorrelationClick = (from: string, to: string) => {
    if (onHighlightRelationship) {
      onHighlightRelationship(from, to)
    }
  }

  const renderMessageContent = (message: Message) => {
    let content = message.content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    if (message.correlations && message.correlations.length > 0) {
      const parts = content.split(/(\b-?\d*\.?\d+\b)/g)
      return parts.map((part, index) => {
        const corr = message.correlations!.find((c) => c.value.toFixed(1) === part)
        if (corr) {
          const baseClasses = "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border cursor-pointer transition-all duration-200"
          const colorClasses =
            corr.type === "positive"
              ? "bg-green-100 text-green-800 border-green-300 hover:bg-green-200 hover:shadow-md"
              : corr.type === "negative"
              ? "bg-red-100 text-red-800 border-red-300 hover:bg-red-200 hover:shadow-md"
              : "bg-purple-100 text-purple-800 border-purple-300 hover:bg-purple-200 hover:shadow-md"
          return (
            <button
              key={index}
              className={`${baseClasses} ${colorClasses}`}
              onClick={() => handleCorrelationClick(corr.from, corr.to)}
              title={`Correlation: ${corr.from} → ${corr.to}`}
            >
              {part}
            </button>
          )
        }
        return <span key={index} dangerouslySetInnerHTML={{ __html: part }} />
      })
    }
    return <span dangerouslySetInnerHTML={{ __html: content }} />
  }

  return (
    <div className="flex flex-col h-96 ">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card className={`max-w-[80%] p-4 ${message.role === "user" ? "bg-black text-white" : "bg-gray-50"} shadow-md`}>
              <div className="text-sm whitespace-pre-wrap">{renderMessageContent(message)}</div>
              {message.variables && message.variables.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.variables.map((variable) => (
                    <Badge
                      key={variable}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-gray-100 transition-colors px-2 py-1"
                      onClick={() => handleVariableClick(variable)}
                    >
                      {variable.replace("_", " ")}
                    </Badge>
                  ))}
                </div>
              )}
              {message.correlations && message.correlations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs text-gray-500 font-medium">Correlations:</div>
                  <div className="flex flex-wrap gap-2">
                    {message.correlations.map((corr, index) => {
                      const baseClasses = "flex items-center px-3 py-1 rounded-full text-sm font-medium border cursor-pointer transition-all duration-200"
                      const colorClasses =
                        corr.type === "positive"
                          ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          : corr.type === "negative"
                          ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                          : "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                      return (
                        <button
                          key={index}
                          className={`${baseClasses} ${colorClasses}`}
                          onClick={() => handleCorrelationClick(corr.from, corr.to)}
                          title={`Correlation: ${corr.from} → ${corr.to}`}
                        >
                          {corr.from.replace("_", " ")} → {corr.to.replace("_", " ")}: {corr.value.toFixed(1)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className={`text-xs mt-3 ${message.role === "user" ? "text-gray-300" : "text-gray-500"}`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </Card>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <Card className="bg-gray-50 p-4 shadow-md">
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
      <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about policy scenarios, interventions, causal relationships, or causal graph insights..."
            disabled={isLoading}
            className="flex-1 rounded-md border-gray-300 focus:ring-2 focus:ring-black"
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-black text-white hover:bg-gray-800 rounded-md px-4 py-2 transition-colors"
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}