"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shapes, Share2Icon } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  correlations?: Array<{ from: string; to: string; value: number; type: string }>
  variables?: string[]
  eventId?: string // For chain reaction events
}

interface ReactionEvent {
  id: string
  title: string
  description: string
  type: "positive" | "negative" | "neutral" | "alert"
  timestamp: Date
  magnitude: number
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
  selectedEvent?: ReactionEvent | null
  generateEventAnalysis?: (event: ReactionEvent) => string
  activeSimulator?: "explore1" | "explore2"
  onChangeSimulator?: (simulator: "explore1" | "explore2") => void
}

export default function ScenarioChat({
  scenario,
  onHighlightNode,
  onHighlightRelationship,
  onUpdateGraph,
  selectedEvent,
  generateEventAnalysis,
  activeSimulator = "explore1",
  onChangeSimulator
}: ScenarioChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [lastAnalyzedEventId, setLastAnalyzedEventId] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)
  const [lastActiveSimulator, setLastActiveSimulator] = useState<string | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize welcome message only once
  useEffect(() => {
    if (!initialized) {
      const welcomeMessage = {
        id: "1",
        role: "assistant" as const,
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
      };

      setMessages([welcomeMessage]);
      setInitialized(true);
      setLastActiveSimulator(activeSimulator);
    }
  }, [initialized, scenario.title, scenario.variables, activeSimulator]);

  // Handle new selected event from chain reaction panel
  useEffect(() => {
    if (
      selectedEvent &&
      selectedEvent.id !== lastAnalyzedEventId &&
      activeSimulator === "explore2" &&
      generateEventAnalysis
    ) {
      // Generate automatic analysis for the selected event
      const analysis = generateEventAnalysis(selectedEvent);

      const assistantMessage: Message = {
        id: `event-analysis-${Date.now()}`,
        role: "assistant",
        content: `**Chain Reaction Event Analysis: ${selectedEvent.title}**\n\n${analysis}`,
        timestamp: new Date(),
        eventId: selectedEvent.id
      }

      setMessages(prev => [...prev, assistantMessage]);
      setLastAnalyzedEventId(selectedEvent.id);
    }
  }, [selectedEvent, lastAnalyzedEventId, activeSimulator, generateEventAnalysis]);

  // Update welcome message when simulator changes - with proper dependency array
  useEffect(() => {
    if (!initialized || activeSimulator === lastActiveSimulator) return;

    // Update the last active simulator to prevent infinite updates
    setLastActiveSimulator(activeSimulator);

    // Add a message about switching modes
    if (activeSimulator === "explore1") {
      const switchMessage: Message = {
        id: `mode-switch-${Date.now()}`,
        role: "assistant",
        content: `Switched to **Explore I: Causal Graph** mode. You can now analyze causal relationships between variables and explore how they influence each other.`,
        timestamp: new Date(),
        variables: scenario.variables,
      };

      setMessages(prev => [...prev, switchMessage]);
    } else {
      const switchMessage: Message = {
        id: `mode-switch-${Date.now()}`,
        role: "assistant",
        content: `Switched to **Explore II: Chain Reactions** mode. You can now analyze how policy effects cascade through the system over time. Select an event from the panel to see detailed analysis.`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, switchMessage]);
    }
  }, [activeSimulator, initialized, scenario.variables, lastActiveSimulator]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Check for simulator switch commands
      const lowerInput = input.toLowerCase().trim();
      if (lowerInput.includes("switch to explore i") ||
        lowerInput.includes("switch to causal graph") ||
        lowerInput.includes("use explore i") ||
        lowerInput.includes("show causal graph")) {

        if (onChangeSimulator && activeSimulator !== "explore1") {
          onChangeSimulator("explore1");
        }

        const assistantMessage: Message = {
          id: `switch-response-${Date.now()}`,
          role: "assistant",
          content: `Switching to Explore I: Causal Graph mode. You can now analyze the relationships between variables in the causal graph.`,
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      if (lowerInput.includes("switch to explore ii") ||
        lowerInput.includes("switch to chain reaction") ||
        lowerInput.includes("use explore ii") ||
        lowerInput.includes("show chain reactions")) {

        if (onChangeSimulator && activeSimulator !== "explore2") {
          onChangeSimulator("explore2");
        }

        const assistantMessage: Message = {
          id: `switch-response-${Date.now()}`,
          role: "assistant",
          content: `Switching to Explore II: Chain Reactions mode. You can now analyze how policy effects cascade through the system over time.`,
          timestamp: new Date(),
        }

        setMessages(prev => [...prev, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // If we're in chain reaction mode and have a selected event, generate a response about that event
      if (activeSimulator === "explore2" && selectedEvent && generateEventAnalysis) {
        // Simulate a delay for more natural conversation flow
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate a response based on the user's question and the selected event
        const eventAnalysis = generateEventAnalysis(selectedEvent);
        const response = `Based on your question about the ${selectedEvent.title} event:\n\n${eventAnalysis}\n\nThis ${selectedEvent.type} event with ${Math.round(selectedEvent.magnitude)}% magnitude is a critical point in the policy implementation process that warrants careful monitoring.`;

        const assistantMessage: Message = {
          id: `event-response-${Date.now()}`,
          role: "assistant",
          content: response,
          timestamp: new Date(),
          eventId: selectedEvent.id
        }

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // For causal graph mode, use the API
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
          id: `api-response-${Date.now()}`,
          role: "assistant",
          content: result.response || "No response generated.",
          timestamp: new Date(),
          correlations: result.correlations || [],
          variables: result.variables || [],
        }
        setMessages((prev) => [...prev, assistantMessage])
      }
    } catch (error) {
      console.error("Error processing query:", error)
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
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

    // Handle event-related messages differently
    if (message.eventId) {
      return <span dangerouslySetInnerHTML={{ __html: content }} />
    }

    // Handle correlation values in causal graph messages
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
              key={`corr-${index}`}
              className={`${baseClasses} ${colorClasses}`}
              onClick={() => handleCorrelationClick(corr.from, corr.to)}
              title={`Correlation: ${corr.from} → ${corr.to}`}
            >
              {part}
            </button>
          )
        }
        return <span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: part }} />
      })
    }

    return <span dangerouslySetInnerHTML={{ __html: content }} />
  }

  // Get placeholder text based on active simulator
  const getPlaceholderText = () => {
    if (activeSimulator === "explore1") {
      return "Ask about causal relationships, variables, or policy impacts..."
    } else {
      return selectedEvent
        ? `Ask about the "${selectedEvent.title}" event or other chain reactions...`
        : "Select an event from the Chain Reaction panel or ask a general question..."
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <Card className={`max-w-[80%] p-4 ${message.role === "user" ? "bg-black text-white" : "bg-gray-50"} shadow-md`}>
              <div className="text-sm whitespace-pre-wrap">{renderMessageContent(message)}</div>
              {message.variables && message.variables.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.variables.map((variable, id) => (
                    <Badge
                      key={`var-${id}`}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-gray-100 transition-colors px-2 py-1"
                      onClick={() => handleVariableClick(variable)}
                    >
                      {variable.replace(/_/g, " ")}
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
                          key={`corr-btn-${index}`}
                          className={`${baseClasses} ${colorClasses}`}
                          onClick={() => handleCorrelationClick(corr.from, corr.to)}
                          title={`Correlation: ${corr.from} → ${corr.to}`}
                        >
                          {corr.from.replace(/_/g, " ")} → {corr.to.replace(/_/g, " ")}: {corr.value.toFixed(1)}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
              {/* Show event badge for chain reaction messages */}
              {message.eventId && selectedEvent && message.eventId === selectedEvent.id && (
                <div className="mt-3">
                  <Badge
                    variant={selectedEvent.type === "positive" ? "default" :
                      selectedEvent.type === "negative" ? "destructive" :
                        selectedEvent.type === "alert" ? "secondary" : "outline"}
                    className="text-xs"
                  >
                    {selectedEvent.title} Event
                  </Badge>
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
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholderText()}
              disabled={isLoading}
              className="pr-20 rounded-md border-gray-300 focus:ring-2 focus:ring-black"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <Button
                type="button"
                size="sm"
                variant={activeSimulator === "explore1" ? "default" : "outline"}
                className={`h-7 w-7 p-0 ${activeSimulator === "explore1" ? "bg-black" : ""}`}
                onClick={() => onChangeSimulator && onChangeSimulator("explore1")}
                title="Switch to Explore I: Causal Graph"
              >
                <Shapes className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant={activeSimulator === "explore2" ? "default" : "outline"}
                className={`h-7 w-7 p-0 ${activeSimulator === "explore2" ? "bg-black" : ""}`}
                onClick={() => onChangeSimulator && onChangeSimulator("explore2")}
                title="Switch to Explore II: Chain Reactions"
              >
                <Share2Icon className="w-4 h-4" />
              </Button>
            </div>
          </div>
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