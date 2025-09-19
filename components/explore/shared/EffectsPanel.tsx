"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Lightbulb, Users, Leaf, AlertTriangle } from "lucide-react"

interface EffectCategory {
  innovation?: string[]
  economicGrowth?: string[]
  positiveEffects?: string[]
  negativeEffects?: string[]
  socialImpact?: string[]
  environmentalImpact?: string[]
}

interface EffectsPanelProps {
  effects: EffectCategory
  recommendations?: string[]
  title?: string
  className?: string
}

const effectIcons = {
  innovation: Lightbulb,
  economicGrowth: TrendingUp,
  positiveEffects: TrendingUp,
  negativeEffects: TrendingDown,
  socialImpact: Users,
  environmentalImpact: Leaf
}

const effectColors = {
  innovation: "bg-purple-50 border-purple-200 text-purple-800",
  economicGrowth: "bg-blue-50 border-blue-200 text-blue-800", 
  positiveEffects: "bg-green-50 border-green-200 text-green-800",
  negativeEffects: "bg-red-50 border-red-200 text-red-800",
  socialImpact: "bg-yellow-50 border-yellow-200 text-yellow-800",
  environmentalImpact: "bg-emerald-50 border-emerald-200 text-emerald-800"
}

const effectLabels = {
  innovation: "Innovation Effects",
  economicGrowth: "Economic Growth",
  positiveEffects: "Positive Effects", 
  negativeEffects: "Negative Effects",
  socialImpact: "Social Impact",
  environmentalImpact: "Environmental Impact"
}

export default function EffectsPanel({ effects, recommendations, title = "Policy Effects Analysis", className = "" }: EffectsPanelProps) {
  const hasEffects = Object.values(effects).some(effectList => effectList && effectList.length > 0)
  
  if (!hasEffects) {
    return (
      <Card className={`p-4 ${className}`}>
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">No effects data available for this policy case.</p>
      </Card>
    )
  }

  return (
    <Card className={`p-4 ${className}`}>
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4" />
        {title}
      </h3>
      
      <div className="space-y-4">
        {Object.entries(effects).map(([category, effectList]) => {
          if (!effectList || effectList.length === 0) return null
          
          const Icon = effectIcons[category as keyof typeof effectIcons]
          const colorClass = effectColors[category as keyof typeof effectColors]
          const label = effectLabels[category as keyof typeof effectLabels]
          
          return (
            <div key={category} className="space-y-2">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4" />}
                <Badge variant="outline" className={colorClass}>
                  {label}
                </Badge>
              </div>
              
              <div className="space-y-2 ml-6">
                {effectList.map((effect, index) => (
                  <div key={index} className="text-sm text-gray-700 leading-relaxed p-2 bg-gray-50 rounded border-l-2 border-gray-200">
                    {effect}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        
        {recommendations && recommendations.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4" />
              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-800">
                Policy Recommendations
              </Badge>
            </div>
            
            <div className="space-y-2 ml-6">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="text-sm text-gray-700 leading-relaxed p-2 bg-blue-50 rounded border-l-2 border-blue-300">
                  {recommendation}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}