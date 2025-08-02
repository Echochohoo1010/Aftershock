// AI Data Processing Utilities for Scenario Generation
export interface SupercomputerData {
    name: string
    status: string
    maxOps: number
    h100Equivalents: number
    country: string
    owner: string
    powerCapacity: number
    sector: string
    operationalDate: string
}

export interface MLHardwareData {
    name: string
    manufacturer: string
    releaseDate: string
    performance: number
    memorySize: number
    tdp: number
    processSize: number
}

export interface AIModelData {
    model: string
    organization: string
    publicationDate: string
    parameters: number
    trainingCompute: number
    country: string
}

// Process CSV data for scenario variables
export class AIDataProcessor {
    private supercomputers: SupercomputerData[] = []
    private hardware: MLHardwareData[] = []
    private models: AIModelData[] = []

    constructor() {
        this.loadMockData()
    }

    private loadMockData() {
        // Mock data based on real CSV structure - in production, this would load from CSV
        this.supercomputers = [
            {
                name: "Meta $200B Campus",
                status: "Planned",
                maxOps: 4.01e22,
                h100Equivalents: 20262759,
                country: "United States",
                owner: "Meta AI",
                powerCapacity: 5000,
                sector: "Private",
                operationalDate: "2030"
            },
            {
                name: "OpenAI Stargate Abilene",
                status: "Planned",
                maxOps: 1.01e22,
                h100Equivalents: 5103588,
                country: "United States",
                owner: "OpenAI",
                powerCapacity: 2200,
                sector: "Private",
                operationalDate: "2027"
            },
            {
                name: "South Korea 3GW Cluster",
                status: "Planned",
                maxOps: 1.01e22,
                h100Equivalents: 5103588,
                country: "South Korea",
                owner: "Government",
                powerCapacity: 3000,
                sector: "Public",
                operationalDate: "2028"
            },
            {
                name: "UAE 5GW Campus Phase 2",
                status: "Planned",
                maxOps: 4.01e22,
                h100Equivalents: 20262759,
                country: "UAE",
                owner: "G42",
                powerCapacity: 5000,
                sector: "Public/Private",
                operationalDate: "2030"
            }
        ]

        this.hardware = [
            {
                name: "NVIDIA H200 SXM",
                manufacturer: "NVIDIA",
                releaseDate: "2024-11-18",
                performance: 1.979e15,
                memorySize: 192e9,
                tdp: 700,
                processSize: 5
            },
            {
                name: "AMD Instinct MI325X",
                manufacturer: "AMD",
                releaseDate: "2024-10-10",
                performance: 2.6e15,
                memorySize: 256e9,
                tdp: 1000,
                processSize: 5
            },
            {
                name: "Google TPU v7 Ironwood",
                manufacturer: "Google",
                releaseDate: "2025-04-09",
                performance: 4.614e15,
                memorySize: 192e9,
                tdp: 980,
                processSize: 5
            }
        ]

        this.models = [
            {
                model: "EXAONE 4.0 (32B)",
                organization: "LG AI Research",
                publicationDate: "2025-07-15",
                parameters: 32e9,
                trainingCompute: 2.69e24,
                country: "South Korea"
            },
            {
                model: "GPT-4",
                organization: "OpenAI",
                publicationDate: "2023-03-14",
                parameters: 1.76e12,
                trainingCompute: 2.15e25,
                country: "United States"
            },
            {
                model: "Claude-3",
                organization: "Anthropic",
                publicationDate: "2024-03-04",
                parameters: 1.2e12,
                trainingCompute: 4.12e25,
                country: "United States"
            }
        ]
    }

    // Generate scenario variables based on real data trends
    generateScenarioVariables(scenario: string): {
        computeGrowth: number
        powerDemand: number
        geopoliticalTension: number
        economicImpact: number
        technologicalLeadership: string[]
        criticalResources: string[]
    } {
        const variables = {
            computeGrowth: 0,
            powerDemand: 0,
            geopoliticalTension: 0,
            economicImpact: 0,
            technologicalLeadership: [] as string[],
            criticalResources: [] as string[]
        }

        // Analyze supercomputer trends
        const totalPlannedPower = this.supercomputers
            .filter(s => s.status === "Planned")
            .reduce((sum, s) => sum + s.powerCapacity, 0)

        const countryPowerDistribution = this.getCountryPowerDistribution()
        const topCountries = Object.entries(countryPowerDistribution)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([country]) => country)

        // Set variables based on data analysis
        variables.computeGrowth = Math.min(100, (totalPlannedPower / 1000) * 10) // Scale to percentage
        variables.powerDemand = Math.min(100, totalPlannedPower / 200) // Scale to percentage
        variables.geopoliticalTension = this.calculateGeopoliticalTension()
        variables.economicImpact = this.calculateEconomicImpact()
        variables.technologicalLeadership = topCountries
        variables.criticalResources = this.identifyCriticalResources()

        return variables
    }

    private getCountryPowerDistribution(): Record<string, number> {
        const distribution: Record<string, number> = {}

        this.supercomputers.forEach(sc => {
            if (!distribution[sc.country]) {
                distribution[sc.country] = 0
            }
            distribution[sc.country] += sc.powerCapacity
        })

        return distribution
    }

    private calculateGeopoliticalTension(): number {
        const countryDistribution = this.getCountryPowerDistribution()
        const countries = Object.keys(countryDistribution)

        // Higher tension if power is concentrated in fewer countries
        const concentrationIndex = countries.length > 0 ? 100 / countries.length : 0

        // Additional tension if US and China both have significant presence
        const hasUSChina = countries.includes("United States") && countries.includes("China")

        return Math.min(100, concentrationIndex + (hasUSChina ? 30 : 0))
    }

    private calculateEconomicImpact(): number {
        const totalInvestment = this.supercomputers
            .reduce((sum, sc) => sum + (sc.powerCapacity * 2000000), 0) // Rough cost estimate

        // Scale to percentage based on global AI investment
        return Math.min(100, totalInvestment / 1e12 * 100)
    }

    private identifyCriticalResources(): string[] {
        const resources = []

        // Check hardware dependencies
        const nvidiaDependent = this.hardware.filter(h => h.manufacturer === "NVIDIA").length
        if (nvidiaDependent > 0) resources.push("NVIDIA GPUs")

        // Check power requirements
        const totalPower = this.supercomputers.reduce((sum, sc) => sum + sc.powerCapacity, 0)
        if (totalPower > 10000) resources.push("Electrical Grid Capacity")

        // Check advanced semiconductors
        const advancedChips = this.hardware.filter(h => h.processSize <= 5).length
        if (advancedChips > 0) resources.push("Advanced Semiconductors")

        return resources
    }

    // Get data for visualizations
    getVisualizationData() {
        return {
            supercomputers: this.supercomputers,
            hardware: this.hardware,
            models: this.models,
            trends: {
                powerGrowth: this.calculatePowerGrowthTrend(),
                performanceGrowth: this.calculatePerformanceGrowthTrend(),
                geographicDistribution: this.getCountryPowerDistribution()
            }
        }
    }

    private calculatePowerGrowthTrend(): Array<{ year: number, power: number }> {
        // Generate trend data based on planned supercomputers
        const currentYear = new Date().getFullYear()
        const trend = []

        for (let year = currentYear; year <= currentYear + 5; year++) {
            const yearPower = this.supercomputers
                .filter(sc => parseInt(sc.operationalDate) <= year)
                .reduce((sum, sc) => sum + sc.powerCapacity, 0)

            trend.push({ year, power: yearPower })
        }

        return trend
    }

    private calculatePerformanceGrowthTrend(): Array<{ year: number, performance: number }> {
        // Generate performance trend based on hardware releases
        const trend = []
        const currentYear = new Date().getFullYear()

        for (let year = currentYear - 2; year <= currentYear + 3; year++) {
            const yearPerformance = this.hardware
                .filter(h => new Date(h.releaseDate).getFullYear() <= year)
                .reduce((max, h) => Math.max(max, h.performance), 0)

            trend.push({ year, performance: yearPerformance })
        }

        return trend
    }

    // Generate data-driven story scenarios
    generateDataDrivenScenario(userScenario: string): {
        title: string
        content: string
        choices: Array<{
            description: string
            consequenceText: string
            impact: {
                compute: number
                unemployment: number
                geopolitics: string
            }
        }>
        worldState: {
            t: number
            compute: number
            unemployment: number
            geopolitics: string
        }
    } {
        const variables = this.generateScenarioVariables(userScenario)

        // Generate scenario based on real data trends
        if (userScenario.toLowerCase().includes('supercomputer') || userScenario.toLowerCase().includes('compute')) {
            return this.generateSupercomputerScenario(variables)
        } else if (userScenario.toLowerCase().includes('chip') || userScenario.toLowerCase().includes('hardware')) {
            return this.generateHardwareScenario(variables)
        } else {
            return this.generateModelScenario(variables)
        }
    }

    private generateSupercomputerScenario(variables: any) {
        const topCountry = variables.technologicalLeadership[0] || "United States"

        return {
            title: "The Exascale AI Arms Race",
            content: `You oversee global AI policy as ${topCountry} announces a ${variables.powerDemand * 50}MW AI supercomputer cluster. Based on current trends from our database of 500+ supercomputers, this represents a ${variables.computeGrowth}% increase in global AI compute capacity. The facility will consume enough power for ${Math.floor(variables.powerDemand * 10000)} homes, raising concerns about energy infrastructure and geopolitical balance. Other nations are scrambling to respond to this computational advantage.`,
            choices: [
                {
                    description: "Launch international AI compute sharing initiative",
                    consequenceText: "You propose democratizing access to AI supercomputing resources...",
                    impact: {
                        compute: Math.floor(variables.computeGrowth * 0.3),
                        unemployment: -Math.floor(variables.economicImpact * 0.2),
                        geopolitics: "Global AI compute cooperation"
                    }
                },
                {
                    description: "Accelerate national AI infrastructure development",
                    consequenceText: "You decide to match the computational arms race...",
                    impact: {
                        compute: Math.floor(variables.computeGrowth * 0.8),
                        unemployment: Math.floor(variables.economicImpact * 0.1),
                        geopolitics: "AI infrastructure competition intensifies"
                    }
                },
                {
                    description: "Implement AI compute governance framework",
                    consequenceText: "You focus on regulating AI supercomputer development...",
                    impact: {
                        compute: Math.floor(variables.computeGrowth * 0.1),
                        unemployment: -Math.floor(variables.economicImpact * 0.3),
                        geopolitics: "International AI compute regulations"
                    }
                }
            ],
            worldState: {
                t: 6,
                compute: Math.floor(variables.computeGrowth * 0.5),
                unemployment: Math.floor(variables.economicImpact * 0.1),
                geopolitics: `${topCountry} AI compute leadership established`
            }
        }
    }

    private generateHardwareScenario(variables: any) {
        return {
            title: "The Semiconductor Bottleneck Crisis",
            content: `Critical shortages emerge in advanced AI chips as demand from ${variables.technologicalLeadership.join(', ')} supercomputer projects exceeds supply. Our hardware database shows ${variables.criticalResources.length} critical dependencies, with NVIDIA H200s and similar accelerators becoming strategic resources. The ${variables.geopoliticalTension}% increase in geopolitical tensions around semiconductor supply chains threatens global AI development timelines.`,
            choices: [
                {
                    description: "Diversify AI chip supply chains globally",
                    consequenceText: "You work to reduce dependency on single suppliers...",
                    impact: {
                        compute: -Math.floor(variables.computeGrowth * 0.2),
                        unemployment: -Math.floor(variables.economicImpact * 0.4),
                        geopolitics: "Diversified AI hardware ecosystem"
                    }
                },
                {
                    description: "Secure strategic AI chip reserves",
                    consequenceText: "You prioritize national AI hardware stockpiling...",
                    impact: {
                        compute: Math.floor(variables.computeGrowth * 0.4),
                        unemployment: Math.floor(variables.economicImpact * 0.2),
                        geopolitics: "AI chip nationalism emerges"
                    }
                },
                {
                    description: "Invest in alternative AI architectures",
                    consequenceText: "You bet on neuromorphic and quantum-AI hybrid systems...",
                    impact: {
                        compute: Math.floor(variables.computeGrowth * 0.6),
                        unemployment: -Math.floor(variables.economicImpact * 0.1),
                        geopolitics: "Next-generation AI architecture race"
                    }
                }
            ],
            worldState: {
                t: 4,
                compute: Math.floor(variables.computeGrowth * 0.3),
                unemployment: Math.floor(variables.economicImpact * 0.2),
                geopolitics: "AI hardware supply chain crisis"
            }
        }
    }

    private generateModelScenario(variables: any) {
        return {
            title: "The Training Compute Explosion",
            content: `Frontier AI models now require ${variables.computeGrowth * 1e24} FLOPs of training compute, representing a 10x increase from previous generations. Our database of 2400+ models shows this trend accelerating, with organizations like Anthropic, OpenAI, and Google pushing the boundaries of what's computationally feasible. The energy requirements alone could power ${Math.floor(variables.powerDemand * 100)} cities, raising questions about sustainable AI development.`,
            choices: [
                {
                    description: "Establish AI training compute efficiency standards",
                    consequenceText: "You mandate efficiency requirements for large model training...",
                    impact: {
                        compute: -Math.floor(variables.computeGrowth * 0.3),
                        unemployment: -Math.floor(variables.economicImpact * 0.2),
                        geopolitics: "Global AI efficiency standards"
                    }
                },
                {
                    description: "Create public AI training infrastructure",
                    consequenceText: "You democratize access to massive compute resources...",
                    impact: {
                        compute: Math.floor(variables.computeGrowth * 0.7),
                        unemployment: -Math.floor(variables.economicImpact * 0.4),
                        geopolitics: "Public AI infrastructure movement"
                    }
                },
                {
                    description: "Implement AI model size limitations",
                    consequenceText: "You cap the computational resources for AI training...",
                    impact: {
                        compute: -Math.floor(variables.computeGrowth * 0.5),
                        unemployment: Math.floor(variables.economicImpact * 0.1),
                        geopolitics: "AI development constraints imposed"
                    }
                }
            ],
            worldState: {
                t: 8,
                compute: Math.floor(variables.computeGrowth * 0.4),
                unemployment: Math.floor(variables.economicImpact * 0.15),
                geopolitics: "AI training compute arms race"
            }
        }
    }
}

// Singleton instance
export const aiDataProcessor = new AIDataProcessor()