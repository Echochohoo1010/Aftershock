"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, TrendingUp, TrendingDown, AlertCircle, Pause, Play } from "lucide-react"

interface ReactionEvent {
    id: string
    title: string
    description: string
    type: "positive" | "negative" | "neutral" | "alert"
    timestamp: Date
    magnitude: number
}

interface ChainReactionPanelProps {
    isActive: boolean
    policyInput?: string
    onEventSelect?: (event: ReactionEvent) => void
    selectedEventId?: string
}

const ChainReactionPanel = ({ isActive, policyInput, onEventSelect, selectedEventId }: ChainReactionPanelProps) => {
    const [events, setEvents] = useState<ReactionEvent[]>([])
    const [isPaused, setIsPaused] = useState(false)
    const [eventIndex, setEventIndex] = useState(0)

    // Reset events when policy changes
    useEffect(() => {
        if (isActive && policyInput) {
            setEvents([])
            setEventIndex(0)
        }
    }, [isActive, policyInput])

    // Generate events at regular intervals
    useEffect(() => {
        if (!isActive || !policyInput || isPaused) return

        const eventTemplates = [
            { title: "Policy Implementation", type: "neutral", description: "Initial policy parameters set" },
            { title: "Stakeholder Response", type: "positive", description: "Business sector adaptation initiated" },
            { title: "Market Adjustment", type: "negative", description: "Short-term market volatility detected" },
            { title: "Regulatory Compliance", type: "neutral", description: "New compliance protocols established" },
            { title: "Economic Impact", type: "positive", description: "GDP growth projection updated" },
            { title: "Social Response", type: "alert", description: "Public opinion shift detected" },
            { title: "Resource Allocation", type: "neutral", description: "Budget redistribution in progress" },
            { title: "Long-term Effects", type: "positive", description: "Sustainable development indicators improving" },
        ]

        // Create a timer that adds one event at a time
        const timer = setInterval(() => {
            if (eventIndex >= eventTemplates.length) {
                clearInterval(timer)
                return
            }

            const template = eventTemplates[eventIndex]

            // Use a truly unique ID by combining timestamp with a random number and index
            const uniqueId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}-${eventIndex}`;

            const newEvent: ReactionEvent = {
                id: uniqueId,
                title: template.title,
                description: template.description,
                type: template.type as ReactionEvent["type"],
                timestamp: new Date(),
                magnitude: Math.random() * 100,
            }

            setEvents(prev => {
                const updatedEvents = [newEvent, ...prev].slice(0, 20);

                // Auto-select the first event if onEventSelect is provided
                if (onEventSelect && eventIndex === 0) {
                    setTimeout(() => {
                        onEventSelect(newEvent);
                    }, 500);
                }

                return updatedEvents;
            });

            setEventIndex(prev => prev + 1);
        }, 2000); // Add a new event every 2 seconds

        return () => {
            clearInterval(timer);
        };
    }, [isActive, policyInput, isPaused, eventIndex, onEventSelect]);

    const getEventIcon = (type: ReactionEvent["type"]) => {
        switch (type) {
            case "positive":
                return <TrendingUp className="w-4 h-4 text-green-600" />
            case "negative":
                return <TrendingDown className="w-4 h-4 text-red-600" />
            case "alert":
                return <AlertCircle className="w-4 h-4 text-yellow-600" />
            default:
                return <Clock className="w-4 h-4 text-gray-500" />
        }
    }

    const getEventBadgeVariant = (type: ReactionEvent["type"]) => {
        switch (type) {
            case "positive":
                return "default"
            case "negative":
                return "destructive"
            case "alert":
                return "secondary"
            default:
                return "outline"
        }
    }

    return (
        <div className="h-full flex flex-col overflow-hidden bg-white">
            {/* Header with pause button */}
            <div className="p-4 border-b bg-white">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-medium">Chain Reactions</h3>
                    <Button
                        onClick={() => setIsPaused(!isPaused)}
                        variant="outline"
                        size="sm"
                        disabled={!isActive}
                    >
                        {isPaused ? <Play className="w-4 h-4 mr-1" /> : <Pause className="w-4 h-4 mr-1" />}
                        {isPaused ? "Resume" : "Pause"}
                    </Button>
                </div>
                <p className="text-xs text-gray-500">Real-time system responses to policy changes</p>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-4 space-y-3">
                    {events.length === 0 && !isActive && (
                        <div className="text-center py-8 text-gray-400">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Submit a policy to see chain reactions</p>
                        </div>
                    )}

                    {events.length === 0 && isActive && (
                        <div className="text-center py-8 text-gray-400">
                            <div className="animate-pulse flex space-x-1 justify-center mb-2">
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            </div>
                            <p className="text-sm">Analyzing policy impacts...</p>
                        </div>
                    )}

                    {events.map((event, index) => (
                        <div
                            key={event.id}
                            onClick={() => onEventSelect && onEventSelect(event)}
                            className={`p-3 bg-white rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md ${selectedEventId === event.id ? 'border-black ring-1 ring-black/20' : 'border-gray-200'
                                }`}
                            style={{
                                animationName: 'fadeIn',
                                animationDuration: '0.5s',
                                animationFillMode: 'both',
                                animationDelay: `${index * 0.1}s`
                            }}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                    {getEventIcon(event.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-sm font-medium">{event.title}</h3>
                                        <Badge variant={getEventBadgeVariant(event.type)} className="text-xs">
                                            {event.type}
                                        </Badge>
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">{event.description}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-400">
                                            {event.timestamp.toLocaleTimeString()}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <div className="w-20 h-1 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-black transition-all duration-500"
                                                    style={{ width: `${event.magnitude}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {Math.round(event.magnitude)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default ChainReactionPanel