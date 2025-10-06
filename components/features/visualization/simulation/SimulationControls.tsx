"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Play, Pause, RotateCcw, Eye, EyeOff } from "lucide-react"

interface SimulationControlsProps {
    isPlaying: boolean
    currentFrame: number
    totalFrames: number
    currentFrameData?: {
        t: string
        adoptionRate?: number
    }
    runningSimulation?: boolean
    onPlay: () => void
    onPause: () => void
    onReset: () => void
    onScrub: (frameIndex: number) => void
}

export default function SimulationControls({
    isPlaying,
    currentFrame,
    totalFrames,
    currentFrameData,
    runningSimulation = false,
    onPlay,
    onPause,
    onReset,
    onScrub
}: SimulationControlsProps) {
    const [isVisible, setIsVisible] = useState(true)

    const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
        const frameIndex = parseInt(e.target.value)
        onScrub(frameIndex)
    }

    return (
        <Card className="p-3 min-w-96">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {isVisible && (
                            <>
                                <Button
                                    onClick={isPlaying ? onPause : onPlay}
                                    variant="outline"
                                    size="sm"
                                    className="px-2 py-1"
                                    disabled={runningSimulation}
                                >
                                    {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                </Button>
                                <Button
                                    onClick={onReset}
                                    variant="outline"
                                    size="sm"
                                    className="px-2 py-1"
                                    disabled={runningSimulation}
                                >
                                    <RotateCcw className="w-3 h-3" />
                                </Button>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isVisible && (
                            <div className="text-xs text-muted-foreground">
                                <div>{currentFrameData?.t || `Frame ${currentFrame + 1}`}</div>
                                <div className="text-xs">
                                    Progress: {currentFrame + 1}/{totalFrames} {totalFrames > 100 ? 'months' : 'frames'}
                                </div>
                                {currentFrameData?.adoptionRate !== undefined && (
                                    <div className="text-xs">
                                        Clean Transport: {Math.round(currentFrameData.adoptionRate * 100)}%
                                    </div>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => setIsVisible(!isVisible)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label={isVisible ? "Hide controls" : "Show controls"}
                        >
                            {isVisible ? (
                                <Eye className="w-4 h-4 text-gray-600" />
                            ) : (
                                <EyeOff className="w-4 h-4 text-gray-600" />
                            )}
                        </button>
                    </div>
                </div>

                {isVisible && (
                    <div className="space-y-1">
                        {totalFrames > 100 && (
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                <span>Year 1</span>
                                <span>Year {Math.ceil(totalFrames / 12)}</span>
                            </div>
                        )}
                        <input
                            type="range"
                            min="0"
                            max={totalFrames - 1}
                            value={currentFrame}
                            onChange={handleScrub}
                            className="w-full h-1 bg-muted rounded-lg appearance-none cursor-pointer"
                            disabled={runningSimulation}
                        />
                    </div>
                )}
            </div>
        </Card>
    )
}