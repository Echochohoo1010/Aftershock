import Link from "next/link"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"

// This would typically come from a CMS or database
const getPost = (slug: string) => {
  const posts = [
    {
      id: "causal-inference-policy-design",
      title: "Causal Inference in Policy Design: Beyond Correlation",
      content: `## Introduction

**Policy is prediction.**

Every new regulation, budget allocation, or public intervention is a bet on the future—a forecast about how people, institutions, and markets will respond. But what if we're making these bets nearly blind?

In today's world, decisions are made in a landscape shaped by accelerating complexity: climate change, digital infrastructure, geopolitical instability, and growing inequality. Yet the tools available to policymakers haven't kept up. Most are designed for a world that no longer exists—linear, siloed, and slow.

We're building something different: **Causal AI tools that help policymakers see, simulate, and shape the future with clarity.** These tools won't eliminate uncertainty—but they will help us reason about it better.

---

### What is the problem?

Imagine trying to navigate a maze blindfolded. That's kind of what it's like when policymakers try to anticipate how their policies will play out. Traditional methods often fall short, leading to:

- **Reactive Governance:** Dealing with problems *after* they happen instead of preventing them.
- **Misaligned Incentives:** Policies unintentionally causing the opposite of what they intended.
- **Systemic Fragility:** The overall system is becoming more unstable.

In short, we need better tools to understand the complex web of cause and effect in our socio-economic systems.

---

### What Does This Mean in Practice?

We're working on two main components:

1. **Policy Synthesis (Generation):** Using AI to create policy ideas based on specific goals and limitations. For example, if the goal is to reduce carbon emissions, the AI could generate a list of potential policies.

2. **Policy Impact Analysis:** Evaluating those policies through simulations and data analysis. We can see how the policies might affect different groups of people, industries, and the economy as a whole.

Additional methodology explanation: [Making Policy Impacts More Predictable](https://forum.effectivealtruism.org/posts/avAt44ZT3yYnqEnoH/project-proposal-looking-for-feedback-making-policy-impacts)

We define the above thesis in the following systems structure:

## 1. Complex Systems

**Thesis:** Any social system is inherently [complex](https://uwaterloo.ca/complexity-innovation/about/what-are-complex-systems). The numerical modeling could not capture the interaction between actors, network effect, as well as the emergent properties within the system. Agent-based simulation goes from bottom up and able to simulate these. Human could only reason with such system limitedly but computation technology empower us.

## 2. Epistemic Systems

**Anti-thesis:** Even if we have all the right tools we need, scalable epistemic systems, human bounded rationality, we can only scale ~150 human relationships.

## 3. Causal Systems

**Synthesis:** It's difficult to trace cause and effect (*this is both difficult for humans and AI systems*). A policy decision may have indirect influences on markets, but we lack a market-based approach to understand those policy changes. Those decisions can also be "[costly signals](https://cset.georgetown.edu/publication/decoding-intentions/)", and have adverse effects. 

*Causal AI involves a shift in perspective by asking (what-if and why) and finding answers that measure the effect of treatment variables, going beyond the classic machine learning prediction.*

## Conclusion

**We don't just need smarter policies. We need smarter ways to make policy.**

Causal AI won't replace human judgment—but it will augment it. It helps us map the maze before we step inside. By generating ideas, forecasting impact, and simulating unintended consequences, we can move from reactive governance to anticipatory stewardship.

In a world where every decision sends ripples through fragile, interconnected systems, we can no longer afford to guess. We must *model before we act*, and *ask better questions before we answer them*.

**The future doesn't just need better outcomes. It needs better foresight.**`,
      author: "Echo Huang",
      date: "2025-01-15",
      category: "Research",
      readTime: "8 min read",
    },
    {
      id: "agent-based-climate-policy",
      title: "Agent-Based Models for Climate Policy Testing",
      content: `## Introduction

Climate policy operates in a world of deep uncertainty. Traditional economic models, while useful, often fail to capture the complex interactions between human behavior, technological adoption, and environmental systems that determine policy outcomes.

Agent-based modeling (ABM) offers a powerful alternative approach that can help policymakers test climate interventions before implementing them in the real world.

## What are Agent-Based Models?

Agent-based models simulate the actions and interactions of autonomous agents—individuals, companies, governments—to assess their effects on the system as a whole. Unlike traditional models that assume rational actors and equilibrium states, ABMs can capture:

- **Heterogeneous behavior** across different types of agents
- **Network effects** and social influence
- **Emergent properties** that arise from complex interactions
- **Non-linear dynamics** and tipping points

## Applications in Climate Policy

### Carbon Pricing Mechanisms

We've used ABM to simulate different carbon pricing approaches:

- **Carbon tax vs. cap-and-trade systems**
- **Border carbon adjustments** and their trade implications
- **Revenue recycling mechanisms** and distributional effects

The models reveal how different pricing mechanisms create varying incentives for innovation, investment, and behavioral change across different sectors and regions.

### Technology Adoption Policies

ABM helps us understand how policies influence the adoption of clean technologies:

- **Subsidies and tax credits** for renewable energy
- **Regulatory standards** for emissions and efficiency
- **R&D investment** and innovation spillovers

## Case Study: Electric Vehicle Adoption

Our recent ABM study of electric vehicle (EV) adoption policies revealed surprising insights:

1. **Infrastructure matters more than subsidies** in the long run
2. **Social influence** accelerates adoption once a critical mass is reached
3. **Targeted policies** for early adopters are more cost-effective than universal subsidies

## Limitations and Challenges

While powerful, ABMs have important limitations:

- **Data requirements** for calibrating agent behaviors
- **Computational complexity** for large-scale simulations
- **Validation challenges** in complex systems
- **Communication barriers** with policymakers unfamiliar with the approach

## The Path Forward

As climate challenges intensify, we need better tools for policy design and evaluation. Agent-based modeling, combined with other approaches, can help us:

- **Test policies** before implementation
- **Identify unintended consequences** early
- **Optimize policy design** for specific contexts
- **Build stakeholder understanding** through interactive simulations

The future of climate policy lies not in one-size-fits-all solutions, but in context-specific interventions informed by rigorous simulation and testing.`,
      author: "Jonas Kgomo",
      date: "2025-01-10",
      category: "Case Study",
      readTime: "12 min read",
    },
    {
      id: "future-exploratory-governance",
      title: "The Future of Exploratory Governance",
      content: `## The Governance Gap

We live in an age of exponential change, yet our governance systems remain fundamentally linear. While technology, climate, and social systems evolve at breakneck speed, our policy-making institutions operate with tools and mindsets designed for a more predictable world.

This mismatch creates what we call the "governance gap"—the widening chasm between the complexity of the challenges we face and the sophistication of our responses.

## Why Traditional Governance Falls Short

Traditional governance approaches share several limiting characteristics:

### Reactive Rather Than Anticipatory

Most policy responses emerge after problems become visible and politically salient. By then, the window for effective intervention may have closed.

### Siloed Thinking

Government departments operate in isolation, making it difficult to address interconnected challenges that span multiple domains.

### Risk Aversion

Political incentives favor avoiding visible failures over pursuing potentially transformative innovations.

### Limited Feedback Loops

Policy effects often take years to manifest, making it difficult to learn and adapt quickly.

## Principles of Exploratory Governance

Exploratory governance represents a fundamental shift in how we approach policy-making. It's built on several key principles:

### 1. Experimentation Over Certainty

Rather than waiting for perfect information, exploratory governance embraces controlled experimentation. Small-scale pilots and randomized trials become standard practice.

### 2. Adaptive Management

Policies are designed with built-in feedback mechanisms and adaptation protocols. Regular review and revision become features, not bugs.

### 3. Systems Thinking

Problems are understood as emerging from complex systems rather than isolated causes. Interventions target system dynamics rather than symptoms.

### 4. Anticipatory Capacity

Governance systems develop capabilities for scanning emerging trends, modeling future scenarios, and preparing for multiple contingencies.

## Tools for Exploratory Governance

Several tools and approaches can support more exploratory governance:

### Scenario Planning

Systematic exploration of multiple possible futures helps policymakers prepare for uncertainty and identify robust strategies.

### Policy Sandboxes

Regulatory sandboxes allow for controlled experimentation with new approaches while limiting downside risks.

### Citizen Assemblies

Deliberative democracy mechanisms can help navigate complex trade-offs and build public support for experimental approaches.

### Computational Modeling

Agent-based models, system dynamics, and other simulation tools can help test policies before implementation.

## Case Studies in Exploratory Governance

### Finland's Basic Income Experiment

Finland's two-year basic income trial demonstrated how governments can test radical policy ideas through rigorous experimentation.

### Estonia's Digital Government

Estonia's approach to digital governance emerged through iterative experimentation and continuous adaptation.

### Singapore's Smart Nation Initiative

Singapore's comprehensive approach to urban innovation combines systematic experimentation with long-term strategic planning.

## Challenges and Obstacles

Implementing exploratory governance faces several challenges:

### Political Constraints

Electoral cycles and political incentives often discourage experimentation and long-term thinking.

### Institutional Inertia

Existing bureaucratic structures and processes resist change and innovation.

### Public Expectations

Citizens may expect immediate solutions rather than experimental approaches.

### Capacity Gaps

Many government organizations lack the skills and tools needed for exploratory governance.

## Building Exploratory Capacity

Developing exploratory governance capabilities requires investment in:

### Human Capital

Training public servants in systems thinking, experimental design, and adaptive management.

### Institutional Design

Creating organizational structures that support experimentation and learning.

### Technology Infrastructure

Developing platforms for data collection, analysis, and simulation.

### Democratic Innovation

Experimenting with new forms of citizen engagement and democratic participation.

## The Path Forward

The transition to exploratory governance won't happen overnight. It requires sustained effort across multiple dimensions:

1. **Cultural change** within government organizations
2. **Skill development** among public servants
3. **Institutional reform** to support experimentation
4. **Public engagement** to build support for new approaches
5. **International cooperation** to share lessons and best practices

## Conclusion

The challenges of the 21st century demand governance systems capable of learning, adapting, and innovating at the speed of change itself. Exploratory governance offers a path forward—not as a complete solution, but as a framework for continuous improvement and adaptation.

The future belongs to those who can navigate uncertainty with wisdom, experiment with courage, and learn with humility. Our governance systems must evolve to embody these qualities if we hope to thrive in an age of exponential change.`,
      author: "Joel Christoph",
      date: "2025-01-05",
      category: "Opinion",
      readTime: "6 min read",
    },
    {
      id: "ai-governance-frameworks",
      title: "Evaluating AI Governance Frameworks",
      content: `## Introduction

As artificial intelligence becomes increasingly integrated into society, the question of how to govern these powerful technologies has become paramount. Different countries and organizations are experimenting with various approaches, each with distinct advantages and trade-offs.

This analysis examines the major AI governance frameworks emerging globally and their implications for innovation, safety, and economic development.

## The Governance Landscape

### Regulatory Approaches

**The European Union: Comprehensive Regulation**
The EU's AI Act represents the most comprehensive regulatory framework to date, establishing risk-based categories and requirements for AI systems.

**The United States: Sector-Specific Approach**
The US has favored industry-specific regulations and voluntary guidelines, emphasizing innovation while addressing specific risks.

**China: State-Led Coordination**
China's approach combines central planning with rapid deployment, focusing on national competitiveness and social stability.

**Singapore: Regulatory Sandboxes**
Singapore has pioneered the use of regulatory sandboxes to test AI applications in controlled environments.

## Framework Comparison

### Innovation Impact

Different governance approaches create varying incentives for innovation:

- **Permissive frameworks** encourage rapid development but may lack safety guardrails
- **Prescriptive regulations** provide clarity but may stifle experimentation
- **Adaptive approaches** balance innovation with risk management

### Safety Considerations

Each framework addresses AI safety differently:

- **Risk-based assessments** categorize AI systems by potential harm
- **Mandatory testing** requirements ensure minimum safety standards
- **Continuous monitoring** systems track AI performance over time

### Economic Implications

Governance choices have significant economic consequences:

- **Compliance costs** vary dramatically across frameworks
- **Market access** depends on regulatory alignment
- **Competitive advantages** emerge from regulatory efficiency

## Case Studies

### Autonomous Vehicles

Different countries' approaches to autonomous vehicle regulation illustrate the trade-offs:

- **Germany**: Detailed technical standards with clear liability frameworks
- **United States**: State-by-state variation with federal oversight
- **Japan**: Industry-government collaboration with gradual deployment

### Healthcare AI

Medical AI governance reveals different priorities:

- **FDA approval processes** in the US emphasize clinical validation
- **CE marking** in Europe focuses on conformity assessment
- **NMPA pathways** in China balance speed with safety

### Financial Services

AI in finance shows varying regulatory maturity:

- **Algorithmic trading** regulations are well-established
- **Credit scoring** AI faces increasing scrutiny
- **Robo-advisors** operate under evolving frameworks

## Emerging Challenges

### Cross-Border Coordination

AI governance faces inherent challenges in a globalized world:

- **Regulatory arbitrage** as companies seek favorable jurisdictions
- **Data localization** requirements that fragment global markets
- **Standards harmonization** efforts to reduce compliance complexity

### Technological Evolution

Rapid AI advancement outpaces regulatory development:

- **Generative AI** capabilities that weren't anticipated in existing frameworks
- **Foundation models** that challenge traditional risk assessment approaches
- **AI agents** that operate with increasing autonomy

### Democratic Legitimacy

AI governance raises fundamental questions about democratic participation:

- **Technical complexity** that limits public understanding
- **Corporate influence** in standard-setting processes
- **Algorithmic accountability** in public decision-making

## Best Practices

### Adaptive Regulation

Successful AI governance frameworks share certain characteristics:

- **Iterative development** that evolves with technology
- **Stakeholder engagement** across industry, academia, and civil society
- **Evidence-based policy** informed by empirical research

### International Cooperation

Effective governance requires coordination:

- **Bilateral agreements** on AI research and development
- **Multilateral forums** for sharing best practices
- **Technical standards** developed through international bodies

### Innovation-Friendly Approaches

Balancing innovation with governance:

- **Regulatory sandboxes** for testing new approaches
- **Safe harbors** for good-faith compliance efforts
- **Outcome-based standards** rather than prescriptive rules

## Future Directions

### Emerging Models

New governance approaches are emerging:

- **Algorithmic auditing** as a regulatory tool
- **Participatory AI** involving affected communities
- **Anticipatory governance** that prepares for future developments

### Global Convergence

Trends toward harmonization:

- **Common principles** emerging across frameworks
- **Mutual recognition** agreements between jurisdictions
- **Shared infrastructure** for AI testing and validation

## Conclusion

AI governance remains a work in progress, with different approaches reflecting varying priorities and contexts. The most effective frameworks will likely combine elements from multiple models, adapting to local needs while maintaining global interoperability.

Success will require ongoing experimentation, international cooperation, and a commitment to balancing innovation with responsible development. As AI capabilities continue to advance, governance frameworks must evolve to meet new challenges while preserving the benefits of technological progress.`,
      author: "Caleb Maresca",
      date: "2024-12-15",
      category: "Analysis",
      readTime: "15 min read",
    },
    {
      id: "policy-synthesis-llms",
      title: "Policy Synthesis with Large Language Models",
      content: `## Introduction

Large Language Models (LLMs) represent a paradigm shift in how we can approach policy development. By synthesizing vast amounts of research, case studies, and expert knowledge, these AI systems offer unprecedented capabilities for generating and evaluating policy alternatives.

This exploration examines how LLMs can augment human policy-making while addressing the challenges and limitations of AI-assisted governance.

## The Promise of AI-Assisted Policy Synthesis

### Knowledge Integration

LLMs excel at synthesizing information across domains:

- **Cross-disciplinary insights** that human experts might miss
- **Historical precedent analysis** from global policy databases
- **Real-time information processing** of emerging trends and data

### Scenario Generation

AI can rapidly generate multiple policy scenarios:

- **Alternative approaches** to the same policy challenge
- **Unintended consequence modeling** through systematic analysis
- **Stakeholder impact assessment** across different groups

### Rapid Prototyping

LLMs enable quick iteration on policy ideas:

- **Draft legislation** generation from high-level objectives
- **Policy brief creation** with supporting evidence
- **Implementation pathway** development with timeline estimates

## Current Applications

### Legislative Drafting

Several jurisdictions are experimenting with AI-assisted legislative drafting:

- **Template generation** for common policy types
- **Consistency checking** across legal frameworks
- **Plain language translation** of complex regulations

### Policy Research

LLMs are transforming policy research workflows:

- **Literature synthesis** from thousands of academic papers
- **Comparative analysis** of international policy approaches
- **Evidence gap identification** in policy research

### Stakeholder Consultation

AI can enhance public participation in policy-making:

- **Comment analysis** from public consultation processes
- **Sentiment tracking** across different demographic groups
- **Argument mapping** of complex policy debates

## Technical Approaches

### Fine-Tuning for Policy Domains

Specialized models trained on policy-specific data:

- **Legal corpus training** on legislation and case law
- **Policy outcome datasets** linking interventions to results
- **Expert knowledge distillation** from policy practitioner interviews

### Retrieval-Augmented Generation

Combining LLMs with policy databases:

- **Real-time fact checking** against authoritative sources
- **Citation generation** with proper attribution
- **Version control** for evolving policy documents

### Multi-Agent Systems

Collaborative AI approaches to policy development:

- **Adversarial policy testing** with competing AI perspectives
- **Stakeholder simulation** representing different interest groups
- **Consensus building** through iterative refinement

## Case Studies

### Climate Policy Development

AI-assisted development of carbon pricing mechanisms:

- **Economic modeling** integration with policy text generation
- **International comparison** of carbon tax implementations
- **Stakeholder impact analysis** across industries and regions

### Healthcare Policy Reform

LLM applications in health system design:

- **Coverage optimization** based on population health data
- **Cost-benefit analysis** of different intervention strategies
- **Implementation timeline** development with resource requirements

### Education Policy Innovation

AI support for educational reform initiatives:

- **Curriculum development** aligned with labor market needs
- **Teacher training program** design with competency frameworks
- **Assessment system** creation with equity considerations

## Challenges and Limitations

### Bias and Fairness

LLMs inherit biases from training data:

- **Historical policy bias** reflected in generated recommendations
- **Demographic representation** gaps in training datasets
- **Value alignment** challenges with diverse societal preferences

### Accountability and Transparency

AI-generated policy raises governance questions:

- **Decision traceability** in complex AI reasoning chains
- **Human oversight** requirements for AI recommendations
- **Public trust** in AI-assisted policy development

### Technical Limitations

Current LLM capabilities have important constraints:

- **Factual accuracy** challenges with hallucination risks
- **Temporal reasoning** difficulties with long-term policy impacts
- **Causal understanding** limitations in complex policy systems

## Best Practices

### Human-AI Collaboration

Effective integration requires careful design:

- **Human-in-the-loop** systems with meaningful oversight
- **Expertise augmentation** rather than replacement
- **Iterative refinement** through human feedback

### Quality Assurance

Ensuring reliable AI-assisted policy development:

- **Multi-source validation** of AI-generated content
- **Expert review** processes for technical accuracy
- **Pilot testing** of AI-recommended policies

### Ethical Guidelines

Responsible development of policy AI systems:

- **Transparency requirements** for AI involvement in policy-making
- **Bias mitigation** strategies throughout the development process
- **Democratic accountability** mechanisms for AI-assisted decisions

## Future Directions

### Advanced Capabilities

Emerging LLM capabilities for policy work:

- **Multimodal analysis** incorporating data visualizations and documents
- **Real-time adaptation** to changing circumstances and new information
- **Personalized policy** recommendations based on local contexts

### Integration Challenges

Technical and institutional barriers to address:

- **Legacy system** integration with existing policy infrastructure
- **Skill development** for policy professionals working with AI
- **Regulatory frameworks** for AI use in government

### Global Coordination

International cooperation on policy AI:

- **Shared standards** for AI-assisted policy development
- **Best practice exchange** across jurisdictions
- **Collaborative research** on policy AI effectiveness

## Conclusion

Large Language Models offer transformative potential for policy synthesis, enabling more comprehensive, evidence-based, and rapidly developed policy alternatives. However, realizing this potential requires careful attention to bias, accountability, and human oversight.

The future of AI-assisted policy-making lies not in replacing human judgment, but in augmenting human capabilities with powerful tools for information synthesis, scenario generation, and stakeholder analysis. Success will depend on thoughtful integration that preserves democratic values while leveraging AI's analytical capabilities.

As these technologies mature, we can expect to see more sophisticated applications that help policymakers navigate increasingly complex challenges with greater insight and agility.`,
      author: "Echo Huang",
      date: "2024-12-10",
      category: "Technology",
      readTime: "9 min read",
    },
  ]

  return posts.find((post) => post.id === slug)
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)

  if (!post) {
    return (
      <div className="min-h-screen pt-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl font-bold mb-4">Post Not Found</h1>
          <p className="text-lg text-gray-700 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link href="/blog">
            <Button className="font-heading">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m12 19-7-7 7-7"></path>
                <path d="M19 12H5"></path>
              </svg>
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link href="/blog" className="inline-flex items-center text-gray-600 hover:text-black mb-8 font-heading">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m12 19-7-7 7-7"></path>
            <path d="M19 12H5"></path>
          </svg>
          Back to Blog
        </Link>

        {/* Article Header */}
        <header className="mb-12">
          <div className="mb-4">
            <span className="category-tag">{post.category}</span>
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-6 leading-tight">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-6 text-gray-600 font-heading text-sm">
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              {post.author}
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                <line x1="16" x2="16" y1="2" y2="6"></line>
                <line x1="8" x2="8" y1="2" y2="6"></line>
                <line x1="3" x2="21" y1="10" y2="10"></line>
              </svg>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              {post.readTime}
            </div>
          </div>
        </header>

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </article>

        {/* Article Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="mb-6 md:mb-0">
              <h3 className="font-heading text-lg font-semibold mb-2">About the Author</h3>
              <p className="text-gray-700">
                {post.author} is a research scientist at Exploratory Policy, specializing in causal inference and policy
                analysis.
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="text-gray-600 hover:text-black transition-colors">Share on Twitter</button>
              <button className="text-gray-600 hover:text-black transition-colors">Share on LinkedIn</button>
            </div>
          </div>
        </footer>

        {/* Related Posts */}
        <section className="mt-16 pt-16 border-t border-gray-200">
          <h2 className="font-heading text-2xl font-semibold mb-8">Related Posts</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Link href="/blog/agent-based-climate-policy">
              <article className="blog-card">
                <div className="mb-3">
                  <span className="category-tag">Case Study</span>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">
                  Agent-Based Models for Climate Policy Testing
                </h3>
                <p className="blog-excerpt">
                  How computational simulations allow us to test climate policies in virtual environments.
                </p>
              </article>
            </Link>
            <Link href="/blog/future-exploratory-governance">
              <article className="blog-card">
                <div className="mb-3">
                  <span className="category-tag">Opinion</span>
                </div>
                <h3 className="font-heading text-xl font-semibold mb-3">The Future of Exploratory Governance</h3>
                <p className="blog-excerpt">
                  Why policymakers need to adopt experimental approaches to navigate uncertainty.
                </p>
              </article>
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
