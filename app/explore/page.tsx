"use client"

import CustomPolicyAnalyst from "@/components/custom-policy-analyst"

export default function ExplorePage() {
  return (
    <div className="min-h-screen  ">
      {/* Hero Section */}
      <div className="pt-24 pb-12 ">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl  font-bold mb-6">Policy Explorer</h1>
            <p className="text-xl text-gray-600 mb-8">
              Analyze policy impacts using our advanced simulation tools. Explore causal relationships and chain reactions
              to better understand potential outcomes of policy decisions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center  px-4 py-2 rounded-lg border shadow-sm">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold mr-2">1</div>
                <span>Select Case Study or Define Policy</span>
              </div>
              <div className="flex items-center  px-4 py-2 rounded-lg border shadow-sm">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold mr-2">2</div>
                <span>Analyze Impacts</span>
              </div>
              <div className="flex items-center   px-4 py-2 rounded-lg border shadow-sm">
                <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white font-bold mr-2">3</div>
                <span>Explore Scenarios</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12 text-foreground">
        <div className="container mx-auto px-4">
          <div className="mb-12 max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold mr-4">
                <span className="text-2xl">E</span>
              </div>
              <h2 className="text-3xl font-bold">Exploratory Policy Analysis</h2>
            </div>
            <p className="text-lg   mb-6">
              Our integrated simulator combines causal modeling (Explore I) with temporal chain reaction analysis (Explore II)
              to provide a comprehensive view of how policies cascade through complex systems.
            </p>
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

          <CustomPolicyAnalyst />
        </div>
      </div>




    </div>
  )
}