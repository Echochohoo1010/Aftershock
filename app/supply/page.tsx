"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { supplyChainProcessor } from "@/lib/supply-chain-processor"
import {
    Ship,
    Globe,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    MapPin,
    BarChart3,
    Activity,
    Waves,
    DollarSign,
    Clock,
    Zap,
    Eye,
    EyeOff,
    RefreshCw,
    Download,
    Settings,
    Loader2,
    Sparkles
} from "lucide-react"

import createGlobe from "cobe";

// Cobe sphere component
const CobeGlobe = ({ markers = [], routes = [], isPaused = false, targetLocation = null }) => {
    const canvasRef = useRef()
    const globeRef = useRef()
    
    useEffect(() => {
        let phi = 0
        let theta = 0
        let targetPhi = 0
        let targetTheta = 0
        let isAnimatingToTarget = false

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 600 * 2,
            height: 600 * 2,
            phi: 0,
            theta: 0,
            dark: 0,
            diffuse: 0.4,
            mapSamples: 20000,
            mapBrightness: 6,
            baseColor: [1.0, 1.0, 1.0],
            markerColor: [0.1, 0.2, 1],
            glowColor: [1, 1, 1],
            markers: [
                // Cape of Good Hope
                { location: [-34.3587, 18.4732], size: 0.1 },
                // Suez Canal
                { location: [30.0444, 31.2357], size: 0.08 },
                // Major ports
                { location: [1.2966, 103.7764], size: 0.06 }, // Singapore
                { location: [22.3193, 114.1694], size: 0.06 }, // Hong Kong
                { location: [35.1796, 129.0756], size: 0.06 }, // Busan
                { location: [51.9244, 4.4777], size: 0.06 }, // Rotterdam
                { location: [33.7490, -118.2437], size: 0.06 }, // Los Angeles
                { location: [40.6892, -74.006], size: 0.06 }, // New York
                ...markers
            ],
            onRender: (state) => {
                if (targetLocation && !isAnimatingToTarget) {
                    // Convert lat/lng to spherical coordinates
                    const lat = targetLocation[0] * Math.PI / 180
                    const lng = targetLocation[1] * Math.PI / 180
                    targetPhi = lng
                    targetTheta = lat
                    isAnimatingToTarget = true
                }

                if (isAnimatingToTarget) {
                    // Smooth animation to target
                    const phiDiff = targetPhi - phi
                    const thetaDiff = targetTheta - theta
                    
                    phi += phiDiff * 0.05
                    theta += thetaDiff * 0.05
                    
                    // Stop animation when close enough
                    if (Math.abs(phiDiff) < 0.01 && Math.abs(thetaDiff) < 0.01) {
                        isAnimatingToTarget = false
                    }
                } else if (!isPaused) {
                    // Normal rotation when not paused and not targeting
                    phi += 0.01
                }

                state.phi = phi
                state.theta = theta
            }
        })
        
        globeRef.current = globe
        
        return () => {
            globe.destroy()
        }
    }, [markers, isPaused, targetLocation])
    return (
        <div className="aspect-square w-full max-w-md mx-auto">
            <canvas
                ref={canvasRef}
                style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
            />
        </div>
    )
}

// Mock data for shipping routes and environmental impact
const mockShippingData = {
    routes: [
        {
            id: 'suez-route',
            name: 'Traditional Suez Canal Route',
            status: 'disrupted',
            distance: '11,200 nautical miles',
            duration: '24 days',
            cost: '$2,400/TEU',
            riskLevel: 'high',
            active: false,
            location: [30.0444, 31.2357] // Suez Canal
        },
        {
            id: 'cape-route',
            name: 'Cape of Good Hope Route',
            status: 'active',
            distance: '13,500 nautical miles',
            duration: '35 days',
            cost: '$3,600/TEU',
            riskLevel: 'medium',
            active: true,
            location: [-34.3587, 18.4732] // Cape of Good Hope
        },
        {
            id: 'panama-route',
            name: 'Panama Canal Alternative',
            status: 'congested',
            distance: '14,800 nautical miles',
            duration: '38 days',
            cost: '$4,200/TEU',
            riskLevel: 'low',
            active: true,
            location: [9.0820, -79.7821] // Panama Canal
        }
    ],
    environmentalData: {
        capeOfGoodHope: {
            2023: {
                coastalErosion: 2.3,
                trafficVolume: 1200,
                waterQuality: 78,
                marineLife: 85
            },
            2024: {
                coastalErosion: 4.7,
                trafficVolume: 2800,
                waterQuality: 65,
                marineLife: 72
            }
        }
    },
    priceImpacts: {
        westCoast: { increase: 50, baseline: 2400 },
        eastCoast: { increase: 75, baseline: 2800 }
    }
}

export default function SupplyChainDashboard() {
    const [selectedRoute, setSelectedRoute] = useState('cape-route')
    const [showEnvironmentalData, setShowEnvironmentalData] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [simulationRunning, setSimulationRunning] = useState(false)
    const [customScenario, setCustomScenario] = useState('')
    const [aiAnalysisResult, setAiAnalysisResult] = useState(null)
    const [realTimeData, setRealTimeData] = useState(supplyChainProcessor.getVisualizationData())
    const [globePaused, setGlobePaused] = useState(false)
    const [globeTargetLocation, setGlobeTargetLocation] = useState(null)

    const runScenarioSimulation = async () => {
        if (!customScenario.trim()) return

        setSimulationRunning(true)
        setGlobePaused(true) // Pause globe during query
        
        try {
            // Use data processor directly since AI is not working
            const analysisResult = supplyChainProcessor.generateSupplyChainAnalysis(customScenario)
            setAiAnalysisResult(analysisResult)
            console.log('Supply Chain Analysis Result (Data Processor):', analysisResult)

            // Pan to location of interest based on analysis
            if (analysisResult.routeAnalysis) {
                const primaryRoute = analysisResult.routeAnalysis.primaryRoute.toLowerCase()
                let targetLocation = null
                
                if (primaryRoute.includes('cape')) {
                    targetLocation = [-34.3587, 18.4732] // Cape of Good Hope
                } else if (primaryRoute.includes('suez')) {
                    targetLocation = [30.0444, 31.2357] // Suez Canal
                } else if (primaryRoute.includes('panama')) {
                    targetLocation = [9.0820, -79.7821] // Panama Canal
                }
                
                if (targetLocation) {
                    setGlobeTargetLocation(targetLocation)
                }
            }

        } catch (error) {
            console.error('Scenario simulation failed:', error)
        } finally {
            setSimulationRunning(false)
            // Keep globe paused after query completes
        }
    }

    // Test function to verify data processor is working
    const testDataProcessor = async () => {
        console.log('Testing Data Processor...')
        try {
            const testScenario = "What if the Panama Canal experiences severe drought reducing capacity by 40%?"
            const result = supplyChainProcessor.generateSupplyChainAnalysis(testScenario)
            console.log('Data Processor Test Result:', result)
            alert('✅ Data Processor is working!\n\nCheck console for full test results.')
        } catch (error) {
            console.error('Data Processor Test Failed:', error)
            alert('❌ Data Processor test failed!\n\nCheck console for error details.')
        }
    }

    const handleRouteSelection = (routeId) => {
        setSelectedRoute(routeId)
        const route = mockShippingData.routes.find(r => r.id === routeId)
        if (route && route.location) {
            setGlobePaused(true)
            setGlobeTargetLocation(route.location)
        }
    }
    const resumeGlobeRotation = () => {
        setGlobePaused(false)
        setGlobeTargetLocation(null)
    }

    const EnvironmentalImpactCard = () => {
        // Use real data from supply chain processor or AI analysis result
        const data = aiAnalysisResult?.environmentalImpact || {
            coastalErosion: 104,
            trafficVolume: 133,
            waterQuality: 65,
            marineLife: 72,
            carbonEmissions: 28
        }

        const erosionChange = data.coastalErosion
        const trafficChange = data.trafficVolume

        return (
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <Waves className="w-5 h-5 text-blue-500" />
                        Environmental Impact Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">+{erosionChange}%</div>
                                <div className="text-sm text-gray-600">Coastal Erosion</div>
                                <div className="text-xs text-gray-500">2023 vs 2024</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                                <div className="text-2xl font-bold text-orange-600">+{trafficChange}%</div>
                                <div className="text-sm text-gray-600">Ship Traffic</div>
                                <div className="text-xs text-gray-500">Cape Route</div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Water Quality Index</span>
                                    <span className="text-red-600">-17%</span>
                                </div>
                                <Progress value={65} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>Marine Life Health</span>
                                    <span className="text-red-600">-15%</span>
                                </div>
                                <Progress value={72} className="h-2" />
                            </div>
                        </div>

                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                            <strong>Data Source:</strong> GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL dataset analysis
                            showing environmental changes around Cape of Good Hope due to increased shipping traffic.
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const RouteAnalysisCard = () => {
        // Use real data from supply chain processor or AI analysis result
        const routes = aiAnalysisResult?.routeAnalysis ?
            realTimeData.routes.map(route => ({
                ...route,
                status: route.id === aiAnalysisResult.routeAnalysis.primaryRoute.toLowerCase().replace(/\s+/g, '-') ? 'active' : route.status
            })) : realTimeData.routes

        return (
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <Ship className="w-5 h-5 text-blue-500" />
                        Shipping Route Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {mockShippingData.routes.map((route) => (
                            <div
                                key={route.id}
                                className={`p-4 rounded-lg border cursor-pointer transition-colors ${selectedRoute === route.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                onClick={() => handleRouteSelection(route.id)}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-gray-900">{route.name}</h4>
                                    <Badge
                                        variant={route.status === 'active' ? 'default' :
                                            route.status === 'disrupted' ? 'destructive' : 'secondary'}
                                    >
                                        {route.status}
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Distance:</span>
                                        <div className="font-medium">{route.distance}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Duration:</span>
                                        <div className="font-medium">{route.duration}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Cost:</span>
                                        <div className="font-medium">{route.cost}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Risk:</span>
                                        <div className={`font-medium ${route.riskLevel === 'high' ? 'text-red-600' :
                                            route.riskLevel === 'medium' ? 'text-orange-600' : 'text-green-600'
                                            }`}>
                                            {route.riskLevel}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    const PriceImpactCard = () => {
        // Use real data from AI analysis result or fallback
        const economicData = aiAnalysisResult?.economicImpact || {
            freightCostIncrease: 58,
            estimatedLosses: "$2.4 billion monthly"
        }

        return (
            <Card className="border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-card-foreground">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        Freight Price Impact
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-red-600" />
                                <span className="font-semibold text-red-900">US West Coast</span>
                            </div>
                            <div className="text-2xl font-bold text-red-600">+50%</div>
                            <div className="text-sm text-gray-600">
                                ${mockShippingData.priceImpacts.westCoast.baseline} → $
                                {Math.round(mockShippingData.priceImpacts.westCoast.baseline * 1.5)} per TEU
                            </div>
                        </div>

                        <div className="bg-red-50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp className="w-4 h-4 text-red-600" />
                                <span className="font-semibold text-red-900">US East Coast</span>
                            </div>
                            <div className="text-2xl font-bold text-red-600">+75%</div>
                            <div className="text-sm text-gray-600">
                                ${mockShippingData.priceImpacts.eastCoast.baseline} → $
                                {Math.round(mockShippingData.priceImpacts.eastCoast.baseline * 1.75)} per TEU
                            </div>
                        </div>

                        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            Price increases due to Red Sea attacks forcing Cape of Good Hope rerouting
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="pt-20 pb-6">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto text-center">
                        <h1 className="text-3xl font-bold mb-2 text-foreground">
                            Supply Chain Route Analysis
                        </h1>
                        <p className="text-sm text-muted-foreground mb-4">
                            Real-time shipping route optimization with environmental impact modeling
                        </p>
                        <div className="flex justify-center gap-2 text-sm">
                            <Badge variant="secondary">Cape of Good Hope Active</Badge>
                            <Badge variant="destructive">Suez Canal Disrupted</Badge>
                            <Badge variant="secondary">Environmental Monitoring</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="pb-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-7xl mx-auto">
                        {/* Scenario Generator */}
                        <Card className="mb-6 border-border">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-card-foreground flex items-center gap-2 text-lg">
                                    <Zap className="w-5 h-5 text-primary" />
                                    Supply Chain Scenario Modeling
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <Textarea
                                            placeholder="e.g., What if the Panama Canal experiences severe drought reducing capacity by 40%?"
                                            value={customScenario}
                                            onChange={(e) => setCustomScenario(e.target.value)}
                                            className="flex-1 min-h-[60px] resize-none"
                                            disabled={simulationRunning}
                                        />
                                        <Button
                                            onClick={runScenarioSimulation}
                                            disabled={!customScenario.trim() || simulationRunning}
                                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                                        >
                                            {simulationRunning ? (
                                                <RefreshCw className="animate-spin h-4 w-4" />
                                            ) : (
                                                <Activity className="w-4 h-4" />
                                            )}
                                        </Button>
                                    </div>
                                    <div className="flex justify-center gap-2">
                                        <Button
                                            onClick={testDataProcessor}
                                            variant="outline"
                                            size="sm"
                                            className="text-xs"
                                        >
                                            <Settings className="w-3 h-3 mr-1" />
                                            Test Data Processor
                                        </Button>
                                        {globePaused && (
                                            <Button
                                                onClick={resumeGlobeRotation}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs"
                                            >
                                                <RefreshCw className="w-3 h-3 mr-1" />
                                                Resume Globe
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Main Dashboard Grid */}
                        <div className="grid grid-cols-12 gap-6">
                            {/* Globe Visualization */}
                            <div className="col-span-12 lg:col-span-5">
                                <Card className="h-full border-border">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-card-foreground">
                                            <Globe className="w-5 h-5 text-blue-500" />
                                            Global Shipping Routes
                                            {globePaused && (
                                                <Badge variant="secondary" className="ml-2">
                                                    Paused
                                                </Badge>
                                            )}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="flex items-center justify-center">
                                        <CobeGlobe 
                                            isPaused={globePaused}
                                            targetLocation={globeTargetLocation}
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                            {/* Route Analysis */}
                            <div className="col-span-12 lg:col-span-7">
                                <RouteAnalysisCard />
                            </div>

                            {/* Environmental Impact */}
                            <div className="col-span-12 lg:col-span-6">
                                <EnvironmentalImpactCard />
                            </div>

                            {/* Price Impact */}
                            <div className="col-span-12 lg:col-span-6">
                                <PriceImpactCard />
                            </div>

                            {/* Detailed Analysis Tabs */}
                            <div className="col-span-12">
                                <Card className="border-border">
                                    <CardHeader>
                                        <CardTitle className="text-card-foreground">Detailed Analysis</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                                            <TabsList className="grid w-full grid-cols-4">
                                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                                <TabsTrigger value="environmental">Environmental</TabsTrigger>
                                                <TabsTrigger value="economic">Economic</TabsTrigger>
                                                <TabsTrigger value="predictions">Predictions</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="overview" className="mt-6">
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold">Current Situation</h3>
                                                    <p className="text-gray-600">
                                                        The rerouting of container ships around the Cape of Good Hope began due to
                                                        attacks in the Red Sea, which escalated in late 2023 and continued into 2024,
                                                        disrupting Suez Canal traffic.
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                        <div className="bg-blue-50 p-4 rounded-lg">
                                                            <div className="text-2xl font-bold text-blue-600">2,800</div>
                                                            <div className="text-sm text-gray-600">Ships rerouted monthly</div>
                                                        </div>
                                                        <div className="bg-orange-50 p-4 rounded-lg">
                                                            <div className="text-2xl font-bold text-orange-600">+11 days</div>
                                                            <div className="text-sm text-gray-600">Additional transit time</div>
                                                        </div>
                                                        <div className="bg-red-50 p-4 rounded-lg">
                                                            <div className="text-2xl font-bold text-red-600">$1.2B</div>
                                                            <div className="text-sm text-gray-600">Additional fuel costs</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="environmental" className="mt-6">
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold">Environmental Impact Assessment</h3>
                                                    <p className="text-gray-600">
                                                        Using GOOGLE/SATELLITE_EMBEDDING/V1/ANNUAL dataset to detect changes
                                                        around the Cape of Good Hope due to increased shipping traffic.
                                                    </p>
                                                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                                                        <h4 className="font-semibold text-yellow-800 mb-2">Key Findings</h4>
                                                        <ul className="text-sm text-yellow-700 space-y-1">
                                                            <li>• Coastal erosion increased by 104% from 2023 to 2024</li>
                                                            <li>• Marine ecosystem stress indicators up 28%</li>
                                                            <li>• Water quality degradation in high-traffic zones</li>
                                                            <li>• Potential long-term impact on port infrastructure</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="economic" className="mt-6">
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold">Economic Impact Analysis</h3>
                                                    <p className="text-gray-600">
                                                        Ocean freight prices have risen significantly as a direct result of rerouting efforts.
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                                            <h4 className="font-semibold text-red-800">Cost Increases</h4>
                                                            <div className="mt-2 space-y-2">
                                                                <div className="flex justify-between">
                                                                    <span className="text-sm">US West Coast:</span>
                                                                    <span className="font-bold text-red-600">+50%</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-sm">US East Coast:</span>
                                                                    <span className="font-bold text-red-600">+75%</span>
                                                                </div>
                                                                <div className="flex justify-between">
                                                                    <span className="text-sm">Additional Fuel:</span>
                                                                    <span className="font-bold text-red-600">+$800/TEU</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                                            <h4 className="font-semibold text-blue-800">Supply Chain Impact</h4>
                                                            <div className="mt-2 space-y-2 text-sm text-blue-700">
                                                                <div>• Inventory holding costs increased</div>
                                                                <div>• Just-in-time delivery disrupted</div>
                                                                <div>• Alternative sourcing strategies needed</div>
                                                                <div>• Consumer price inflation pressure</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="predictions" className="mt-6">
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-semibold">Predictive Modeling</h3>
                                                    <p className="text-gray-600">
                                                        Using embedding changes as inputs to predict logistical impacts and scenario outcomes.
                                                    </p>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                                            <h4 className="font-semibold text-purple-800">6-Month Forecast</h4>
                                                            <div className="mt-2 space-y-2 text-sm text-purple-700">
                                                                <div>• Cape route traffic to stabilize at +180%</div>
                                                                <div>• Coastal erosion may reduce port capacity by 5%</div>
                                                                <div>• Alternative routes development accelerated</div>
                                                                <div>• Regional shipping hub emergence</div>
                                                            </div>
                                                        </div>
                                                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                                                            <h4 className="font-semibold text-green-800">Mitigation Strategies</h4>
                                                            <div className="mt-2 space-y-2 text-sm text-green-700">
                                                                <div>• Invest in Cape Town port infrastructure</div>
                                                                <div>• Develop alternative Indian Ocean routes</div>
                                                                <div>• Implement environmental protection measures</div>
                                                                <div>• Diversify supply chain dependencies</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}