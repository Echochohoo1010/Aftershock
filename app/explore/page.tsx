"use client"

import { useState } from "react"
import CustomPolicyAnalyst from "@/components/custom-policy-analyst"

export default function ExplorePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section - Hide when analyzing */}
      {!isAnalyzing && (
        <div className="pt-8 pb-6">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-6">Policy Explorer</h1>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center px-4 py-2 rounded-lg border shadow-sm">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold mr-2">1</div>
                  <span>Select Case Study or Define Policy</span>
                </div>
                <div className="flex items-center px-4 py-2 rounded-lg border shadow-sm">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold mr-2">2</div>
                  <span>Analyze Impacts</span>
                </div>
                <div className="flex items-center px-4 py-2 rounded-lg border shadow-sm">
                  <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold mr-2">3</div>
                  <span>Explore Scenarios</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Start Card - Hide when analyzing */}
      {!isAnalyzing && (
        <div className="py-4 text-foreground">
          <div className="container mx-auto px-4">
            <div className="mb-6 max-w-4xl mx-auto">
              <div className="bg-gray-50 border p-4 rounded-lg">
                <h3 className="font-bold mb-2 flex items-center">
                  <span className="mr-2">💡</span> Quick Start with Case Studies
                </h3>
                <p className="text-gray-600">
                  Click the "Load Case Study" button to select from pre-filled policy scenarios including fiscal stimulus,
                  carbon tax implementation, education reform, and healthcare access initiatives.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${isAnalyzing ? 'pt-8 pb-8' : 'py-4'} text-foreground`}>
        <div className="container mx-auto px-4">
          <CustomPolicyAnalyst onSubmissionChange={setIsAnalyzing} />
        </div>
      </div>




    </div>
  )
}