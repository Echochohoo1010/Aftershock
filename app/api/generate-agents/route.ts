import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
    try {
        const { policyContext, numAgents, agentTypes } = await request.json()

        // AI-generated agent profiles based on policy context
        const agents = []

        // Analyze policy context to determine agent distribution
        const policyType = analyzePolicyType(policyContext)
        const distribution = getAgentDistribution(policyType)

        for (let i = 0; i < numAgents; i++) {
            const agentProfile = generateAgentProfile(i, policyContext, policyType, distribution, numAgents)
            agents.push(agentProfile)
        }

        return NextResponse.json(agents)
    } catch (error) {
        console.error('Error generating agents:', error)
        return NextResponse.json({ error: 'Failed to generate agents' }, { status: 500 })
    }
}

function analyzePolicyType(context: string): string {
    const lowerContext = context.toLowerCase()

    if (lowerContext.includes('tax') || lowerContext.includes('fiscal')) {
        return 'fiscal'
    } else if (lowerContext.includes('health') || lowerContext.includes('medical')) {
        return 'healthcare'
    } else if (lowerContext.includes('education') || lowerContext.includes('school')) {
        return 'education'
    } else if (lowerContext.includes('environment') || lowerContext.includes('climate') || lowerContext.includes('carbon')) {
        return 'environmental'
    } else if (lowerContext.includes('technology') || lowerContext.includes('digital')) {
        return 'technology'
    } else {
        return 'general'
    }
}

function getAgentDistribution(policyType: string) {
    const distributions = {
        fiscal: {
            innovator: 0.03, // 3% - Financial experts, economists
            adopter: 0.12,   // 12% - Business leaders, early implementers
            skeptic: 0.25,   // 25% - Conservative investors, traditionalists
            influencer: 0.08, // 8% - Policy makers, thought leaders
            observer: 0.52   // 52% - General population
        },
        healthcare: {
            innovator: 0.05, // 5% - Medical researchers, progressive doctors
            adopter: 0.15,   // 15% - Healthcare administrators, nurses
            skeptic: 0.20,   // 20% - Traditional practitioners, concerned patients
            influencer: 0.10, // 10% - Medical associations, patient advocates
            observer: 0.50   // 50% - General patients, families
        },
        education: {
            innovator: 0.08, // 8% - Educational researchers, progressive teachers
            adopter: 0.18,   // 18% - School administrators, young teachers
            skeptic: 0.15,   // 15% - Veteran teachers, concerned parents
            influencer: 0.12, // 12% - Education leaders, parent groups
            observer: 0.47   // 47% - Students, general parents
        },
        environmental: {
            innovator: 0.10, // 10% - Environmental scientists, activists
            adopter: 0.20,   // 20% - Green businesses, conscious consumers
            skeptic: 0.18,   // 18% - Traditional industries, skeptics
            influencer: 0.07, // 7% - Environmental organizations, celebrities
            observer: 0.45   // 45% - General public
        },
        technology: {
            innovator: 0.12, // 12% - Tech entrepreneurs, early adopters
            adopter: 0.25,   // 25% - Tech workers, digital natives
            skeptic: 0.10,   // 10% - Privacy advocates, traditionalists
            influencer: 0.08, // 8% - Tech leaders, influencers
            observer: 0.45   // 45% - General users
        },
        general: {
            innovator: 0.05,
            adopter: 0.15,
            skeptic: 0.20,
            influencer: 0.10,
            observer: 0.50
        }
    }

    return distributions[policyType as keyof typeof distributions] || distributions.general
}

function generateAgentProfile(id: number, context: string, policyType: string, distribution: any, totalAgents: number) {
    // Determine agent type based on distribution
    const rand = Math.random()
    let cumulativeProb = 0
    let agentType = 'Observer'

    for (const [type, prob] of Object.entries(distribution)) {
        cumulativeProb += prob as number
        if (rand <= cumulativeProb) {
            agentType = type.charAt(0).toUpperCase() + type.slice(1)
            break
        }
    }

    // Generate contextual properties based on policy type and agent type
    const properties = generateContextualProperties(agentType, policyType, context)

    return {
        id,
        initialType: agentType,
        adoptionThreshold: properties.adoptionThreshold,
        influence: properties.influence,
        resistance: properties.resistance,
        networkConnections: properties.networkConnections,
        activity: properties.activity,
        name: properties.name,
        description: properties.description,
        concerns: properties.concerns,
        motivations: properties.motivations
    }
}

function generateContextualProperties(agentType: string, policyType: string, context: string) {
    const baseProperties = {
        Innovator: {
            adoptionThreshold: 0.05 + Math.random() * 0.1,
            influence: 4 + Math.random(),
            resistance: 0.1 + Math.random() * 0.1,
            networkConnections: 8 + Math.floor(Math.random() * 5),
            activity: 4 + Math.random()
        },
        Adopter: {
            adoptionThreshold: 0.2 + Math.random() * 0.2,
            influence: 2 + Math.random() * 2,
            resistance: 0.2 + Math.random() * 0.2,
            networkConnections: 5 + Math.floor(Math.random() * 4),
            activity: 3 + Math.random()
        },
        Skeptic: {
            adoptionThreshold: 0.7 + Math.random() * 0.2,
            influence: 1 + Math.random(),
            resistance: 0.7 + Math.random() * 0.2,
            networkConnections: 3 + Math.floor(Math.random() * 3),
            activity: 1 + Math.random() * 2
        },
        Influencer: {
            adoptionThreshold: 0.3 + Math.random() * 0.2,
            influence: 3 + Math.random() * 2,
            resistance: 0.3 + Math.random() * 0.2,
            networkConnections: 10 + Math.floor(Math.random() * 8),
            activity: 4 + Math.random()
        },
        Observer: {
            adoptionThreshold: 0.4 + Math.random() * 0.3,
            influence: 1 + Math.random(),
            resistance: 0.4 + Math.random() * 0.3,
            networkConnections: 2 + Math.floor(Math.random() * 4),
            activity: 1 + Math.random() * 2
        }
    }

    const base = baseProperties[agentType as keyof typeof baseProperties] || baseProperties.Observer

    // Generate contextual names and descriptions
    const contextualData = generateContextualData(agentType, policyType)

    return {
        ...base,
        name: contextualData.name,
        description: contextualData.description,
        concerns: contextualData.concerns,
        motivations: contextualData.motivations
    }
}

function generateContextualData(agentType: string, policyType: string) {
    const profiles = {
        fiscal: {
            Innovator: {
                names: ['Financial Analyst', 'Economic Researcher', 'Policy Economist', 'Tax Expert'],
                descriptions: ['Analyzes fiscal impacts', 'Studies economic trends', 'Develops policy models'],
                concerns: ['Economic efficiency', 'Market stability', 'Long-term growth'],
                motivations: ['Data-driven decisions', 'Economic optimization', 'Innovation']
            },
            Adopter: {
                names: ['Business Owner', 'Accountant', 'Financial Advisor', 'Corporate Manager'],
                descriptions: ['Implements financial strategies', 'Manages business finances', 'Advises clients'],
                concerns: ['Business impact', 'Compliance costs', 'Competitive advantage'],
                motivations: ['Business growth', 'Efficiency gains', 'Competitive edge']
            },
            Skeptic: {
                names: ['Conservative Investor', 'Traditional Banker', 'Retiree', 'Small Business Owner'],
                descriptions: ['Prefers stable investments', 'Values traditional approaches', 'Concerned about changes'],
                concerns: ['Financial security', 'Increased costs', 'Uncertainty'],
                motivations: ['Stability', 'Risk avoidance', 'Proven methods']
            }
        },
        healthcare: {
            Innovator: {
                names: ['Medical Researcher', 'Healthcare Technologist', 'Progressive Doctor', 'Health Policy Expert'],
                descriptions: ['Develops new treatments', 'Implements health tech', 'Studies medical innovations'],
                concerns: ['Patient outcomes', 'Medical advancement', 'Healthcare access'],
                motivations: ['Improving care', 'Medical breakthroughs', 'Patient welfare']
            },
            Adopter: {
                names: ['Nurse Practitioner', 'Hospital Administrator', 'Healthcare Worker', 'Medical Student'],
                descriptions: ['Provides patient care', 'Manages healthcare operations', 'Learning medical practices'],
                concerns: ['Patient care quality', 'Workflow efficiency', 'Professional development'],
                motivations: ['Better patient outcomes', 'Career advancement', 'Skill improvement']
            },
            Skeptic: {
                names: ['Veteran Doctor', 'Concerned Patient', 'Healthcare Traditionalist', 'Medical Conservative'],
                descriptions: ['Experienced in traditional methods', 'Worried about changes', 'Prefers established practices'],
                concerns: ['Patient safety', 'Unproven methods', 'Cost increases'],
                motivations: ['Patient safety', 'Proven treatments', 'Cost control']
            }
        }
        // Add more policy types as needed
    }

    const policyProfiles = profiles[policyType as keyof typeof profiles]
    if (!policyProfiles) {
        // Default generic profiles
        return {
            name: `${agentType} Agent`,
            description: `A ${agentType.toLowerCase()} in the system`,
            concerns: ['Policy impact', 'Personal effects', 'Community welfare'],
            motivations: ['Positive outcomes', 'Personal benefit', 'Social good']
        }
    }

    const typeProfile = policyProfiles[agentType as keyof typeof policyProfiles]
    if (!typeProfile) {
        return {
            name: `${agentType} Agent`,
            description: `A ${agentType.toLowerCase()} in the system`,
            concerns: ['Policy impact'],
            motivations: ['Positive outcomes']
        }
    }

    return {
        name: typeProfile.names[Math.floor(Math.random() * typeProfile.names.length)],
        description: typeProfile.descriptions[Math.floor(Math.random() * typeProfile.descriptions.length)],
        concerns: typeProfile.concerns,
        motivations: typeProfile.motivations
    }
}