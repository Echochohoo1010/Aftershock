"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CaseContext } from "../content/types"

interface ContextCardProps {
  context: CaseContext
  className?: string
}

export default function ContextCard({ context, className = "" }: ContextCardProps) {
  return (
    <Card className={`p-3 border bg-gray-50 ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          {context.icon && <span>{context.icon}</span>}
          Context
        </h3>
        <Badge variant="outline" className="text-xs">
          {context.scope}
        </Badge>
      </div>
      
      <p className="text-gray-700 text-xs mb-3 leading-relaxed">
        {context.description}
      </p>
      
      <div className="grid grid-cols-2 gap-3 text-xs text-gray-600 mb-3">
        <div>
          <span className="font-medium">Timeline:</span> {context.timeline}
        </div>
        <div>
          <span className="font-medium">Agents:</span> {context.agents}
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="text-xs">
          <span className="font-medium text-gray-700">Policy:</span>
          <div className="ml-2 text-gray-600">
            <div><strong>Instrument:</strong> {context.policyDetails.instrument}</div>
            <div><strong>Target:</strong> {context.policyDetails.target}</div>
            <div><strong>Mechanism:</strong> {context.policyDetails.mechanism}</div>
          </div>
        </div>
        
        {context.keyMetrics && context.keyMetrics.length > 0 && (
          <div className="text-xs">
            <span className="font-medium text-gray-700">Key Metrics:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {context.keyMetrics.map((metric, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0">
                  {metric}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}