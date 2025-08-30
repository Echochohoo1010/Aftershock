"use client"

import { useState } from "react"
import AgentBubblesVisualization from "@/components/agent-bubbles-visualization"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Network, Zap, Send } from "lucide-react"

export default function AgentPage() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Welcome! I can help you understand the agent simulation. Try asking:',
      suggestions: [
        'What do the different colors mean?',
        'How does policy adoption work?',
        'Change the number of agents to 100',
        'Simulate healthcare policy adoption'
      ]
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [simulationParams, setSimulationParams] = useState({
    policyContext: "Digital transformation policy for government services - implementing online-first approach for citizen interactions, digital identity systems, and automated service delivery",
    numAgents: 50,
    timeFrames: 24
  })

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue
    }

    // Simple bot responses
    let botResponse = {
      id: messages.length + 2,
      type: 'bot',
      content: ''
    }

    const input = inputValue.toLowerCase()

    if (input.includes('color') || input.includes('type')) {
      botResponse.content = 'Agent colors represent different types: Innovators (green) adopt early, Adopters (light) follow trends, Skeptics (orange) resist change, Influencers (brown) have high impact, and Observers (dark) wait and watch.'
    } else if (input.includes('adoption') || input.includes('work')) {
      botResponse.content = 'Policy adoption follows an S-curve: Innovators start the process, influence Observers who become Adopters, and eventually even Skeptics join when adoption reaches critical mass. Network effects accelerate the process.'
    } else if (input.includes('healthcare')) {
      setSimulationParams(prev => ({
        ...prev,
        policyContext: "Healthcare digitization policy - implementing electronic health records, telemedicine platforms, and AI-assisted diagnostics across medical facilities"
      }))
      botResponse.content = 'Updated simulation to healthcare policy context. You\'ll see agents representing doctors, nurses, administrators, and patients with different adoption patterns for medical technology.'
    } else if (input.includes('100') || input.includes('agents')) {
      const newNum = input.match(/\d+/)?.[0]
      if (newNum) {
        setSimulationParams(prev => ({ ...prev, numAgents: parseInt(newNum) }))
        botResponse.content = `Updated simulation to ${newNum} agents. More agents create richer network dynamics and more realistic adoption patterns.`
      }
    } else {
      botResponse.content = 'I can help explain the simulation, change parameters, or switch policy contexts. What would you like to know?'
    }

    setMessages(prev => [...prev, userMessage, botResponse])
    setInputValue('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto p-6">
        {/* Header Section */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Agent-Based Modeling</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore how policies spread through social networks using force-directed physics simulation.
            Watch agents interact, influence each other, and adopt new behaviors over time.
          </p>
        </div>

        {/* Key Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gray-800 border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Network className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Social Networks</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Agents form connections and influence each other through realistic social network dynamics.
            </p>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <Zap className="w-6 h-6 text-yellow-400" />
              <h3 className="text-lg font-semibold text-white">Physics Simulation</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Real-time collision detection, bouncing, and force-directed movement create natural behaviors.
            </p>
          </Card>

          <Card className="p-6 bg-gray-800 border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <h3 className="text-lg font-semibold text-white">Policy Adoption</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Track how innovations and policies spread through populations using realistic adoption curves.
            </p>
          </Card>
        </div>

        {/* Agent Types Overview */}
        <Card className="p-6 mb-8 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Agent Types & Behaviors</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ backgroundColor: "#606c38" }}></div>
              <Badge variant="outline" className="mb-2 text-gray-300 border-gray-500">Innovator</Badge>
              <p className="text-xs text-gray-400">Early adopters who drive change and influence others</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ backgroundColor: "#fefae0" }}></div>
              <Badge variant="outline" className="mb-2 text-gray-300 border-gray-500">Adopter</Badge>
              <p className="text-xs text-gray-400">Follow innovators and help spread adoption</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ backgroundColor: "#dda15e" }}></div>
              <Badge variant="outline" className="mb-2 text-gray-300 border-gray-500">Skeptic</Badge>
              <p className="text-xs text-gray-400">Resistant to change, adopt only after majority</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ backgroundColor: "#bc6c25" }}></div>
              <Badge variant="outline" className="mb-2 text-gray-300 border-gray-500">Influencer</Badge>
              <p className="text-xs text-gray-400">High-activity agents who accelerate adoption</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ backgroundColor: "#8b5a3c" }}></div>
              <Badge variant="outline" className="mb-2 text-gray-300 border-gray-500">Observer</Badge>
              <p className="text-xs text-gray-400">Passive agents waiting to be influenced</p>
            </div>
          </div>
        </Card>

        {/* Main Content - Visualization + Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Visualization Panel */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-gray-800 border-gray-700">
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-white mb-2">Live Agent Simulation</h2>
                <p className="text-gray-300">
                  Watch agents interact in real-time as policy adoption spreads through the network over 24 months.
                </p>
              </div>
              <AgentBubblesVisualization
                policyContext={simulationParams.policyContext}
                numAgents={simulationParams.numAgents}
                timeFrames={simulationParams.timeFrames}
              />
            </Card>
          </div>


        </div>

        {/* How It Works */}
        <Card className="p-6 mt-8 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Physics Engine</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• D3.js force-directed simulation</li>
                <li>• Collision detection with bouncing</li>
                <li>• Boundary constraints keep agents contained</li>
                <li>• Continuous movement with charge repulsion</li>
                <li>• Agent size reflects influence level</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Adoption Model</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Starts with 2 Innovators and 4 Skeptics</li>
                <li>• Observers gradually become Adopters</li>
                <li>• Adoption follows realistic S-curve over time</li>
                <li>• Agent colors change as they adopt policies</li>
                <li>• Adoption rate tracked and displayed</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Use Cases */}
        <Card className="p-6 mt-8 bg-gray-800 border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Policy Analysis</h3>
              <p className="text-gray-300 text-sm">
                Model how new policies spread through organizations or communities
              </p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Innovation Diffusion</h3>
              <p className="text-gray-300 text-sm">
                Study how new technologies or ideas are adopted across populations
              </p>
            </div>
            <div className="p-4 bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Social Dynamics</h3>
              <p className="text-gray-300 text-sm">
                Understand influence patterns and network effects in social systems
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}