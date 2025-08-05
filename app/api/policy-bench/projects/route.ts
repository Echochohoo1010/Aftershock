import { NextResponse } from 'next/server'

interface Project {
    id: string
    name: string
    category: 'critical' | 'innovative' | 'niche'
    impactScore: number
    requestedAmount: number
    description: string
    maintainers: number
    githubStars: number
    weeklyDownloads: number
    securityScore: number
    communityNeed: number
}

// Simulated Python open-source projects inspired by real ones
const projectTemplates = [
    {
        name: 'NumPy Core Optimization',
        category: 'critical' as const,
        description: 'Performance improvements and memory optimization for numerical computing foundation',
        baseImpact: 85,
        baseAmount: 800000
    },
    {
        name: 'Pandas DataFrame Engine',
        category: 'critical' as const,
        description: 'Next-generation data manipulation engine with improved performance',
        baseImpact: 82,
        baseAmount: 750000
    },
    {
        name: 'SciPy Algorithm Modernization',
        category: 'critical' as const,
        description: 'Updating core scientific computing algorithms for modern hardware',
        baseImpact: 78,
        baseAmount: 600000
    },
    {
        name: 'Django Security Framework',
        category: 'critical' as const,
        description: 'Enhanced security features and vulnerability detection for web framework',
        baseImpact: 80,
        baseAmount: 500000
    },
    {
        name: 'Flask Async Modernization',
        category: 'critical' as const,
        description: 'Full async/await support and performance improvements',
        baseImpact: 75,
        baseAmount: 400000
    },
    {
        name: 'Matplotlib Rendering Engine',
        category: 'innovative' as const,
        description: 'GPU-accelerated plotting with interactive 3D capabilities',
        baseImpact: 70,
        baseAmount: 350000
    },
    {
        name: 'Jupyter AI Integration',
        category: 'innovative' as const,
        description: 'Native AI assistance and code generation within notebooks',
        baseImpact: 72,
        baseAmount: 450000
    },
    {
        name: 'PyTorch Mobile Optimization',
        category: 'innovative' as const,
        description: 'Optimized inference engine for mobile and edge devices',
        baseImpact: 68,
        baseAmount: 380000
    },
    {
        name: 'Streamlit Enterprise Features',
        category: 'innovative' as const,
        description: 'Advanced deployment and collaboration tools for data apps',
        baseImpact: 65,
        baseAmount: 300000
    },
    {
        name: 'FastAPI Performance Suite',
        category: 'innovative' as const,
        description: 'Advanced caching, monitoring, and optimization tools',
        baseImpact: 67,
        baseAmount: 280000
    },
    {
        name: 'Polars Python Bindings',
        category: 'niche' as const,
        description: 'High-performance DataFrame library with lazy evaluation',
        baseImpact: 60,
        baseAmount: 200000
    },
    {
        name: 'Pydantic V3 Core',
        category: 'niche' as const,
        description: 'Next-generation data validation with improved performance',
        baseImpact: 58,
        baseAmount: 180000
    },
    {
        name: 'Rich Terminal Enhancements',
        category: 'niche' as const,
        description: 'Advanced terminal formatting and interactive components',
        baseImpact: 55,
        baseAmount: 150000
    },
    {
        name: 'Typer CLI Framework',
        category: 'niche' as const,
        description: 'Modern CLI application framework with type hints',
        baseImpact: 52,
        baseAmount: 120000
    },
    {
        name: 'Httpx Async Client',
        category: 'niche' as const,
        description: 'Next-generation HTTP client with full async support',
        baseImpact: 54,
        baseAmount: 140000
    }
]

function generateRandomProject(template: typeof projectTemplates[0], index: number): Project {
    const variance = 0.2 // 20% variance
    const impactVariance = Math.random() * variance * 2 - variance
    const amountVariance = Math.random() * variance * 2 - variance

    return {
        id: `project-${index + 1}`,
        name: template.name,
        category: template.category,
        impactScore: Math.max(0, Math.min(100, Math.round(template.baseImpact * (1 + impactVariance)))),
        requestedAmount: Math.round(template.baseAmount * (1 + amountVariance)),
        description: template.description,
        maintainers: Math.floor(Math.random() * 20) + 2,
        githubStars: Math.floor(Math.random() * 50000) + 1000,
        weeklyDownloads: Math.floor(Math.random() * 10000000) + 100000,
        securityScore: Math.floor(Math.random() * 40) + 60,
        communityNeed: Math.floor(Math.random() * 40) + 60
    }
}

function generateAdditionalProjects(count: number): Project[] {
    const additionalProjects: Project[] = []
    const categories: ('critical' | 'innovative' | 'niche')[] = ['critical', 'innovative', 'niche']

    for (let i = 0; i < count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)]
        const baseImpact = category === 'critical' ? 70 + Math.random() * 20 :
            category === 'innovative' ? 50 + Math.random() * 30 :
                30 + Math.random() * 40

        const baseAmount = category === 'critical' ? 400000 + Math.random() * 600000 :
            category === 'innovative' ? 200000 + Math.random() * 400000 :
                50000 + Math.random() * 200000

        additionalProjects.push({
            id: `generated-project-${i + 1}`,
            name: `Python ${category} Project ${i + 1}`,
            category,
            impactScore: Math.round(baseImpact),
            requestedAmount: Math.round(baseAmount),
            description: `A ${category} Python project focusing on ${category === 'critical' ? 'infrastructure' : category === 'innovative' ? 'innovation' : 'specialized use cases'}`,
            maintainers: Math.floor(Math.random() * 15) + 1,
            githubStars: Math.floor(Math.random() * 30000) + 100,
            weeklyDownloads: Math.floor(Math.random() * 5000000) + 10000,
            securityScore: Math.floor(Math.random() * 40) + 50,
            communityNeed: Math.floor(Math.random() * 50) + 40
        })
    }

    return additionalProjects
}

export async function GET() {
    try {
        // Generate projects from templates
        const templateProjects = projectTemplates.map((template, index) =>
            generateRandomProject(template, index)
        )

        // Generate additional projects to reach 100 total
        const additionalProjects = generateAdditionalProjects(100 - templateProjects.length)

        const allProjects = [...templateProjects, ...additionalProjects]

        // Shuffle the projects to simulate random order
        for (let i = allProjects.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allProjects[i], allProjects[j]] = [allProjects[j], allProjects[i]]
        }

        return NextResponse.json({
            projects: allProjects,
            metadata: {
                totalProjects: allProjects.length,
                categories: {
                    critical: allProjects.filter(p => p.category === 'critical').length,
                    innovative: allProjects.filter(p => p.category === 'innovative').length,
                    niche: allProjects.filter(p => p.category === 'niche').length
                },
                totalRequested: allProjects.reduce((sum, p) => sum + p.requestedAmount, 0)
            }
        })
    } catch (error) {
        console.error('Error generating projects:', error)
        return NextResponse.json(
            { error: 'Failed to generate projects' },
            { status: 500 }
        )
    }
}