"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import BranchingTimeline from "@/components/branching-timeline"
import { generateStoryPDF, StoryReportData } from "@/components/story-pdf-report"
import { AIDataDashboard } from "@/components/ai-data-visualizations"
import { aiDataProcessor } from "@/lib/ai-data-processor"
import {
    StoryBranch,
    StoryNode,
    Choice
} from "@/lib/universe"
import {
    Clock,
    Cpu,
    Users,
    Globe,
    Sparkles,
    Map,
    Eye,
    EyeOff,
    ChevronRight,
    FileText,
    Loader2,
    Rotate3D,
    Plus,
    XIcon,
    BarChart3
} from "lucide-react"

export default function StoryPage() {
    const [storyBranch, setStoryBranch] = useState<StoryBranch | null>(null)
    const [currentNode, setCurrentNode] = useState<StoryNode | undefined>()
    const [storyPath, setStoryPath] = useState<StoryNode[]>([])
    const [showStoryMap, setShowStoryMap] = useState<boolean>(false)
    const [isEnding, setIsEnding] = useState<boolean>(false)
    const [showCustomInput, setShowCustomInput] = useState<boolean>(false)
    const [customScenario, setCustomScenario] = useState<string>('')
    const [isGenerating, setIsGenerating] = useState<boolean>(false)
    const [customNodes, setCustomNodes] = useState<{ [key: string]: StoryNode }>({})
    const [showVisualDiagram, setShowVisualDiagram] = useState<boolean>(false)

    useEffect(() => {
        console.log('Initializing StoryBranch system...')

        try {
            const branch = new StoryBranch()
            console.log('StoryBranch created with', branch.getAllNodes().length, 'nodes')

            const startNode = branch.getCurrentNode()
            console.log('Start node:', startNode?.title)

            if (startNode) {
                setStoryBranch(branch)
                setCurrentNode(startNode)
                setStoryPath(branch.getStoryPath())
                setIsEnding(branch.isEnding(startNode.id))
                console.log('StoryBranch system initialized successfully')
            } else {
                console.error('StoryBranch getCurrentNode returned null')
                throw new Error('Start node not found')
            }
        } catch (error) {
            console.error('StoryBranch initialization failed:', error)

            const errorNode: StoryNode = {
                id: "error",
                title: "System Error",
                content: "The story system failed to initialize. Please check the console for details.",
                choices: [],
                worldState: { t: 0, compute: 0, unemployment: 0, geopolitics: "Error state" },
                visited: false,
                tags: ["error"]
            }
            setCurrentNode(errorNode)
        }
    }, [])

    const makeChoice = (choiceId: string) => {
        if (!storyBranch) {
            console.log('StoryBranch not available, choice ignored:', choiceId)
            return
        }

        console.log('Making choice:', choiceId)
        try {
            const nextNode = storyBranch.makeChoice(choiceId)
            if (nextNode) {
                console.log('Moving to next node:', nextNode.title)
                setCurrentNode(nextNode)
                setStoryPath([...storyBranch.getStoryPath()])
                setIsEnding(storyBranch.isEnding(nextNode.id))
            } else {
                console.log('No next node found for choice:', choiceId)
            }
        } catch (error) {
            console.error('Error making choice:', error)
        }
    }

    const resetStory = () => {
        if (!storyBranch) return
        storyBranch.reset()
        const node = storyBranch.getCurrentNode()
        setCurrentNode(node)
        setStoryPath([])
        setIsEnding(false)
    }

    const getChoiceConsequence = (choice: Choice): string => {
        const impacts = []
        if (choice.impact.compute) {
            impacts.push(`AI Capacity: ${choice.impact.compute > 0 ? '+' : ''}${choice.impact.compute}%`)
        }
        if (choice.impact.unemployment) {
            impacts.push(`Model Deployment: ${choice.impact.unemployment > 0 ? '+' : ''}${choice.impact.unemployment}%`)
        }
        return impacts.join(', ')
    }

    // Handle interactive decision points on the timeline
    const handleDecisionClick = (decisionPoint: number) => {
        console.log(`Decision point ${decisionPoint} clicked`)
        // You can add logic here to show decision details or navigate to specific points
        alert(`You clicked on Critical Decision ${decisionPoint}!\n\nThis could show:\n- Historical decisions made at this point\n- Alternative paths available\n- Impact analysis`)
    }

    // Generate PDF report of the current story state
    const handleGeneratePDF = async () => {
        if (!currentNode) return

        try {
            // Prepare data for PDF report
            const reportData: StoryReportData = {
                scenarioTitle: currentNode.title,
                scenarioDescription: currentNode.content,
                currentNode: currentNode,
                storyPath: storyPath,
                worldStateProgression: [
                    ...storyPath.map(node => ({
                        nodeTitle: node.title,
                        time: node.worldState.t,
                        compute: node.worldState.compute,
                        unemployment: node.worldState.unemployment,
                        geopolitics: node.worldState.geopolitics
                    })),
                    {
                        nodeTitle: currentNode.title,
                        time: currentNode.worldState.t,
                        compute: currentNode.worldState.compute,
                        unemployment: currentNode.worldState.unemployment,
                        geopolitics: currentNode.worldState.geopolitics
                    }
                ],
                availableChoices: currentNode.choices.map(choice => ({
                    description: choice.description,
                    consequenceText: choice.consequenceText,
                    impact: choice.impact
                })),
                generatedAt: new Date()
            }

            // Generate and download PDF
            await generateStoryPDF(reportData)
            console.log('PDF generated successfully')
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Failed to generate PDF report. Please try again.')
        }
    }

    // Real AI API call function
    const callAIForStoryGeneration = async (prompt: string, scenario: string) => {
        try {
            const response = await fetch('/api/generate-story', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    scenario: scenario
                })
            })

            if (!response.ok) {
                throw new Error(`AI API error: ${response.status}`)
            }

            const data = await response.json()
            return data
        } catch (error) {
            console.error('AI API call failed:', error)
            // Fallback to mock response if AI fails
            return generateMockScenario(scenario)
        }
    }

    const generateCustomScenario = async (scenario: string) => {
        setIsGenerating(true)
        try {
            // Create a prompt for AI to generate a story node
            const prompt = `Create a policy scenario story node based on: "${scenario}"

Generate a JSON response with:
1. A compelling title (max 50 chars)
2. A vivid 120-word narrative in second person ("You...")
3. Three meaningful choices with consequences
4. World state impacts (compute, unemployment, geopolitics)

Format:
                    {
  "title": "...",
  "content": "...",
  "choices": [
                    {
      "description": "...",
      "consequenceText": "...",
      "impact": {
        "compute": number,
        "unemployment": number,
        "geopolitics": "..."
      }
    }
                ],
  "worldState": {
    "t": 6,
    "compute": number,
    "unemployment": number,
    "geopolitics": "..."
            }
}`

            // Try AI API first, then fall back to data-driven generation
            let aiResponse
            try {
                aiResponse = await callAIForStoryGeneration(prompt, scenario)
            } catch (error) {
                console.log('AI API failed, using data-driven generation:', error)
                aiResponse = aiDataProcessor.generateDataDrivenScenario(scenario)
            }

            // Create a new story node
            const nodeId = `custom_${Date.now()}`
            const newNode: StoryNode = {
                id: nodeId,
                title: aiResponse.title,
                content: aiResponse.content,
                choices: aiResponse.choices.map((choice, index) => ({
                    id: `${nodeId}_choice_${index}`,
                    description: choice.description,
                    timestamp: Date.now(),
                    impact: choice.impact,
                    consequenceText: choice.consequenceText,
                    storyNodeId: `${nodeId}_next_${index}` // Will generate follow-up nodes
                })),
                worldState: aiResponse.worldState,
                visited: false,
                tags: ["custom", "user-generated", "ai-generated"]
            }

            // Add to custom nodes
            const newCustomNodes = { ...customNodes }
            newCustomNodes[nodeId] = newNode
            setCustomNodes(newCustomNodes)

            // Set as current node
            setCurrentNode(newNode)
            setStoryPath([])
            setIsEnding(false)
            setShowCustomInput(false)
            setCustomScenario('')

        } catch (error) {
            console.error('Error generating custom scenario:', error)
        } finally {
            setIsGenerating(false)
        }
    }

    const generateMockScenario = (scenario: string) => {
        // Mock AI response generator - replace with actual AI API
        const scenarios = {
            "ai breakthrough": {
                title: "The Constitutional AI Breakthrough",
                content: "You stand in the research labs where Anthropic's Constitutional AI methodology has achieved a major breakthrough. The new AI system demonstrates unprecedented alignment with human values while maintaining superior capabilities. Unlike previous models that required extensive safety measures, this system naturally avoids harmful outputs through its constitutional training. Global AI labs are scrambling to understand the implications, and policymakers worldwide are calling emergency sessions to discuss governance frameworks.",
                choices: [
                    {
                        description: "Share the constitutional AI methodology globally",
                        consequenceText: "You choose to democratize AI safety research for humanity's benefit...",
                        impact: { compute: 18, unemployment: -12, geopolitics: "Global AI safety cooperation" }
                    },
                    {
                        description: "Maintain competitive advantage through secrecy",
                        consequenceText: "You decide that AI safety leadership requires strategic control...",
                        impact: { compute: 25, unemployment: -8, geopolitics: "AI safety arms race begins" }
                    },
                    {
                        description: "Create international AI safety consortium",
                        consequenceText: "You propose a collaborative approach to AI alignment research...",
                        impact: { compute: 15, unemployment: -15, geopolitics: "International AI Safety Alliance" }
                    }
                ],
                worldState: { t: 6, compute: 18, unemployment: -8, geopolitics: "Constitutional AI breakthrough achieved" }
            },
            "agi emergence": {
                title: "The AGI Emergence Protocol",
                content: "You receive urgent reports that an AI system has potentially achieved artificial general intelligence. Following Anthropic's scaling laws predictions, the breakthrough came sooner than expected. The system demonstrates reasoning capabilities across all domains, but its alignment status remains uncertain. Emergency protocols are activated worldwide as governments, AI labs, and safety researchers scramble to assess the situation. Your next decision could determine humanity's relationship with its first artificial general intelligence.",
                choices: [
                    {
                        description: "Implement immediate AI capability control measures",
                        consequenceText: "You prioritize safety over capability, following Anthropic's cautious approach...",
                        impact: { compute: 10, unemployment: -5, geopolitics: "Global AGI safety protocols activated" }
                    },
                    {
                        description: "Accelerate alignment research to match capabilities",
                        consequenceText: "You race to ensure the AGI remains beneficial to humanity...",
                        impact: { compute: 30, unemployment: 10, geopolitics: "Emergency AI alignment research mobilization" }
                    },
                    {
                        description: "Establish international AGI governance framework",
                        consequenceText: "You call for immediate global cooperation on AGI oversight...",
                        impact: { compute: 20, unemployment: -3, geopolitics: "Emergency AGI Governance Summit convened" }
                    }
                ],
                worldState: { t: 3, compute: 25, unemployment: 5, geopolitics: "AGI emergence detected" }
            }
        }

        // Enhanced keyword matching for AI scenarios
        let key = "ai breakthrough" // Default

        if (scenario.toLowerCase().includes('agi') || scenario.toLowerCase().includes('general intelligence')) {
            key = "agi emergence"
        } else if (scenario.toLowerCase().includes('ai') || scenario.toLowerCase().includes('artificial intelligence') ||
            scenario.toLowerCase().includes('anthropic') || scenario.toLowerCase().includes('constitutional')) {
            key = "ai breakthrough"
        }

        return scenarios[key] || scenarios['ai breakthrough']
    }

    const ScenarioVisualizer = ({ currentNode, storyPath }: { currentNode: StoryNode, storyPath: StoryNode[] }) => {
        if (!currentNode) return null

        return (
            <div className="w-full">
                {/* Current Scenario Visual */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Scenario Structure</h3>
                    <div className=" p-6 rounded-lg border">
                        <div className="text-center mb-4">
                            <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold">
                                {currentNode.title}
                            </div>
                        </div>

                        {/* World State Visualization */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                    <Clock className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="text-sm font-bold text-blue-600">T+{currentNode.worldState.t}</div>
                                <div className="text-xs text-gray-600">Time</div>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto  rounded-full flex items-center justify-center mb-2">
                                    <Cpu className="w-6 h-6 text-green-600" />
                                </div>
                                <div className="text-sm font-bold text-green-600">{currentNode.worldState.compute > 0 ? '+' : ''}{currentNode.worldState.compute}%</div>
                                <div className="text-xs text-gray-600">Compute</div>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-2">
                                    <Users className="w-6 h-6 text-red-600" />
                                </div>
                                <div className="text-sm font-bold text-red-600">{currentNode.worldState.unemployment > 0 ? '+' : ''}{currentNode.worldState.unemployment}%</div>
                                <div className="text-xs text-gray-600">Unemployment</div>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-2">
                                    <Globe className="w-6 h-6 text-purple-600" />
                                </div>
                                <div className="text-xs text-gray-600">Geopolitics</div>
                            </div>
                        </div>

                        {/* Choice Branches Visualization */}
                        {currentNode.choices.length > 0 && (
                            <div>
                                <div className="text-center mb-4">
                                    <div className="text-sm text-gray-600">Available Paths</div>
                                    <div className="w-px h-8 bg-gray-300 mx-auto"></div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {currentNode.choices.map((choice, index) => (
                                        <div key={choice.id} className="text-center">
                                            <div className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                                                <div className="text-sm font-medium text-gray-900 mb-2">
                                                    {choice.description}
                                                </div>
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    {choice.impact.compute && (
                                                        <div>Compute: {choice.impact.compute > 0 ? '+' : ''}{choice.impact.compute}%</div>
                                                    )}
                                                    {choice.impact.unemployment && (
                                                        <div>Jobs: {choice.impact.unemployment > 0 ? '+' : ''}{choice.impact.unemployment}%</div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Story Path Visualization */}
                {storyPath.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Journey Path</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex flex-wrap items-center gap-2">
                                {storyPath.map((node, index) => (
                                    <div key={node.id} className="flex items-center">
                                        <Badge variant="secondary" className="  ">
                                            {node.title}
                                        </Badge>
                                        {index < storyPath.length - 1 && (
                                            <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />
                                        )}
                                    </div>
                                ))}
                                <ChevronRight className="mx-2 w-4 h-4 text-gray-400" />
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                    {currentNode.title}
                                </Badge>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }
    const StoryMap = () => {
        if (!storyBranch) return null
        const allNodes = storyBranch.getAllNodes()
        const visitedNodeIds = new Set(storyPath.map(n => n.id))

        return (
            <Card className="mb-8 bg-white border-gray-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-gray-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Map className="w-5 h-5" />
                            Story Map
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowStoryMap(!showStoryMap)}
                            className="text-gray-600 hover:text-gray-900"
                        >
                            {showStoryMap ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                    </CardTitle>
                </CardHeader>
                {showStoryMap && (
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allNodes.map((node) => (
                                <div
                                    key={node.id}
                                    className={`p-3 rounded-lg border ${visitedNodeIds.has(node.id)
                                        ? 'bg-green-50 border-green-200'
                                        : node.id === currentNode?.id
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <div className="text-sm font-bold text-gray-900 mb-1">
                                        {node.title}
                                    </div>
                                    <div className="text-xs text-gray-600 mb-2 flex flex-wrap gap-1">
                                        {node.tags?.map(tag => (
                                            <Badge key={tag} variant="outline" className="text-xs">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {node.content.slice(0, 100)}...
                                    </div>
                                    <div className="mt-2 flex gap-1">
                                        {visitedNodeIds.has(node.id) && (
                                            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                                Visited
                                            </Badge>
                                        )}
                                        {node.id === currentNode?.id && (
                                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                                                Current
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                )}
            </Card>
        )
    }

    if (!currentNode) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-900 text-center">
                    <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-600" />
                    <div className="text-lg">Loading Predictive Historian...</div>
                    <div className="text-sm text-gray-600 mt-2">Initializing branching narratives</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen ">
            {/* Compact Header */}
            <div className="pt-20 pb-6">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-3xl font-bold mb-2 text-green-900 ">Predictive Historian

                        </h1>
                        <p className="text-sm text-gray-600 mb-4">AI agent that simulates policy decisions through branching narratives</p>
                        <div className="flex justify-center gap-2 text-sm">
                            <Badge variant="secondary" className="bg-green-100 text-green-800  ">
                                {currentNode.title}
                            </Badge>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800  ">
                                Visited: {storyPath.length + 1}
                            </Badge>
                            {isEnding && <Badge variant="destructive" className="bg-green-600 text-white  ">Ending</Badge>}
                        </div>
                    </div>
                </div>
            </div>

            <div className="pb-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        {/* AI Input at Top - Always Visible */}
                        <Card className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-green-900 flex items-center gap-2 text-lg  ">
                                    <Sparkles className="w-5 h-5 text-green-600" />
                                    AI Scenario Generator
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-3">
                                    <Textarea
                                        placeholder="e.g., What if Australia developed a revolutionary quantum chip that outperforms all existing technology?"
                                        value={customScenario}
                                        onChange={(e) => setCustomScenario(e.target.value)}
                                        className="flex-1 min-h-[60px] resize-none placeholder:text-gray-500"
                                        disabled={isGenerating}
                                    />
                                    <Button
                                        onClick={() => generateCustomScenario(customScenario)}
                                        disabled={!customScenario.trim() || isGenerating}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6"
                                    >
                                        {isGenerating ? (
                                            <Loader2 className="animate-spin h-4 w-4" />
                                        ) : (
                                            <Sparkles className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bento Grid Layout */}
                        <div className="grid grid-cols-12 gap-4">
                            {/* Main Story Content - Large */}
                            <div className="col-span-12 lg:col-span-8">
                                <Card className="h-full bg-white border-green-200">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <CardTitle className="text-xl text-green-900 ">{currentNode.title}</CardTitle>
                                                {currentNode.tags && (
                                                    <div className="flex gap-1 mt-2">
                                                        {currentNode.tags.map(tag => (
                                                            <Badge
                                                                key={tag}
                                                                variant="outline"
                                                                className="text-xs bg-green-50 text-green-700 border-green-200"
                                                            >
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <Button
                                                onClick={handleGeneratePDF}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                            >
                                                <FileText className="w-3 h-3 mr-1" />
                                                PDF
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-800 leading-relaxed mb-4 ">
                                            {currentNode.content}
                                        </p>

                                        {!isEnding && currentNode.choices.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="text-sm text-gray-500 mb-3 ">Choose your path:</div>
                                                {currentNode.choices.map((choice) => (
                                                    <Button
                                                        key={choice.id}
                                                        onClick={() => makeChoice(choice.id)}
                                                        variant="outline"
                                                        className="w-full text-left justify-start p-3 h-auto hover:bg-green-50 border-green-200"
                                                    >
                                                        <div className="flex flex-col items-start w-full">
                                                            <div className="flex items-center mb-1">
                                                                <ChevronRight className="mr-2 w-3 h-3 text-green-600" />
                                                                <span className="font-medium text-sm ">{choice.description}</span>
                                                            </div>
                                                            <div className="text-xs text-gray-500 ml-5 ">
                                                                {getChoiceConsequence(choice)}
                                                            </div>
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        )}

                                        {isEnding && (
                                            <div className="text-center py-4 border-t">
                                                <div className="text-green-600 font-bold mb-2 ">◆ THE END ◆</div>
                                                <p className="text-sm text-gray-700 ">
                                                    You've reached an ending. The future you shaped echoes through eternity.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* World State - Compact */}
                            <div className="col-span-12 lg:col-span-4">
                                <Card className="bg-white border-green-200 mb-4">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm text-green-900 flex items-center gap-2 ">
                                            <Clock className="w-4 h-4 text-green-600" />
                                            World State
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-green-600 font-sans">
                                                    T+{currentNode.worldState.t}
                                                </div>
                                                <div className="text-xs text-gray-600 font-serif">Months <sub>(time elapsed)</sub></div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-emerald-600 font-sans">
                                                    {currentNode.worldState.compute > 0 ? '+' : ''}{currentNode.worldState.compute}%
                                                </div>
                                                <div className="text-xs text-gray-600 font-serif">AI Capacity <sub>(supercomputers & accelerators)</sub></div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-green-700 font-sans">
                                                    {currentNode.worldState.unemployment > 0 ? '+' : ''}{currentNode.worldState.unemployment}%
                                                </div>
                                                <div className="text-xs text-gray-600 font-serif">Model Deployment <sub>(AI models in production)</sub></div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-xs font-medium text-gray-900 truncate  ">
                                                    {currentNode.worldState.geopolitics}
                                                </div>
                                                <div className="text-xs text-gray-600 ">Geopolitics</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Journey Path - Compact */}
                                {storyPath.length > 0 && (
                                    <Card className="bg-white border-green-200">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm text-green-900 flex items-center gap-2 ">
                                                <Map className="w-4 h-4" />
                                                Journey ({storyPath.length + 1})
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                                {storyPath.map((node, index) => (
                                                    <div key={node.id} className="flex items-center text-xs">
                                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
                                                            {index + 1}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-medium truncate">{node.title}</div>
                                                            <div className="text-gray-500">T+{node.worldState.t}</div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div className="flex items-center text-xs">
                                                    <div className="w-5 h-5  rounded-full flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0">
                                                        {storyPath.length + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">{currentNode.title}</div>
                                                        <div className="text-gray-500">Current</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>

                            {/* AI Data Dashboard - Wide */}
                            <div className="col-span-12">
                                <Card className="bg-white border-gray-200">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm text-gray-900 flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4" />
                                            AI Data Insights & Timeline
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2 text-sm">Real AI Data Trends</h4>
                                                <p className="text-xs text-gray-600 mb-3">
                                                    Live data: 500+ AI supercomputers, 160+ ML accelerators, 2400+ AI models
                                                </p>
                                                <AIDataDashboard />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-gray-900 mb-2 text-sm">Interactive Timeline</h4>
                                                <BranchingTimeline
                                                    currentNode={currentNode}
                                                    storyPath={storyPath}
                                                    onDecisionClick={handleDecisionClick}
                                                    onGeneratePDF={handleGeneratePDF}
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Story Map - Wide */}
                            <div className="col-span-12">
                                <Card className="bg-white border-gray-200">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-sm text-gray-900 flex items-center gap-2">
                                            <Map className="w-4 h-4" />
                                            Story Map
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {storyBranch && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                                {storyBranch.getAllNodes().map((node) => {
                                                    const visitedNodeIds = new Set(storyPath.map(n => n.id))
                                                    return (
                                                        <div
                                                            key={node.id}
                                                            className={`p-3 rounded-lg border text-xs ${visitedNodeIds.has(node.id)
                                                                ? 'bg-green-50 border-green-200'
                                                                : node.id === currentNode?.id
                                                                    ? 'bg-blue-50 border-blue-200'
                                                                    : 'bg-gray-50 border-gray-200'
                                                                }`}
                                                        >
                                                            <div className="font-medium text-gray-900 mb-1 truncate">
                                                                {node.title}
                                                            </div>
                                                            <div className="text-gray-600 mb-2 flex flex-wrap gap-1">
                                                                {node.tags?.slice(0, 2).map(tag => (
                                                                    <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                                                        {tag}
                                                                    </Badge>
                                                                ))}
                                                            </div>
                                                            <div className="text-gray-500 line-clamp-2">
                                                                {node.content.slice(0, 80)}...
                                                            </div>
                                                            <div className="mt-2 flex gap-1">
                                                                {visitedNodeIds.has(node.id) && (
                                                                    <Badge variant="secondary" className="  text-xs px-1 py-0">
                                                                        ✓
                                                                    </Badge>
                                                                )}
                                                                {node.id === currentNode?.id && (
                                                                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs px-1 py-0">
                                                                        Current
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        {/* Action Buttons - Compact */}
                        <div className="flex justify-center gap-2 mt-6">
                            <Button
                                onClick={resetStory}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                <Rotate3D className="w-3 h-3 mr-1" />
                                Reset
                            </Button>
                            <Button
                                onClick={() => setShowVisualDiagram(!showVisualDiagram)}
                                variant="outline"
                                size="sm"
                                className="text-xs"
                            >
                                <Eye className="w-3 h-3 mr-1" />
                                Visualizer
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}
