import { Clock, Cpu, Globe, Users } from "lucide-react"
import { StoryNode } from "@/lib/universe"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"

interface ScenarioVisualizerProps {
    currentNode: StoryNode | null
    storyPath: StoryNode[]
}

const ScenarioVisualizer: React.FC<ScenarioVisualizerProps> = ({ currentNode, storyPath }) => {
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
                                <Cpu className="w-6 h-6 " />
                            </div>
                            <div className="text-sm font-bold ">{currentNode.worldState.compute > 0 ? '+' : ''}{currentNode.worldState.compute}%</div>
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
                                    <div key={index} className="text-center">
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

export default ScenarioVisualizer