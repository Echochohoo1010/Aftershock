"use client"

import * as React from "react"
import { Shapes, Users, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface CanvasSidebarProps {
  showAgentTypes: boolean
  showSimulation: boolean
  showAssistant: boolean
  showCausalGraph: boolean
  onToggleAgentTypes: () => void
  onToggleSimulation: () => void
  onToggleAssistant: () => void
  onToggleCausalGraph: () => void
  className?: string
}

export default function CanvasSidebar({
  showAgentTypes,
  showSimulation,
  showAssistant,
  showCausalGraph,
  onToggleAgentTypes,
  onToggleSimulation,
  onToggleAssistant,
  onToggleCausalGraph,
  className
}: CanvasSidebarProps) {
  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col justify-center items-center relative transition-all duration-500 ease-in-out",
        className
      )} style={{ width: '51px', scale: '1.0' }}>
        <article className="border w-full ease-in-out duration-500 left-0 rounded-2xl inline-block shadow-lg shadow-black/15 bg-white">

          {/* Agent Types Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleAgentTypes}
                className="relative w-full p-4 ease-in-out duration-300 group flex flex-row gap-3 items-center justify-center text-black rounded-xl cursor-pointer hover:shadow-lg transition-all"
                style={{ height: '51px' }}
              >
                <Users className="ease-in-out duration-300 w-6 h-6 transition-all hover:scale-125 hover:text-blue-400 hover:fill-blue-400" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="flex items-center gap-2">
                Agent Types
                {!showAgentTypes && <EyeOff className="w-4 h-4" />}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Simulation Controls Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleSimulation}
                className="relative w-full p-4 ease-in-out duration-300 group flex flex-row gap-3 items-center justify-center text-black rounded-xl cursor-pointer hover:shadow-lg transition-all"
                style={{ height: '51px' }}
              >
                <svg
                  className="ease-in-out duration-300 transition-all hover:scale-125 hover:text-blue-400 hover:fill-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="flex items-center gap-2">
                Simulation Control
                {!showSimulation && <EyeOff className="w-4 h-4" />}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Causal Graph Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleCausalGraph}
                className="relative w-full p-4 ease-in-out duration-300 group flex flex-row gap-3 items-center justify-center text-black rounded-xl cursor-pointer hover:shadow-lg transition-all"
                style={{ height: '51px' }}
              >
                <img
                  src="/causal-graph-logo.png"
                  alt="Causal Graph"
                  className="ease-in-out duration-300 w-6 h-6 hover:scale-125"
                  style={{
                    filter: 'none',
                    transition: 'transform 0.3s ease-in-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(0) saturate(100%) invert(47%) sepia(96%) saturate(2063%) hue-rotate(191deg) brightness(103%) contrast(101%)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'none'
                  }}
                />
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="flex items-center gap-2">
                Causal Graph
                {!showCausalGraph && <EyeOff className="w-4 h-4" />}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Policy Assistant Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onToggleAssistant}
                className="relative w-full p-4 ease-in-out duration-300 group flex flex-row gap-3 items-center justify-center text-black rounded-xl cursor-pointer hover:shadow-lg transition-all"
                style={{ height: '51px' }}
              >
                <svg
                  className="ease-in-out duration-300 w-6 h-6 transition-all hover:scale-125 hover:text-blue-400 hover:fill-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3zm9 11v-1a7 7 0 0 0-7-7h-4a7 7 0 0 0-7 7v1h2v-1a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v1z" />
                </svg>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p className="flex items-center gap-2">
                Policy Assistant
                {!showAssistant && <EyeOff className="w-4 h-4" />}
              </p>
            </TooltipContent>
          </Tooltip>

        </article>
      </div>
    </TooltipProvider>
  )
}
