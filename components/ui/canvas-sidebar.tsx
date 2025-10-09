"use client"

import * as React from "react"
import { Shapes, Users, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

interface CanvasSidebarProps {
  showAgentTypes: boolean
  showSimulation: boolean
  showAssistant: boolean
  onToggleAgentTypes: () => void
  onToggleSimulation: () => void
  onToggleAssistant: () => void
  className?: string
}

export default function CanvasSidebar({
  showAgentTypes,
  showSimulation,
  showAssistant,
  onToggleAgentTypes,
  onToggleSimulation,
  onToggleAssistant,
  className
}: CanvasSidebarProps) {
  return (
    <TooltipProvider>
      <div className={cn(
        "flex flex-col justify-center items-center relative transition-all duration-500 ease-in-out",
        className
      )} style={{ width: '51px', scale: '0.8' }}>
        <article className="border border-solid border-gray-700 w-full ease-in-out duration-500 left-0 rounded-2xl inline-block shadow-lg shadow-black/15 bg-white">

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

          {/* Policy Assistant Toggle */}
          <button
            onClick={onToggleAssistant}
            className="relative w-full p-4 ease-in-out duration-300 group flex flex-row gap-3 items-center justify-center text-black rounded-xl cursor-pointer hover:shadow-lg transition-all"
            style={{ height: '51px' }}
          >
            <Users className="ease-in-out duration-300 w-6 h-6 transition-all hover:scale-125 hover:text-blue-400 hover:fill-blue-400" />
          </button>

          {/* Placeholder for future */}
          <button
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

        </article>
      </div>
    </TooltipProvider>
  )
}
