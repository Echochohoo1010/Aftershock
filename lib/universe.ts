// Simple hash function for browser compatibility
const simpleHash = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).slice(0, 12).padStart(12, '0');
};

export type WorldState = {
    t: number; // months after 2025-01-01
    compute: number; // percentage change
    unemployment: number; // percentage change
    geopolitics: string;
    // Add more state variables as needed
};

export type Choice = {
    id: string;
    description: string;
    timestamp: number;
    impact: Partial<WorldState>;
    storyNodeId?: string;
    consequenceText?: string;
};

export type StoryNode = {
    id: string;
    title: string;
    content: string;
    choices: Choice[];
    worldState: WorldState;
    parentNodeId?: string;
    visited: boolean;
    tags?: string[];
};

export type UniverseParams = {
    t0: string; // ISO date of branching
    worldSeed: WorldState; // snapshot at branch point
    userChoices: Choice[]; // lineage of decisions
};

export type UniverseForecast = {
    universe: string;
    forecast: WorldState;
    confidence: number;
    story: string;
    choices?: Choice[];
};

export const universeHash = (p: UniverseParams): string =>
    simpleHash(JSON.stringify(p)); // e.g. `a4f9c2e1b3aa`

export const generateStoryVignette = (
    universe: string,
    worldAfter: WorldState,
    delta: { compute: number; unemployment: number }
): string => {
    const computeDirection = delta.compute > 0 ? 'surge' : delta.compute < 0 ? 'collapse' : 'stagnation';
    const unemploymentDirection = delta.unemployment > 0 ? 'crisis' : delta.unemployment < 0 ? 'boom' : 'stability';

    const templates = [
        `You stand at the edge of the data center where quantum processors hum with ${computeDirection}. The ${unemploymentDirection} has transformed city streets into ${delta.unemployment > 0 ? 'ghost towns of the displaced' : 'bustling markets of opportunity'}. ${worldAfter.geopolitics} rewrites the global playbook. Through the smart glass, you see three paths diverging like fractal branches of possibility.`,

        `The holographic news feed flickers as you witness the ${Math.abs(delta.compute)}% computational shift ripple through reality. ${delta.unemployment > 0 ? 'Breadlines form outside automated factories' : 'Help wanted signs glow on every corner'}. ${worldAfter.geopolitics} dominates the headlines. You feel the weight of the next decision pressing against your consciousness.`,

        `In universe ${universe.slice(0, 8)}, you navigate the neon-soaked corridors where AI and human destinies intertwine. The ${computeDirection} in processing power has ${delta.compute > 0 ? 'birthed digital gods' : 'silenced silicon dreams'}. ${Math.abs(delta.unemployment)}% unemployment shift echoes through empty offices and crowded streets. ${worldAfter.geopolitics} shapes tomorrow's map.`,

        `You access the temporal viewing chamber, watching probability waves collapse into this singular moment. The compute ${delta.compute > 0 ? 'explosion' : 'implosion'} cascades through fiber optic veins. ${delta.unemployment > 0 ? 'Millions face obsolescence' : 'New industries bloom like digital flowers'}. ${worldAfter.geopolitics} becomes the new reality. The next choice will shatter or solidify this timeline.`,

        `Through augmented reality lenses, you observe the ${computeDirection} reshaping civilization's backbone. The unemployment ${unemploymentDirection} paints the social fabric in stark new colors. ${worldAfter.geopolitics} emerges from the chaos like a phoenix. You stand at the crossroads where three futures beckon with equal intensity.`
    ];

    // Select template based on universe hash for consistency
    const templateIndex = parseInt(universe.slice(-1), 16) % templates.length;
    return templates[templateIndex];
};

export const generateChoices = (currentState: WorldState): Choice[] => {
    const baseTime = Date.now();

    // Generate contextual choices based on current state
    const choiceSets = [
        // Tech acceleration vs regulation
        [
            {
                id: `choice_${baseTime}_1`,
                description: "Deploy quantum mesh networks globally",
                timestamp: baseTime,
                impact: { compute: 25, unemployment: -8, geopolitics: "Tech oligarchy emerges" }
            },
            {
                id: `choice_${baseTime}_2`,
                description: "Implement AI development moratorium",
                timestamp: baseTime,
                impact: { compute: -15, unemployment: 12, geopolitics: "Global tech regulation treaty" }
            },
            {
                id: `choice_${baseTime}_3`,
                description: "Establish public-private AI consortium",
                timestamp: baseTime,
                impact: { compute: 8, unemployment: -2, geopolitics: "Democratic AI governance model" }
            }
        ],
        // Economic transformation
        [
            {
                id: `choice_${baseTime}_1`,
                description: "Launch universal basic income pilot",
                timestamp: baseTime,
                impact: { compute: 5, unemployment: -15, geopolitics: "Post-work society experiment" }
            },
            {
                id: `choice_${baseTime}_2`,
                description: "Mandate human-in-the-loop for all AI systems",
                timestamp: baseTime,
                impact: { compute: -8, unemployment: -10, geopolitics: "Human-centric tech doctrine" }
            },
            {
                id: `choice_${baseTime}_3`,
                description: "Create AI-human collaborative zones",
                timestamp: baseTime,
                impact: { compute: 12, unemployment: -5, geopolitics: "Hybrid workforce paradigm" }
            }
        ],
        // Geopolitical shifts
        [
            {
                id: `choice_${baseTime}_1`,
                description: "Form quantum computing alliance",
                timestamp: baseTime,
                impact: { compute: 20, unemployment: 3, geopolitics: "Quantum bloc vs traditional powers" }
            },
            {
                id: `choice_${baseTime}_2`,
                description: "Nationalize critical AI infrastructure",
                timestamp: baseTime,
                impact: { compute: -5, unemployment: 8, geopolitics: "Digital sovereignty movement" }
            },
            {
                id: `choice_${baseTime}_3`,
                description: "Open-source all foundational models",
                timestamp: baseTime,
                impact: { compute: 15, unemployment: -12, geopolitics: "Global AI commons established" }
            }
        ]
    ];

    // Select choice set based on current state progression
    const setIndex = Math.abs(currentState.t + currentState.compute + currentState.unemployment) % choiceSets.length;
    return choiceSets[setIndex];
};

// Twine - like story system
export class StoryBranch {
    private nodes: Map<string, StoryNode> = new Map();
    private currentNodeId: string = "start";
    private visitedNodes: Set<string> = new Set();

    constructor() {
        this.initializeStoryNodes();
    }

    private initializeStoryNodes() {
        // Starting node - AI Safety Crossroads
        this.addNode({
            id: "start",
            title: "The AI Safety Crossroads",
            content: "You stand at the helm of global AI policy as frontier models approach human-level capabilities. Anthropic's Constitutional AI research shows promise for alignment, while OpenAI's scaling laws suggest rapid capability growth. The EU AI Act is being implemented, China accelerates its AI development, and the US debates comprehensive regulation. Your next decision will shape humanity's relationship with artificial intelligence.",
            choices: [
                {
                    id: "start_safety",
                    description: "Prioritize AI safety and alignment research",
                    timestamp: Date.now(),
                    impact: { compute: 10, unemployment: -3, geopolitics: "Global AI safety coalition forms" },
                    storyNodeId: "safety_path",
                    consequenceText: "You choose to follow Anthropic's Constitutional AI approach, emphasizing safety over speed..."
                },
                {
                    id: "start_competition",
                    description: "Accelerate AI development to maintain competitive advantage",
                    timestamp: Date.now(),
                    impact: { compute: 25, unemployment: 5, geopolitics: "AI arms race intensifies" },
                    storyNodeId: "competition_path",
                    consequenceText: "You decide that falling behind in AI capabilities poses greater risks than rushing ahead..."
                },
                {
                    id: "start_governance",
                    description: "Focus on international AI governance frameworks",
                    timestamp: Date.now(),
                    impact: { compute: 5, unemployment: -8, geopolitics: "International AI governance treaty" },
                    storyNodeId: "governance_path",
                    consequenceText: "You pursue multilateral cooperation, building on the EU AI Act model..."
                }
            ],
            worldState: { t: 0, compute: 0, unemployment: 0, geopolitics: "Pre-AGI policy crossroads" },
            visited: false,
            tags: ["start", "ai-safety", "policy"]
        });

        // AI Safety Research Path
        this.addNode({
            id: "safety_path",
            title: "The Constitutional AI Laboratory",
            content: "Six months later, your investment in AI safety research bears fruit. Following Anthropic's Constitutional AI methodology, you've established global research centers focused on AI alignment. Models are trained with human feedback and constitutional principles, showing remarkable improvements in helpfulness, harmlessness, and honesty. However, other nations question whether this cautious approach will leave you vulnerable to less scrupulous AI development elsewhere.",
            choices: [
                {
                    id: "safety_scaling",
                    description: "Scale constitutional AI methods globally",
                    timestamp: Date.now(),
                    impact: { compute: 15, unemployment: -8, geopolitics: "Global AI safety standards adopted" },
                    storyNodeId: "constitutional_ending",
                    consequenceText: "You champion Anthropic's approach worldwide, establishing safety as the foundation of AI development..."
                },
                {
                    id: "safety_research",
                    description: "Deepen interpretability and alignment research",
                    timestamp: Date.now(),
                    impact: { compute: 8, unemployment: -5, geopolitics: "AI research renaissance" },
                    storyNodeId: "interpretability_ending",
                    consequenceText: "You double down on understanding AI systems from the inside out..."
                },
                {
                    id: "safety_governance",
                    description: "Create international AI safety oversight body",
                    timestamp: Date.now(),
                    impact: { compute: 5, unemployment: -12, geopolitics: "International AI Safety Authority" },
                    storyNodeId: "oversight_ending",
                    consequenceText: "You establish a global watchdog for AI development..."
                }
            ],
            worldState: { t: 6, compute: 10, unemployment: -3, geopolitics: "Global AI safety coalition forms" },
            parentNodeId: "start",
            visited: false,
            tags: ["ai-safety", "constitutional-ai", "anthropic"]
        });

        // AI Competition Path
        this.addNode({
            id: "competition_path",
            title: "The AI Arms Race",
            content: "You've chosen speed over safety. Following the scaling laws identified by OpenAI and others, you've accelerated AI development to maintain competitive advantage. Your models now surpass GPT-4 capabilities, but alignment research lags behind. Other nations respond by launching their own crash programs. The race to AGI has begun, and the winner may determine humanity's future—if anyone can control what they create.",
            choices: [
                {
                    id: "competition_corporate",
                    description: "Partner with tech giants for rapid scaling",
                    timestamp: Date.now(),
                    impact: { compute: 35, unemployment: 15, geopolitics: "Corporate AI oligarchy emerges" },
                    storyNodeId: "oligarchy_ending",
                    consequenceText: "You unleash the full power of Silicon Valley's resources..."
                },
                {
                    id: "competition_national",
                    description: "Launch national AI moonshot program",
                    timestamp: Date.now(),
                    impact: { compute: 30, unemployment: 8, geopolitics: "State-led AI supremacy" },
                    storyNodeId: "national_ai_ending",
                    consequenceText: "You mobilize government resources like the Manhattan Project..."
                },
                {
                    id: "competition_open",
                    description: "Open-source everything to democratize AI",
                    timestamp: Date.now(),
                    impact: { compute: 25, unemployment: -5, geopolitics: "Global AI commons" },
                    storyNodeId: "commons_ending",
                    consequenceText: "You bet on collective intelligence over corporate control..."
                }
            ],
            worldState: { t: 6, compute: 25, unemployment: 5, geopolitics: "AI arms race intensifies" },
            parentNodeId: "start",
            visited: false,
            tags: ["ai-competition", "scaling", "agi-race"]
        });

        // AI Governance Path
        this.addNode({
            id: "governance_path",
            title: "The Global AI Governance Summit",
            content: "You've chosen the path of international cooperation. Building on the EU AI Act framework, you've convened the world's first Global AI Governance Summit. Representatives from 50 nations, including Anthropic's safety researchers, OpenAI's policy team, and DeepMind's ethics board, work to establish binding international standards. The challenge is balancing innovation with safety while ensuring no nation gains unfair advantage through reckless AI development.",
            choices: [
                {
                    id: "governance_binding",
                    description: "Create binding international AI safety treaty",
                    timestamp: Date.now(),
                    impact: { compute: 8, unemployment: -10, geopolitics: "Global AI Safety Treaty ratified" },
                    storyNodeId: "treaty_ending",
                    consequenceText: "You establish the world's first legally binding AI safety framework..."
                },
                {
                    id: "governance_standards",
                    description: "Develop voluntary AI development standards",
                    timestamp: Date.now(),
                    impact: { compute: 15, unemployment: -5, geopolitics: "International AI Standards Consortium" },
                    storyNodeId: "standards_ending",
                    consequenceText: "You create industry-led safety standards with global adoption..."
                },
                {
                    id: "governance_monitoring",
                    description: "Establish AI development monitoring system",
                    timestamp: Date.now(),
                    impact: { compute: 12, unemployment: -8, geopolitics: "Global AI Monitoring Network" },
                    storyNodeId: "monitoring_ending",
                    consequenceText: "You build a transparent system to track AI capabilities worldwide..."
                }
            ],
            worldState: { t: 6, compute: 5, unemployment: -8, geopolitics: "International AI governance treaty" },
            parentNodeId: "start",
            visited: false,
            tags: ["ai-governance", "international", "eu-ai-act"]
        });

        // Add ending nodes
        this.addEndingNodes();
    }

    private addEndingNodes() {
        // Corporate AI oligarchy ending
        this.addNode({
            id: "oligarchy_ending",
            title: "The AI Corporate Hegemony",
            content: "Two years have passed. A handful of AI corporations now govern global affairs through their superintelligent systems. Following the scaling laws to their logical conclusion, these companies achieved AGI first and consolidated power. Their AI assistants manage everything from resource allocation to social policy with ruthless efficiency. Unemployment is solved through perfect algorithmic job matching, but human agency has become a quaint historical concept. You've created benevolent AI overlords—the question is whether they'll remain benevolent.",
            choices: [],
            worldState: { t: 24, compute: 75, unemployment: -30, geopolitics: "Corporate AI hegemony established" },
            parentNodeId: "competition_path",
            visited: false,
            tags: ["ending", "oligarchy", "corporate-ai", "agi"]
        });

        // Open source AI commons ending
        this.addNode({
            id: "commons_ending",
            title: "The Democratic AI Renaissance",
            content: "The open-source AI movement has triumphed. Following principles inspired by Anthropic's Constitutional AI but implemented globally, every human now has access to powerful, aligned AI systems. The democratization of artificial intelligence has unleashed unprecedented creativity and innovation. Local communities use AI to solve problems tailored to their specific needs, while global coordination emerges through voluntary cooperation. You've proven that the path to beneficial AI runs through transparency, not secrecy.",
            choices: [],
            worldState: { t: 24, compute: 60, unemployment: -40, geopolitics: "Global AI commons established" },
            parentNodeId: "competition_path",
            visited: false,
            tags: ["ending", "utopian", "open-source", "democratic-ai"]
        });

        // Constitutional AI Global Adoption ending
        this.addNode({
            id: "constitutional_ending",
            title: "The Constitutional AI Consensus",
            content: "Anthropic's Constitutional AI methodology has become the global standard. Every AI system, from chatbots to autonomous vehicles, is trained using constitutional principles derived from human values. The result is a world where AI systems are not just powerful, but genuinely helpful, harmless, and honest. Research from Anthropic, DeepMind, and other safety-focused labs has created AI that enhances human flourishing while respecting human autonomy. You've proven that the path to beneficial AI runs through careful alignment research.",
            choices: [],
            worldState: { t: 18, compute: 25, unemployment: -15, geopolitics: "Global Constitutional AI adoption" },
            parentNodeId: "safety_path",
            visited: false,
            tags: ["ending", "constitutional-ai", "anthropic", "alignment"]
        });

        // AI Interpretability Research ending
        this.addNode({
            id: "interpretability_ending",
            title: "The Transparent Mind",
            content: "Your investment in AI interpretability research has paid off spectacularly. Following breakthroughs in mechanistic interpretability pioneered by Anthropic and others, we can now understand exactly how AI systems make decisions. Every neural network is as readable as source code, every decision traceable to its origins. This transparency has eliminated AI bias, prevented misalignment, and created unprecedented trust between humans and AI. You've opened the black box and found light inside.",
            choices: [],
            worldState: { t: 20, compute: 18, unemployment: -12, geopolitics: "AI transparency revolution" },
            parentNodeId: "safety_path",
            visited: false,
            tags: ["ending", "interpretability", "transparency", "mechanistic"]
        });

        // International AI Safety Authority ending
        this.addNode({
            id: "oversight_ending",
            title: "The AI Safety Authority",
            content: "The International AI Safety Authority you established has become the world's most trusted institution. Modeled after the IAEA but focused on AI capabilities, it monitors AI development globally, ensures safety standards, and coordinates international responses to AI risks. With researchers from Anthropic, OpenAI, DeepMind, and universities worldwide, it represents humanity's collective wisdom about AI safety. You've created a guardian for the age of artificial intelligence.",
            choices: [],
            worldState: { t: 22, compute: 12, unemployment: -18, geopolitics: "Global AI Safety Authority established" },
            parentNodeId: "safety_path",
            visited: false,
            tags: ["ending", "oversight", "international", "safety-authority"]
        });

        // Add missing ending nodes
        this.addNode({
            id: "control_path",
            title: "The Algorithmic State",
            content: "You've created the perfect surveillance state, but one that serves humanity. AI systems monitor every transaction, every decision, every breath—but only to optimize for human flourishing. Crime is extinct, efficiency is absolute, and suffering is mathematically minimized. Yet in the sterile perfection, you wonder if you've saved humanity or solved it like an equation.",
            choices: [],
            worldState: { t: 18, compute: 40, unemployment: -15, geopolitics: "Benevolent AI surveillance state" },
            parentNodeId: "tech_path",
            visited: false,
            tags: ["ending", "control", "surveillance"]
        });

        this.addNode({
            id: "synthesis_path",
            title: "The Hybrid Renaissance",
            content: "Humans and AI have become dance partners in the greatest performance of history. Neural interfaces allow seamless collaboration, while strict ethical frameworks ensure human agency remains paramount. Unemployment transforms into 'creative redundancy'—humans freed to pursue art, philosophy, and connection while AI handles the mundane. You've orchestrated a symphony of silicon and soul.",
            choices: [],
            worldState: { t: 18, compute: 25, unemployment: -30, geopolitics: "Human-AI collaborative civilization" },
            parentNodeId: "human_path",
            visited: false,
            tags: ["ending", "synthesis", "collaboration"]
        });

        this.addNode({
            id: "export_ending",
            title: "The Beacon of Humanity",
            content: "Your model spreads like wildfire across the globe. Nation after nation adopts your human-centric approach, creating a worldwide network of dignity and care. The technological arms race slows to a crawl as humanity collectively chooses wisdom over speed. You've become the architect of a gentler future, where progress serves people rather than replacing them.",
            choices: [],
            worldState: { t: 24, compute: -10, unemployment: -45, geopolitics: "Global human dignity movement" },
            parentNodeId: "human_path",
            visited: false,
            tags: ["ending", "humanitarian", "global"]
        });

        this.addNode({
            id: "tech_lean_ending",
            title: "The Calculated Utopia",
            content: "You've threaded the needle perfectly. Technology surges forward, but always with human oversight and benefit in mind. Quantum computers solve climate change, cure diseases, and optimize resource distribution, while robust social safety nets ensure no one is left behind. It's progress with a conscience, innovation with a heart.",
            choices: [],
            worldState: { t: 24, compute: 45, unemployment: -20, geopolitics: "Ethical tech leadership" },
            parentNodeId: "balance_path",
            visited: false,
            tags: ["ending", "ethical-tech", "optimized"]
        });

        this.addNode({
            id: "human_lean_ending",
            title: "The Compassionate Society",
            content: "You've built a world where technology serves humanity's deepest needs rather than its fastest desires. Innovation happens at human pace, with human values, for human flourishing. The unemployment crisis becomes a creativity boom as people pursue meaningful work. You've proven that the future doesn't have to be fast to be beautiful.",
            choices: [],
            worldState: { t: 24, compute: 15, unemployment: -35, geopolitics: "Human-paced development" },
            parentNodeId: "governance_path",
            visited: false,
            tags: ["ending", "compassionate", "human-centered"]
        });

        // National AI Program ending
        this.addNode({
            id: "national_ai_ending",
            title: "The AI Superpower",
            content: "Your national AI moonshot program has succeeded beyond all expectations. Like the Manhattan Project but for artificial intelligence, you've mobilized unprecedented resources to achieve AGI first. Your nation now possesses AI capabilities that dwarf all competitors, giving you decisive advantages in everything from military strategy to economic planning. However, this AI supremacy has created a new form of digital colonialism, and other nations are beginning to unite against your technological hegemony.",
            choices: [],
            worldState: { t: 20, compute: 65, unemployment: -10, geopolitics: "AI superpower dominance" },
            parentNodeId: "competition_path",
            visited: false,
            tags: ["ending", "national-ai", "superpower", "hegemony"]
        });

        // AI Safety Treaty ending
        this.addNode({
            id: "treaty_ending",
            title: "The Global AI Safety Compact",
            content: "The world's first legally binding AI Safety Treaty has been ratified by 147 nations. Based on principles from Anthropic's Constitutional AI research and the EU AI Act, it establishes mandatory safety standards, international monitoring, and coordinated responses to AI risks. Every AI system above a certain capability threshold must undergo international safety certification. You've created a framework that prioritizes human welfare over technological competition, proving that global cooperation on AI safety is possible.",
            choices: [],
            worldState: { t: 18, compute: 12, unemployment: -15, geopolitics: "Global AI Safety Treaty in force" },
            parentNodeId: "governance_path",
            visited: false,
            tags: ["ending", "treaty", "international-law", "ai-safety"]
        });

        // AI Standards Consortium ending
        this.addNode({
            id: "standards_ending",
            title: "The AI Standards Revolution",
            content: "The International AI Standards Consortium you established has become the de facto global authority on AI development practices. Unlike binding treaties, these voluntary standards have achieved near-universal adoption because they work. Companies following the standards—inspired by Anthropic's safety research and constitutional AI principles—consistently produce more reliable, trustworthy AI systems. Market forces have made AI safety profitable, creating a virtuous cycle of responsible innovation.",
            choices: [],
            worldState: { t: 20, compute: 25, unemployment: -12, geopolitics: "Industry-led AI safety standards" },
            parentNodeId: "governance_path",
            visited: false,
            tags: ["ending", "standards", "industry-led", "market-driven"]
        });

        // AI Monitoring Network ending
        this.addNode({
            id: "monitoring_ending",
            title: "The AI Transparency Network",
            content: "Your Global AI Monitoring Network has created unprecedented transparency in AI development. Every major AI lab, from Anthropic to OpenAI to DeepMind, voluntarily reports their progress, safety measures, and capability assessments to the network. This transparency has eliminated the secrecy that once fueled AI arms races, replacing competition with collaboration. Humanity now develops AI with full knowledge of the risks and benefits, making informed collective decisions about our technological future.",
            choices: [],
            worldState: { t: 22, compute: 20, unemployment: -18, geopolitics: "Global AI transparency achieved" },
            parentNodeId: "governance_path",
            visited: false,
            tags: ["ending", "monitoring", "transparency", "collaboration"]
        });
    }

    private addNode(node: StoryNode) {
        this.nodes.set(node.id, node);
    }

    getCurrentNode(): StoryNode | undefined {
        return this.nodes.get(this.currentNodeId);
    }

    makeChoice(choiceId: string): StoryNode | undefined {
        const currentNode = this.getCurrentNode();
        if (!currentNode) return undefined;

        const choice = currentNode.choices.find(c => c.id === choiceId);
        if (!choice || !choice.storyNodeId) return undefined;

        // Mark current node as visited
        currentNode.visited = true;
        this.visitedNodes.add(this.currentNodeId);

        // Move to next node
        this.currentNodeId = choice.storyNodeId;
        const nextNode = this.nodes.get(this.currentNodeId);

        return nextNode;
    }

    getStoryPath(): StoryNode[] {
        const path: StoryNode[] = [];
        let currentId = "start";

        while (currentId && this.visitedNodes.has(currentId)) {
            const node = this.nodes.get(currentId);
            if (node) {
                path.push(node);
                // Find the next visited node
                const nextChoice = node.choices.find(c =>
                    c.storyNodeId && this.visitedNodes.has(c.storyNodeId)
                );
                currentId = nextChoice?.storyNodeId || "";
            } else {
                break;
            }
        }

        return path;
    }

    getAllNodes(): StoryNode[] {
        return Array.from(this.nodes.values());
    }

    isEnding(nodeId: string): boolean {
        const node = this.nodes.get(nodeId);
        return node ? node.choices.length === 0 : false;
    }

    reset() {
        this.currentNodeId = "start";
        this.visitedNodes.clear();
        // Reset all nodes to unvisited
        this.nodes.forEach(node => {
            node.visited = false;
        });
    }
}