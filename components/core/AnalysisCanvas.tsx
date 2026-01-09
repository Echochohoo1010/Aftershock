"use client"

import { useWindowSize } from "@/hooks/useWindowSize"

// ... imports

export default function AnalysisCanvas({
  selectedCase
}: AnalysisCanvasProps) {

  const { width, height } = useWindowSize()
  const [dataLoaded, setDataLoaded] = useState(false)

  // ... (rest of state)

  // UPDATED: Load BOTH policy datasets on mount (no dependency on selectedPolicy)
  useEffect(() => {
    async function loadAllSimulationData() {
      try {
        console.log('Loading data for BOTH policies...')
        // ... (fetch logic)

        // After successful load:
        setPolicyData({ ... })
        setTotalFrames(...)
        setCurrentFrame(0)
        setDataLoaded(true) // MARK AS LOADED

      } catch (error) {
        console.error('Failed to load simulation data:', error)
        setDataLoaded(true) // Even on error, stop loading state (maybe show error UI)
      }
    }
    loadAllSimulationData()
  }, [])

  // ... (rest of logic)

  return (
    <div className="relative w-full h-screen overflow-hidden bg-zinc-50 font-sans text-gray-800">

      {/* Loading Overlay */}
      {!dataLoaded && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-opacity duration-500">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-sm font-medium text-gray-600 animate-pulse">Initializing Simulation...</p>
          </div>
        </div>
      )}

      {/* Layer 1: PureBubbleCanvas Background */}
      <div className="absolute inset-0 z-10">
        <PureBubbleCanvas
          width={width}
          height={height}
          currentFrame={currentFrame}
          onFrameUpdate={(frame) => setCurrentFrame(frame)}
          onLoadingChange={setBubbleLoading}
          networkMode={config.networkMode}
          selectedPolicy={selectedPolicy}
          simulationFrames={policyData[selectedPolicy === 'fuel' ? 'fuel_tax' : 'vehicle_tax'].frames}
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
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${metrics.emissionsPercentageChange < 0
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
                  <BarChart3 size={16} className="text-gray-400" /> Drivers of Cost
                </h3>

                <PolicyImpactBar
                  label="Vehicle Purchase Price"
                  baseVal={currentValues.vehicleBase}
                  taxVal={currentValues.vehicleTax}
                  isTaxed={currentValues.vehicleTax > 0}
                  formatVal={(v) => `€${(v / 1000).toFixed(1)}k`}
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
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">
                    Policy
                    {bubbleLoading && (
                      <span className="ml-1.5 text-blue-500 animate-pulse">●</span>
                    )}
                  </span>
                  <CompactToggle
                    active={config.taxPurchase}
                    onClick={() => handlePolicyToggle('purchase')}
                    icon={<BarChart3 size={14} />}
                    label="Purchase tax"
                    disabled={bubbleLoading}
                  />
                  <CompactToggle
                    active={config.taxFuel}
                    onClick={() => handlePolicyToggle('fuel')}
                    icon={<Zap size={14} />}
                    label="Fuel tax"
                    disabled={bubbleLoading}
                  />
                </div>

                {/* Divider */}
                {/* <div className="h-5 w-px bg-gray-200"></div> */}

                {/* Model Group (Empty Placeholders) - Hidden for now, may be used in future */}
                {/* <div className="flex items-center gap-1.5">
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
                </div> */}
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
                    #be123c 0deg ${metrics.marketShare[0] * 3.6}deg,
                    #c2410c ${metrics.marketShare[0] * 3.6}deg ${(metrics.marketShare[0] + metrics.marketShare[1]) * 3.6}deg,
                    #d97706 ${(metrics.marketShare[0] + metrics.marketShare[1]) * 3.6}deg ${(metrics.marketShare[0] + metrics.marketShare[1] + metrics.marketShare[2]) * 3.6}deg,
                    #059669 ${(metrics.marketShare[0] + metrics.marketShare[1] + metrics.marketShare[2]) * 3.6}deg ${(metrics.marketShare[0] + metrics.marketShare[1] + metrics.marketShare[2] + metrics.marketShare[3]) * 3.6}deg,
                    #3b82f6 ${(metrics.marketShare[0] + metrics.marketShare[1] + metrics.marketShare[2] + metrics.marketShare[3]) * 3.6}deg 360deg
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
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-emerald-600"></div>EV/PHEV</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded bg-blue-500"></div>Cycle</div>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-3 bg-white p-4 rounded-lg border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">EV Adoption Over Time (10 Years)</h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={evAdoptionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    label={{ value: 'Month', position: 'insideBottom', offset: -5, style: { fontSize: '12px', fill: '#9ca3af' } }}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value) => value % 12 === 0 ? `${value / 12}y` : ''}
                  />
                  <YAxis
                    label={{ value: 'EV Adoption (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9ca3af' } }}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    domain={[0, 'auto']}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(value) => `Month ${value} (Year ${Math.floor(value / 12) + 1})`}
                    formatter={(value: any) => [`${value.toFixed(2)}%`, 'EV Adoption']}
                  />
                  <Line
                    type="monotone"
                    dataKey="ev_adoption"
                    stroke="#059669"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>Year 1</span>
                <span>Year 10</span>
              </div>
            </div>

            <div className="col-span-1 lg:col-span-2 bg-white p-4 rounded-lg border border-gray-100">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                Fleet CO2 Trajectory (10 Years)
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={fleetCO2Data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    label={{ value: 'Month', position: 'insideBottom', offset: -5, style: { fontSize: '12px', fill: '#9ca3af' } }}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    tickFormatter={(value) => value % 12 === 0 ? `${value / 12}y` : ''}
                  />
                  <YAxis
                    label={{ value: 'CO2 Emissions (tonnes)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#9ca3af' } }}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px' }}
                    labelFormatter={(value) => `Month ${value} (Year ${Math.floor(value / 12) + 1})`}
                    formatter={(value: any) => [`${value.toFixed(2)} tonnes`, 'Emissions']}
                  />
                  <Line
                    type="monotone"
                    dataKey="emissions"
                    stroke="#be123c"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: '#be123c' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100 flex flex-col items-center justify-center">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 w-full text-center">
                Full Documentation
              </h4>
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-full">
                  <ExternalLink size={24} />
                </div>
                <p className="text-sm text-gray-600 text-center max-w-xs">
                  Download the comprehensive carbon policy report and technical documentation
                </p>
                <a
                  href="/carbon_policy_report.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <ExternalLink size={16} />
                  Download Full Report
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
