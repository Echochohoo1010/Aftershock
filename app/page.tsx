"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import dynamic from "next/dynamic"
import { ArrowBigUpIcon, ArrowUpRight, Feather, ShapesIcon, Share2Icon } from "lucide-react"

// Dynamically import the 3D component to avoid SSR issues
const Metaballs3D = dynamic(() => import("@/components/metaballs-3d"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="animate-pulse text-gray-400">Loading 3D visualization...</div>
    </div>
  ),
})

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center px-4 pt-32 pb-16 md:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center">
          <div className="lg:w-3/5 z-10">
            <h2 className="uppercase font-heading text-xl text-zinc-400 font-semibold tracking-tight ">
              Causal Scenario Planning
            </h2>
            <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight mb-4">Exploratory Policy</h1>


            <p className="text-xl md:text-2xl max-w-3xl mb-12 text-gray-700 leading-relaxed">
              Developing causal AI tools to formulate and analyze the impacts of policies within complex
              systems.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/explore">
                <Button className="text-lg px-8 py-4 bg-black text-white hover:bg-gray-800 font-heading">
                  Explore AI Scenarios
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="ml-2 h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </Button>
              </Link>
              <Link href="/research">
                <Button variant="outline" className="text-lg px-8 py-4 border-black hover:bg-gray-50 font-heading">
                  Our Research
                </Button>
              </Link>
            </div>
          </div>

          {/* 3D Metaballs Visualization */}
          <div className="lg:w-2/5 h-96 lg:h-[500px] mt-8 lg:mt-0">
            <div className="relative w-full h-full rounded-lg overflow-hidden  ">
              <Metaballs3D />

              {/* Overlay text explaining the visualization */}
              <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm p-3 rounded-lg shadow-sm max-w-xs">
                <p className="text-xs text-white font-heading">
                  <strong>Policy Blending Visualization:</strong> White spheres represent individual policy components
                  that create organic blending zones, demonstrating how separate policies can merge and influence each
                  other in complex systems.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 animate-bounce text-gray-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </div>
      </section>

      {/* New AI Tool Showcase */}
      <section className="py-24 px-4 md:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl font-semibold mb-6">AI-Powered Policy Exploration</h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Experience our cutting-edge causal AI system that helps policymakers understand complex scenarios,
              visualize causal relationships, and simulate policy interventions before implementation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <ShapesIcon className="w-8 h-8 font-light text-white" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Causal Graphs</h3>
              <p className="text-gray-600">
                Interactive visualizations of causal relationships between policy variables
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Feather className="w-8 h-8 font-light text-white" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">AI Chat Assistant</h3>
              <p className="text-gray-600">Natural language conversations about policy scenarios and interventions</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-2">Scenario Simulation</h3>
              <p className="text-gray-600">
                Model policy interventions and explore potential outcomes and consequences
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link href="/explore">
              <Button className="text-lg px-8 py-4 bg-black text-white hover:bg-gray-800 font-heading">
                Try the AI Explorer
                <ArrowUpRight className="w-10 h-10" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Thesis Section */}
      <section className="py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="border-l-4 border-black pl-8 py-4 mb-16">
            <p className="text-xl md:text-2xl font-medium leading-relaxed">
              Our core thesis is that policy, like science and engineering, must be exploratory in nature—capable of
              simulating, testing, and adapting to uncertain technological frontiers.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="font-heading text-3xl font-semibold mb-6">The Problem</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Policy systems lack the tools and protocols to anticipate, test, and iteratively improve responses to
                high-uncertainty, fast-moving technological change.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                This leads to reactive governance, misaligned incentives, and increased systemic fragility.
              </p>
            </div>
            <div>
              <h2 className="font-heading text-3xl font-semibold mb-6">Our Approach</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                By integrating agent-based modeling, causal inference, and large language models, we provide
                policymakers with interactive platforms to:
              </p>
              <ul className="list-disc pl-6 text-lg text-gray-700 space-y-3 leading-relaxed">
                <li>Explore potential outcomes</li>
                <li>Identify unintended consequences</li>
                <li>Enhance decision-making processes</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Research */}
      <section className="py-24 px-4 md:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-heading text-4xl font-semibold">Latest Research Blogs</h2>
            <Link href="/blog" className="text-lg font-heading underline underline-offset-4 hover:text-gray-600">
              View All Posts
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                id: "causal-inference-policy-design",
                title: "Causal Inference in Policy Design",
                excerpt:
                  "Exploring how causal models can improve policy effectiveness by identifying true cause-and-effect relationships.",
                date: "January 15, 2025",
                category: "Research",
              },
              {
                id: "agent-based-climate-policy",
                title: "Agent-Based Models for Climate Policy",
                excerpt:
                  "Using computational simulations to test climate policies before implementation in the real world.",
                date: "January 10, 2025",
                category: "Case Study",
              },
              {
                id: "future-exploratory-governance",
                title: "The Future of Exploratory Governance",
                excerpt:
                  "Why policymakers need to adopt experimental approaches to navigate technological uncertainty.",
                date: "January 5, 2025",
                category: "Opinion",
              },
            ].map((post, index) => (
              <Link key={index} href={`/blog/${post.id}`}>
                <article className="rounded-lg">
                  <div className="mb-4">
                    <span className="category-tag">{post.category}</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-3 leading-tight">{post.title}</h3>
                  <p className="blog-excerpt mb-4">{post.excerpt}</p>
                  <time className="blog-meta">{post.date}</time>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Simulator Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3">Causal Graph Analysis</h3>
              <p className="text-gray-600 mb-4">
                Visualize and modify causal relationships between key variables to understand
                how changes in one factor affect others throughout the system.
              </p>
              <div className="text-sm font-medium text-black">Explore I</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3">Chain Reaction Simulator</h3>
              <p className="text-gray-600 mb-4">
                Monitor real-time system responses to policy changes as they cascade through
                stakeholders, markets, regulations, and social systems.
              </p>
              <div className="text-sm font-medium text-black">Explore II</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-bold mb-3">AI Policy Assistant</h3>
              <p className="text-gray-600 mb-4">
                Interact with our AI assistant to ask questions about policy impacts, explore
                alternative scenarios, and receive insights on potential outcomes.
              </p>
              <div className="text-sm font-medium text-black">Interactive Analysis</div>
            </div>
          </div>
        </div>
      </div>
      {/* Team Section */}
      <section className="py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="font-heading text-4xl font-semibold mb-12">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { name: "Joel Christoph", role: "CEO" },
              { name: "Jonas Kgomo", role: "CPO" },
              { name: "Caleb Maresca", role: "CTO" },
              { name: "Echo Huang", role: "Chief Operations Officer" },
            ].map((member, index) => (
              <div key={index} className="border-l-4 border-black pl-6 py-2">
                <h3 className="font-heading text-xl font-semibold">{member.name}</h3>
                <p className="text-gray-700">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 md:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div className="mb-8 md:mb-0">
              <h3 className="font-heading text-xl font-semibold mb-2">Exploratory Policy</h3>
              <p className="text-gray-600 mb-4">Advancing the science of policy through causal AI</p>
              <p className="text-sm text-gray-500">© 2025 All rights reserved</p>
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-heading font-semibold mb-3">Research</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <Link href="/research" className="hover:text-black">
                      Policy Synthesis
                    </Link>
                  </li>
                  <li>
                    <Link href="/research" className="hover:text-black">
                      Impact Analysis
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="hover:text-black">
                      Publications
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-heading font-semibold mb-3">Connect</h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <Link href="#" className="hover:text-black">
                      Twitter
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-black">
                      LinkedIn
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-black">
                      GitHub
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
