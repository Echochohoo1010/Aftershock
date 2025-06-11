import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Research() {
  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-12">Research</h1>

        <div className="grid md:grid-cols-2 gap-16 mb-16">
          <div>
            <h2 className="text-3xl font-bold mb-6">Policy Synthesis</h2>
            <p className="text-lg text-gray-700 mb-6">
              Our policy synthesis work focuses on using AI to generate policy ideas based on specific goals,
              constraints, and contexts. This approach allows for the exploration of a wider solution space than
              traditional policy development methods.
            </p>
            <Button className="text-lg px-6 py-6 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Policy Impact Analysis</h2>
            <p className="text-lg text-gray-700 mb-6">
              Our impact analysis work combines agent-based modeling with causal inference to simulate how policies
              might affect different stakeholders, industries, and economic indicators over time.
            </p>
            <Button className="text-lg px-6 py-6 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="border-t-2 border-black dark:border-white pt-12">
          <h2 className="text-3xl font-bold mb-6">Current Projects</h2>

          <div className="space-y-12">
            <div className="border-l-4 border-black dark:border-white pl-6 py-2">
              <h3 className="text-2xl font-bold mb-2">AI Governance Simulation</h3>
              <p className="text-lg text-gray-700">
                Developing agent-based models to simulate the effects of different AI governance frameworks on
                innovation, safety, and economic outcomes.
              </p>
            </div>

            <div className="border-l-4 border-black dark:border-white pl-6 py-2">
              <h3 className="text-2xl font-bold mb-2">Climate Policy Optimization</h3>
              <p className="text-lg text-gray-700">
                Using causal inference to identify optimal policy mixes for climate change mitigation while minimizing
                economic disruption.
              </p>
            </div>

            <div className="border-l-4 border-black dark:border-white pl-6 py-2">
              <h3 className="text-2xl font-bold mb-2">Healthcare Access Modeling</h3>
              <p className="text-lg text-gray-700">
                Simulating the effects of different healthcare policies on access, quality, and cost across diverse
                populations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
