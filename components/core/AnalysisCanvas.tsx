"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import PureBubbleCanvas from "@/components/features/visualization/agents/PureBubbleCanvas"
import { SimpleLineChart } from "@/components/visualizations/charts/SimpleLineChart"
import { AreaChart } from "@/components/visualizations/charts/AreaChart"
import { RevenueChart } from "@/components/visualizations/charts/RevenueChart"
import { PolicyImpactBar } from "@/components/visualizations/charts/PolicyImpactBar"
import { CompactToggle } from "@/components/ui/CompactToggle"
import {
  Play, Pause, Zap, Users, Activity, ChevronRight, ChevronLeft,
  BarChart3, DollarSign, Minimize2, Maximize2,
  ExternalLink, ArrowLeft, RotateCcw, HelpCircle
} from 'lucide-react'
import { CaseId } from "@/components/explore/content/types"

interface AnalysisCanvasProps {
  selectedCase: CaseId | null
}

/**
 * COMPONENT: Bubble Legend
 */
const BubbleLegend = () => (
    <div className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-2xl p-4 w-40">
        <div className="flex items-center gap-2 mb-3">
            <HelpCircle size={12} className="text-gray-400" />
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Agent Type</h3>
        </div>
        <div className="space-y-2.5">
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#be123c] shadow-sm"></div>
              <span className="text-xs text-gray-600 font-medium">Petrol</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#c2410c] shadow-sm"></div>
              <span className="text-xs text-gray-600 font-medium">Diesel</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#d97706] shadow-sm"></div>
              <span className="text-xs text-gray-600 font-medium">Hybrid</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-[#059669] shadow-sm"></div>
              <span className="text-xs text-gray-600 font-medium">Electric (EV)</span>
           </div>
           <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full border-2 border-[#0891b2]"></div>
              <span className="text-xs text-gray-600 font-medium">Cyclist</span>
           </div>
        </div>
    </div>
);

export default function AnalysisCanvas({
  selectedCase
}: AnalysisCanvasProps) {

  // Simulation control state (PRESERVED)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const [totalFrames, setTotalFrames] = useState(120)
  const [frames, setFrames] = useState<any[]>([])
  const [isRunningSimulation, setIsRunningSimulation] = useState(false)
  const animationRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number>(0)

  // Policy choice state (PRESERVED)
  const [selectedPolicy, setSelectedPolicy] = useState('purchase')

  // NEW: UI visibility state
  const [showDashboard, setShowDashboard] = useState(true)
  const [showControls, setShowControls] = useState(true)
  const [viewMode, setViewMode] = useState<'simulation' | 'full-dashboard'>('simulation')

  // NEW: Config state for toggles
  const [config, setConfig] = useState({
    taxFuel: false,
    taxPurchase: false,
    networkMode: false,  // Empty placeholder
    largePopulation: false,  // Empty placeholder
  })

  // NEW: Mock metrics state (from vibe code)
  const [metrics, setMetrics] = useState({
    emissionHistory: Array(20).fill(80),
    marketShare: [30, 15, 20, 15, 20],
    totalEmissions: 79,
    emissionsPercentageChange: 0,
    costEffectiveness: 142,
    equityImpact: [20, 35, 45, 50, 60],
    fleetOverTime: [
       "0,10 10,12 20,15 30,20 40,25 50,28 60,30 70,35 80,40 90,45 100,50",
       "0,30 10,28 20,25 30,22 40,20 50,18 60,15 70,12 80,10 90,8 100,5",
    ],
    flowsNewCars: [10, 12, 15, 14, 18, 22, 25, 24, 28, 30],
    evDemandVsCapacity: {
        demand: [5, 8, 12, 15, 20, 28, 35, 42, 50, 55],
        capacity: [10, 10, 15, 20, 25, 30, 35, 40, 45, 50]
    },
    revenue: [10, 20, 30, 25, 40, 50, 45, 60, 55, 70],
    subsidies: [5, 8, 15, 20, 25, 30, 40, 45, 50, 55]
  })

  // Calculate dynamic fuel carbon tax based on simulation month
  const calculateFuelTax = (month: number): number => {
    // Carbon tax rates (€/tonne CO2) - BC progressive tax schedule
    let rate = 6.97 // default (month 0)
    if (month >= 48) rate = 20.89
    else if (month >= 36) rate = 17.42
    else if (month >= 24) rate = 13.94
    else if (month >= 12) rate = 10.45

    // Diesel carbon content: 2640 g CO2/liter
    const fuelCarbonContent = 2640

    // Calculate tax per liter
    return (rate * fuelCarbonContent) / 1000000
  }

  // Calculate dynamic fuel tax based on current simulation month
  const currentMonth = currentFrame
  const dynamicFuelTax = calculateFuelTax(currentMonth)

  // Policy-specific cost values (research-based calibration)
  const policyValues = {
    purchase: {
      vehicleBase: 26000,
      vehicleTax: 5000,
      fuelBase: 1.50,
      fuelTax: 0
    },
    fuel: {
      vehicleBase: 26000,
      vehicleTax: 0,
      fuelBase: 1.50,
      fuelTax: dynamicFuelTax  // Dynamic - changes with simulation time
    }
  }

  const currentValues = policyValues[selectedPolicy]

  // NEW: Sync config toggles with selectedPolicy state
  useEffect(() => {
    setConfig(prev => ({
      ...prev,
      taxFuel: selectedPolicy === 'fuel',
      taxPurchase: selectedPolicy === 'purchase'
    }))
  }, [selectedPolicy])

  // NEW: When toggle clicked, update selectedPolicy
  const handlePolicyToggle = (policyType: 'fuel' | 'purchase') => {
    setSelectedPolicy(policyType)
  }

  // PRESERVED: Load simulation data based on selected policy
  useEffect(() => {
    async function loadSimulationData() {
      // Stop animation when switching policies
      setIsPlaying(false)
      if (animationRef.current) {
        clearTimeout(animationRef.current)
        animationRef.current = null
      }

      try {
        // Map policy ID to Python policy type
        const policyType = selectedPolicy === 'fuel' ? 'fuel_tax' : 'vehicle_tax'
        const filename = `simulation_${policyType}.json`

        console.log(`Loading simulation data for policy: ${selectedPolicy} (${filename})`)

        const response = await fetch(`/${filename}`)
        if (response.ok) {
          const result = await response.json()
          if (Array.isArray(result)) {
            setFrames(result)
            setTotalFrames(result.length)
            setCurrentFrame(0) // Reset to beginning
            console.log(`Loaded ${result.length} frames for ${policyType} - Reset to frame 0`)

            // Initialize metrics with first frame data
            if (result.length > 0 && result[0].totalEmissionsTonnes !== undefined) {
              setMetrics(prev => ({
                ...prev,
                totalEmissions: result[0].totalEmissionsTonnes,
                emissionHistory: [result[0].totalEmissionsTonnes]
              }))
            }
          }
        } else {
          console.warn(`No data found for ${filename}, may need to run simulation first`)
        }
      } catch (error) {
        console.error('Failed to load simulation data:', error)
      }
    }
    loadSimulationData()
  }, [selectedPolicy])

  // Sync metrics with current frame
  useEffect(() => {
    if (frames.length === 0 || currentFrame >= frames.length) {
      return // No data loaded yet
    }

    const frame = frames[currentFrame]

    // Get emissions from pre-calculated field (or fallback to 0)
    const currentEmissions = frame.totalEmissionsTonnes ?? 0

    // Build emission history from all frames up to current
    const emissionHistory = frames
      .slice(0, currentFrame + 1)
      .map(f => f.totalEmissionsTonnes ?? 0)

    // Calculate percentage change from baseline
    const baselineEmissions = emissionHistory[0] || 0
    const percentageChange = baselineEmissions > 0
      ? ((currentEmissions - baselineEmissions) / baselineEmissions) * 100
      : 0

    // Update metrics state
    setMetrics(prev => ({
      ...prev,
      totalEmissions: currentEmissions,
      emissionHistory: emissionHistory,
      emissionsPercentageChange: percentageChange
    }))

  }, [currentFrame, frames])

  // PRESERVED: Animation control functions
  const handlePlay = useCallback(() => {
    if (currentFrame >= totalFrames - 1) {
      setCurrentFrame(0) // Reset to beginning if at end
    }
    setIsPlaying(true)
  }, [currentFrame, totalFrames])

  const handlePause = useCallback(() => {
    setIsPlaying(false)
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  const handleReset = useCallback(async () => {
    setIsPlaying(false)
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }

    // Run new simulation with selected policy
    setIsRunningSimulation(true)
    try {
      // Convert UI policy ID to Python policy type
      const policyType = selectedPolicy === 'fuel' ? 'fuel_tax' : 'vehicle_tax'

      console.log(`Running simulation for policy: ${selectedPolicy} (${policyType})`)

      const response = await fetch('/api/run-simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ policyType })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('Simulation completed:', result)

        // Reload policy-specific data
        const filename = `simulation_${policyType}.json`
        const dataResponse = await fetch(`/${filename}`)
        if (dataResponse.ok) {
          const simulationData = await dataResponse.json()
          if (Array.isArray(simulationData)) {
            setFrames(simulationData)
            setTotalFrames(simulationData.length)
            setCurrentFrame(0)
            setIsPlaying(true) // Auto-start after reset
            console.log(`Loaded ${simulationData.length} frames after simulation`)
          }
        }
      } else {
        const errorData = await response.json()
        console.error('Simulation failed:', errorData)
      }
    } catch (error) {
      console.error('Failed to run new simulation:', error)
    } finally {
      setIsRunningSimulation(false)
    }
  }, [selectedPolicy])

  const handleScrub = useCallback((frameIndex: number) => {
    setCurrentFrame(frameIndex)
    setIsPlaying(false)
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
  }, [])

  // PERFORMANCE FIX: Animation loop using requestAnimationFrame (0.4s per month)
  useEffect(() => {
    if (!isPlaying || isRunningSimulation) {
      return
    }

    const FRAME_DURATION = 400 // 0.4 seconds per month

    const animate = (timestamp: number) => {
      // Initialize lastFrameTime on first run
      if (lastFrameTimeRef.current === 0) {
        lastFrameTimeRef.current = timestamp
      }

      const elapsed = timestamp - lastFrameTimeRef.current

      if (elapsed >= FRAME_DURATION) {
        lastFrameTimeRef.current = timestamp

        setCurrentFrame(prev => {
          if (prev >= totalFrames - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }

      // Continue animation loop
      if (isPlaying && !isRunningSimulation) {
        animationRef.current = requestAnimationFrame(animate)
      }
    }

    // Start animation
    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      lastFrameTimeRef.current = 0
    }
  }, [isPlaying, totalFrames, isRunningSimulation])


  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-50 font-sans text-gray-800">

      {/* Layer 1: PureBubbleCanvas Background */}
      <div className="absolute inset-0 z-10">
        <PureBubbleCanvas
          width={typeof window !== 'undefined' ? window.innerWidth : 1920}
          height={typeof window !== 'undefined' ? window.innerHeight : 1080}
          currentFrame={currentFrame}
          onFrameUpdate={(frame) => setCurrentFrame(frame)}
          networkMode={config.networkMode}
        />
      </div>

      {viewMode === 'simulation' ? (
        <>
          {/* Layer 2: Header Toggle Buttons (Top Right) */}
          <div className="absolute top-0 right-0 w-full p-6 z-30 flex justify-end items-start pointer-events-none">
            <div className="flex gap-2 pointer-events-auto">
              <button
                onClick={() => setShowControls(!showControls)}
                className="p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white shadow-sm transition-all text-gray-700"
                title="Toggle Controls"
              >
                {showControls ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
              </button>
              <button
                onClick={() => setShowDashboard(!showDashboard)}
                className="p-2 bg-white/80 backdrop-blur rounded-full hover:bg-white shadow-sm transition-all text-gray-700"
                title="Toggle Sidebar"
              >
                {showDashboard ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div>
          </div>

          {/* Layer 3: Analytics Sidebar (Right) */}
          <div className={`
            absolute top-0 right-0 h-full w-[380px] z-20 bg-white/95 backdrop-blur-xl border-l border-white/20 shadow-2xl
            transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-y-auto
            ${showDashboard ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <div className="p-8 pt-24 space-y-8">
              <div className="pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quick Analytics</h2>
                  <button
                    onClick={() => setViewMode('full-dashboard')}
                    className="flex items-center gap-1.5 px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors"
                    title="Open Full Analytics"
                  >
                    <ExternalLink size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Expand</span>
                  </button>
                </div>
                <div className="flex justify-between items-baseline">
                  <div className="text-2xl font-serif text-gray-900">Scenario Metrics</div>
                  <div className="text-xs text-green-600 font-medium animate-pulse">● Live</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <h3 className="text-sm font-semibold text-gray-700">Fleet CO2 Trajectory</h3>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-light text-gray-900">{Math.round(metrics.totalEmissions)} <span className="text-xs text-gray-500">tonnes CO2e</span></span>
                    {/* Percentage change badge */}
                    {metrics.emissionsPercentageChange !== 0 && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${
                        metrics.emissionsPercentageChange < 0
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {metrics.emissionsPercentageChange > 0 ? '+' : ''}
                        {Math.round(metrics.emissionsPercentageChange)}%
                      </span>
                    )}
                  </div>
                </div>
                <SimpleLineChart data={metrics.emissionHistory} color="#be123c" height={150} label="Trend" />
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <BarChart3 size={16} className="text-gray-400"/> Drivers of Cost
                </h3>

                <PolicyImpactBar
                  label="Vehicle Purchase Price"
                  baseVal={currentValues.vehicleBase}
                  taxVal={currentValues.vehicleTax}
                  isTaxed={currentValues.vehicleTax > 0}
                  formatVal={(v) => `€${(v/1000).toFixed(1)}k`}
                  taxColor="bg-rose-500"
                  taxTextColor="text-rose-600"
                />

                <PolicyImpactBar
                  label="Fuel Cost (per L)"
                  baseVal={currentValues.fuelBase}
                  taxVal={currentValues.fuelTax}
                  isTaxed={currentValues.fuelTax > 0}
                  formatVal={(v) => `€${v.toFixed(2)}`}
                  taxColor="bg-amber-500"
                  taxTextColor="text-amber-600"
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <DollarSign size={16} />
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900">Cost Effectiveness</h3>
                </div>
                <div className="text-3xl font-light text-gray-900 mb-1">
                  €{Math.round(metrics.costEffectiveness)} <span className="text-sm text-gray-400 font-normal">/ tCO2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Layer 4: Unified Control Bar (Bottom Center) */}
          <div className={`
            absolute bottom-8 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center gap-1 transition-all duration-500
            ${showControls ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}
          `}>
            <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl rounded-2xl p-1.5 flex items-center gap-0">

              {/* Timeline Section (Left) */}
              <div className="flex items-center gap-2 px-3 border-r border-gray-100 flex-shrink-0">
                <button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center border transition-all flex-shrink-0
                    ${isPlaying
                      ? 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                      : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'}
                  `}
                  disabled={isRunningSimulation}
                >
                  {isPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
                </button>

                <div className="w-32 relative flex items-center flex-shrink-0">
                  <span className="text-[9px] font-bold text-gray-400 absolute -bottom-4 left-0">Year 1</span>
                  <input
                    type="range"
                    min="0"
                    max={totalFrames - 1}
                    value={currentFrame}
                    onChange={(e) => handleScrub(parseInt(e.target.value))}
                    disabled={isRunningSimulation}
                    className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 hover:bg-gray-200 transition-colors"
                  />
                  <span className="text-[9px] font-bold text-gray-400 absolute -bottom-4 right-0">Year 10</span>
                </div>

                <button
                  onClick={handleReset}
                  className="text-gray-400 hover:text-gray-900 transition-colors p-0.5 flex-shrink-0"
                  title="Restart"
                  disabled={isRunningSimulation}
                >
                  <RotateCcw size={14} />
                </button>
              </div>

              {/* Controls Section (Right) */}
              <div className="flex items-center gap-3 px-3">

                {/* Policy Group */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Policy</span>
                  <CompactToggle
                    active={config.taxPurchase}
                    onClick={() => handlePolicyToggle('purchase')}
                    icon={<BarChart3 size={14} />}
                    label="Purchase"
                  />
                  <CompactToggle
                    active={config.taxFuel}
                    onClick={() => handlePolicyToggle('fuel')}
                    icon={<Zap size={14} />}
                    label="Fuel"
                  />
                </div>

                {/* Divider */}
                <div className="h-5 w-px bg-gray-200"></div>

                {/* Model Group (Empty Placeholders) */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Model</span>
                  <CompactToggle
                    active={config.networkMode}
                    onClick={() => setConfig(c => ({...c, networkMode: !c.networkMode}))}
                    icon={<Activity size={14} />}
                    label="Social"
                  />
                  <CompactToggle
                    active={config.largePopulation}
                    onClick={() => setConfig(c => ({...c, largePopulation: !c.largePopulation}))}
                    icon={<Users size={14} />}
                    label="Scale"
                  />
                </div>
              </div>
            </div>
          </div>
        {/* Bubble Legend - Bottom Left */}
        <div className="absolute bottom-8 left-8 z-40">
          <BubbleLegend />
        </div>
        </>
      ) : (
        /* Full Dashboard View */
        <div className="w-full h-screen bg-gray-50 overflow-y-auto p-8 font-sans z-30 relative">
          <div className="max-w-7xl mx-auto flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-serif text-gray-900">Analytics Dashboard</h1>
            </div>
            <button
              onClick={() => setViewMode('simulation')}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700"
            >
              <ArrowLeft size={16} />
              Back to Simulation
            </button>
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="col-span-2 bg-white p-4 rounded-lg border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                About This Simulation
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Between 2008 and 2013, the Netherlands made cleaner cars cheaper and gas guzzlers more expensive through tax breaks, and this simulation recreates how thousands of Dutch families responded by showing simulated households with different incomes choosing from real vehicles based on price, taxes, and fuel costs. Early electric vehicle buyers were nervous about running out of charge, but as charging stations spread and neighbors started driving EVs successfully, this fear quickly faded (the simulation captures this shift). The model runs two parallel worlds: one with the actual tax policy that made Netherlands Europe's cleanest car market, and one without it, so we can see exactly how much the policy mattered versus normal technology improvements. You can experiment with different assumptions about how quickly people overcome range anxiety or respond to tax incentives to see how it changes both environmental results (CO2 reduced) and economic costs (tax revenue lost).
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col items-center justify-center">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 w-full text-left">Current Fleet Share</h4>
              <div className="relative w-40 h-40 rounded-full"
                style={{
                  background: `conic-gradient(
                    #be123c 0deg ${metrics.marketShare[0]*3.6}deg,
                    #c2410c ${metrics.marketShare[0]*3.6}deg ${(metrics.marketShare[0]+metrics.marketShare[1])*3.6}deg,
                    #d97706 ${(metrics.marketShare[0]+metrics.marketShare[1])*3.6}deg ${(metrics.marketShare[0]+metrics.marketShare[1]+metrics.marketShare[2])*3.6}deg,
                    #059669 ${(metrics.marketShare[0]+metrics.marketShare[1]+metrics.marketShare[2])*3.6}deg ${(metrics.marketShare[0]+metrics.marketShare[1]+metrics.marketShare[2]+metrics.marketShare[3])*3.6}deg,
                    #0891b2 ${(metrics.marketShare[0]+metrics.marketShare[1]+metrics.marketShare[2]+metrics.marketShare[3])*3.6}deg 360deg
                  )`
                }}
              >
                <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-xl font-bold text-gray-700">{Math.round(metrics.marketShare[3] + metrics.marketShare[4])}% <span className="text-xs font-normal block text-center text-emerald-600">Clean</span></span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] w-full px-4">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-rose-700"></div>Petrol</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-orange-700"></div>Diesel</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-amber-600"></div>Hybrid</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-600"></div>EV</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-cyan-600"></div>Cycle</div>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-3 bg-white p-4 rounded-lg border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Fleet Composition Evolution (10 Years)</h4>
              <AreaChart
                data={[{points: metrics.fleetOverTime[0]}, {points: metrics.fleetOverTime[1]}]}
                colors={['#059669', '#be123c']}
                height={250}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Year 1</span>
                <span>Year 10</span>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2">
              <SimpleLineChart
                label="Avg. Emissions per Capita (Time Series)"
                data={metrics.emissionHistory}
                color="#be123c"
              />
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">EV Demand vs Capacity</h4>
              <div className="relative h-40 w-full">
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                  <polyline
                    points={metrics.evDemandVsCapacity.capacity.map((d,i) => `${i*11},${100-d*2}`).join(' ')}
                    fill="none" stroke="#9ca3af" strokeWidth="2" strokeDasharray="4"
                  />
                  <polyline
                    points={metrics.evDemandVsCapacity.demand.map((d,i) => `${i*11},${100-d*2}`).join(' ')}
                    fill="none" stroke="#059669" strokeWidth="2"
                  />
                </svg>
                <div className="flex gap-4 text-xs mt-2 justify-center">
                  <span className="flex items-center gap-1 text-emerald-600"><div className="w-4 h-0.5 bg-emerald-600"></div> Demand</span>
                  <span className="flex items-center gap-1 text-gray-400"><div className="w-4 h-0.5 bg-gray-400 border-t border-dashed"></div> Capacity</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
