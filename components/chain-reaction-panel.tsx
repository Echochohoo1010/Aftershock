"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, TrendingUp, TrendingDown, AlertCircle, Pause, Play, Volume2, VolumeX } from "lucide-react"

interface ReactionEvent {
    id: string
    title: string
    description: string
    type: "positive" | "negative" | "neutral" | "alert"
    timestamp: Date
    magnitude: number
    responses?: string[]
}

interface ChainReactionPanelProps {
    // Old interface (for custom policies)
    isActive?: boolean
    policyInput?: string
    selectedEventId?: string
    onEventsUpdate?: (events: ReactionEvent[]) => void
    
    // New interface (for case studies)
    events?: ReactionEvent[]
    eventTypes?: string[]
    eventResponses?: Record<string, string[]>
    chainReactionPatterns?: {
        primaryEffects: string[]
        secondaryEffects: string[]
        tertiaryEffects: string[]
    }
    
    // Common interface
    onEventSelect?: (event: ReactionEvent) => void
    selectedEvent?: ReactionEvent | null
}

const ChainReactionPanel = ({ 
    // Old interface
    isActive, 
    policyInput, 
    selectedEventId, 
    onEventsUpdate,
    // New interface
    events: predefinedEvents,
    eventTypes,
    eventResponses,
    chainReactionPatterns,
    // Common interface
    onEventSelect,
    selectedEvent
}: ChainReactionPanelProps) => {
    const [generatedEvents, setGeneratedEvents] = useState<ReactionEvent[]>([])
    const [isPaused, setIsPaused] = useState(false)
    const [eventIndex, setEventIndex] = useState(0)
    const [soundEnabled, setSoundEnabled] = useState(true)

    // Use predefined events if provided, otherwise use generated events
    const events = predefinedEvents || generatedEvents
    const effectiveSelectedEventId = selectedEvent?.id || selectedEventId

    // Audio references for different event types
    const positiveAudioRef = useRef<HTMLAudioElement | null>(null)
    const negativeAudioRef = useRef<HTMLAudioElement | null>(null)
    const neutralAudioRef = useRef<HTMLAudioElement | null>(null)
    const alertAudioRef = useRef<HTMLAudioElement | null>(null)

    // Initialize audio elements (client-side only)
    useEffect(() => {
        try {
            positiveAudioRef.current = new Audio('/sounds/positive.mp3')
            negativeAudioRef.current = new Audio('/sounds/negative.mp3')
            neutralAudioRef.current = new Audio('/sounds/neutral.mp3')
            alertAudioRef.current = new Audio('/sounds/alert.mp3')

            // Set volume for all sounds
            const audioRefs = [positiveAudioRef.current, negativeAudioRef.current, neutralAudioRef.current, alertAudioRef.current];
            audioRefs.forEach(audio => {
                if (audio) {
                    audio.volume = 0.5; // Set to 50% volume
                }
            });

            // Add error handlers for missing sound files
            audioRefs.forEach(audio => {
                if (audio) {
                    audio.addEventListener('error', (e) => {
                        console.warn('Sound file not found or cannot be played:', e);
                    });
                }
            });
        } catch (error) {
            console.error("Error initializing audio:", error);
            setSoundEnabled(false);
        }
    }, [])

    // Reset events when policy changes (only for generated events)
    useEffect(() => {
        if (!predefinedEvents && isActive && policyInput) {
            setGeneratedEvents([])
            setEventIndex(0)
        }
    }, [isActive, policyInput, predefinedEvents])

    // Generate events at regular intervals (only when no predefined events)
    useEffect(() => {
        if (predefinedEvents || !isActive || !policyInput || isPaused) return

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

            setGeneratedEvents(prev => {
                const updatedEvents = [newEvent, ...prev].slice(0, 20);

                // Auto-select the first event if onEventSelect is provided
                if (onEventSelect && eventIndex === 0) {
                    setTimeout(() => {
                        onEventSelect(newEvent);
                    }, 500);
                }

                // Play sound based on event type if sound is enabled
                if (soundEnabled) {
                    try {
                        switch (newEvent.type) {
                            case "positive":
                                positiveAudioRef.current?.play();
                                break;
                            case "negative":
                                negativeAudioRef.current?.play();
                                break;
                            case "alert":
                                alertAudioRef.current?.play();
                                break;
                            case "neutral":
                                neutralAudioRef.current?.play();
                                break;
                        }
                    } catch (error) {
                        console.error("Error playing sound:", error);
                    }
                }

                return updatedEvents;
            });

            setEventIndex(prev => prev + 1);
        }, 2000); // Add a new event every 2 seconds

        return () => {
            clearInterval(timer);
        };
    }, [isActive, policyInput, isPaused, eventIndex, onEventSelect]);

    // Update parent component with events when they change (separate from render)
    useEffect(() => {
        if (onEventsUpdate && events.length > 0) {
            onEventsUpdate(events);
        }
    }, [events, onEventsUpdate]);

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
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            variant="ghost"
                            size="sm"
                            className="px-2"
                            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
                        >
                            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </Button>
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
                </div>
                <p className="text-xs text-gray-500">Real-time system responses to policy changes</p>
            </div>

            {/* Events List */}
            <div className="flex-1 overflow-y-auto bg-white">
                <div className="p-4 space-y-3">
                    {events.length === 0 && !predefinedEvents && !isActive && (
                        <div className="text-center py-8 text-gray-400">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Submit a policy to see chain reactions</p>
                        </div>
                    )}

                    {events.length === 0 && !predefinedEvents && isActive && (
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
                            className={`p-3 bg-white rounded-lg border shadow-sm cursor-pointer transition-all hover:shadow-md ${effectiveSelectedEventId === event.id ? 'border-black ring-1 ring-black/20' : 'border-gray-200'
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