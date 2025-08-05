"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ServerDensityChart() {
    // Generate mock data for a single server visualization
    const generateMockData = () => {
        const data = []
        const timePoints = 50
        const ipsPoints = 50

        for (let t = 0; t < timePoints; t++) {
            for (let ips = 0; ips < ipsPoints; ips++) {
                // Create some peaks and valleys to simulate server load patterns
                const timeFactor = Math.sin(t * 0.3) * 0.5 + 0.5
                const ipsFactor = Math.exp(-Math.pow((ips - 25) / 10, 2)) // Gaussian peak
                const noise = Math.random() * 0.3
                const density = (timeFactor * ipsFactor + noise) * 100

                data.push({
                    time: t,
                    ips: ips,
                    density: Math.max(0, density)
                })
            }
        }
        return data
    }

    const data = generateMockData()

    // Create a 2D heatmap representation (simplified version of 3D)
    const renderHeatmap = () => {
        const cellSize = 4
        const maxDensity = Math.max(...data.map(d => d.density))

        return (
            <div className="relative">
                <svg width="400" height="300" className="border border-green-200 rounded-lg bg-gradient-to-br from-blue-50 to-green-50">
                    {/* Grid lines */}
                    {[...Array(10)].map((_, i) => (
                        <g key={i}>
                            <line
                                x1={i * 40} y1={0} x2={i * 40} y2={300}
                                stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"
                            />
                            <line
                                x1={0} y1={i * 30} x2={400} y2={i * 30}
                                stroke="#e5e7eb" strokeWidth="0.5" opacity="0.3"
                            />
                        </g>
                    ))}

                    {/* Data points as colored rectangles */}
                    {data.filter((_, i) => i % 4 === 0).map((point, i) => {
                        const x = (point.time / 50) * 400
                        const y = 300 - (point.ips / 50) * 300
                        const intensity = point.density / maxDensity
                        const color = intensity > 0.7 ? '#10b981' :
                            intensity > 0.4 ? '#3b82f6' :
                                intensity > 0.2 ? '#06b6d4' : '#e5e7eb'
                        const opacity = Math.max(0.1, intensity)

                        return (
                            <rect
                                key={i}
                                x={x - 2}
                                y={y - 2}
                                width="4"
                                height="4"
                                fill={color}
                                opacity={opacity}
                                rx="1"
                            />
                        )
                    })}

                    {/* Target line (orange) */}
                    <path
                        d="M 50 250 Q 150 200 250 180 T 350 160"
                        stroke="#f59e0b"
                        strokeWidth="3"
                        fill="none"
                        opacity="0.8"
                    />

                    {/* Regressor prediction line (black) */}
                    <path
                        d="M 50 240 Q 150 190 250 170 T 350 150"
                        stroke="#1f2937"
                        strokeWidth="2"
                        fill="none"
                        opacity="0.9"
                    />
                </svg>

                {/* Axis labels */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-serif text-gray-600">
                    Instructions Per Second
                </div>
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs font-serif text-gray-600">
                    Time
                </div>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 rotate-90 text-xs font-serif text-gray-600">
                    Density
                </div>
            </div>
        )
    }

    return (
        <Card className="bg-white border-green-200">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg text-green-900 font-sans flex items-center justify-between">
                    Server A Performance
                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-3 bg-blue-400 rounded"></div>
                            <span className="font-serif">Target</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-2 bg-orange-400 rounded"></div>
                            <span className="font-serif">Regressor Prediction</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-3 h-1 bg-gray-800 rounded"></div>
                            <span className="font-serif">Regressor Density</span>
                        </div>
                    </div>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-center">
                    {renderHeatmap()}
                    <div className="mt-4 text-center">
                        <div className="text-sm font-serif text-green-700 font-medium">
                            Strong Point-wise Estimates
                        </div>
                        <div className="text-xs font-serif text-gray-600 mt-1">
                            Real-time server performance density visualization
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}