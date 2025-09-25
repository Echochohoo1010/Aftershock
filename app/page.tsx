"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { ArrowBigUpIcon, ArrowUpRight, Feather, ShapesIcon, Share2Icon } from "lucide-react"
import { GlobalCommandPalette } from "@/components/global-command-palette"

// Dynamically import  
const DynamicSDF = dynamic(() => import("@/components/SDF"), {
  ssr: false,
  loading: () => (
    <div className="w-full  h-full flex items-center justify-center">
      <div className="animate-pulse text-muted-foreground ">Loading 3D visualization...</div>
    </div>
  ),
})

export default function Home() {
  return (
    <div className="min-h-screen text-foreground">

      {/* Hero Section */}
      <section className="relative px-4 pt-32 pb-16 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12">
            <div className="lg:w-3/5 z-10">
              <Badge variant="secondary" className="mb-6 rounded-sm">
                Causal Scenario Planning
              </Badge>
              <h1 className="font-semibold text-5xl md:text-7xl tracking-tight mb-6">
                Explore Policy
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl mb-12 text-muted-foreground leading-relaxed">
                Developing causal AI tools to formulate and analyze the impacts of policies within complex
                systems.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link href="/explore">
                  <Button size="lg" className="text-lg rounded-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 flex items-center">
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
                  <Button variant="outline" size="lg">
                    Our Research
                  </Button>
                </Link>
              </div>
            </div>

            {/* 3D Metaballs Visualization */}
            <div className="lg:w-2/5 h-96 lg:h-[500px] mt-8 lg:mt-0">
              <div className="relative w-full h-full rounded-lg overflow-hidden border">
                <DynamicSDF />

                {/* Overlay text explaining the visualization */}
                <div className="absolute bottom-2 mx-auto left-0 right-0  bg-background/80 backdrop-blur-sm p-3 rounded-lg shadow-sm max-w-xs border">
                  <span className="text-xs text-foreground  font-medium">
                    <strong className="text-background/20">Interactive Policy Dynamics </strong> represents interconnected policy elements that blend to create emergent effects within complex governance systems.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 flex justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 animate-bounce text-muted-foreground"
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
        </div>
      </section>

      {/* AI Tool Showcase */}
      <section className="py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">AI-Powered Policy Exploration</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Experience our cutting-edge causal AI system that helps policymakers understand complex scenarios,
              visualize causal relationships, and simulate policy interventions before implementation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="text-center group  transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <ShapesIcon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-all duration-300">Causal Graphs</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Interactive visualizations of causal relationships between policy variables
                </p>
              </CardContent>
            </Card>

            <Card className="text-center group transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Feather className="w-8 h-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-all duration-300">AI Chat Assistant</h3>
                <p className="text-muted-foreground leading-relaxed">Natural language conversations about policy scenarios and interventions</p>
              </CardContent>
            </Card>

            <Card className="text-center group hover:scale-[1.02] transition-all duration-300">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Share2Icon className="w-8 h-8 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-all duration-300">Scenario Simulation</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Model policy interventions and explore potential outcomes and consequences
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Link href="/explore">
              <Button size="lg" className="text-lg px-8 py-4 rounded-lg font-medium shadow-lg hover:shadow-xl hover:scale-105 flex items-center mx-auto">
                Try the AI Explorer
                <ArrowUpRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Thesis Section */}
      <section className="py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-l-4 border-primary pl-8 py-6 mb-16">
            <CardContent className="pt-0">
              <p className="text-xl md:text-2xl font-medium leading-relaxed">
                Our core thesis is that policy, like science and engineering, must be exploratory in nature—capable of
                simulating, testing, and adapting to uncertain technological frontiers.
              </p>
            </CardContent>
          </Card>
          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">The Problem</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  Policy systems lack the tools and protocols to anticipate, test, and iteratively improve responses to
                  high-uncertainty, fast-moving technological change.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  This leads to reactive governance, misaligned incentives, and increased systemic fragility.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Our Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  By integrating agent-based modeling, causal inference, and large language models, we provide
                  policymakers with interactive platforms to:
                </p>
                <ul className="list-disc pl-6 text-lg text-muted-foreground space-y-3 leading-relaxed">
                  <li>Explore potential outcomes</li>
                  <li>Identify unintended consequences</li>
                  <li>Enhance decision-making processes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Latest Research */}
      <section className="py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <h2 className="text-4xl font-bold">Latest Research</h2>
            <Link href="/blog">
              <Button variant="outline" size="lg">
                View All Posts
              </Button>
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
                id: "agent-based-complex-systems",
                title: "Agent-Based Models for Complex Systems",
                excerpt:
                  "Using computational simulations to test complex systems policies before implementation in the real world.",
                date: "August 07, 2025",
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
                <Card className="group hover:scale-[1.02] transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="mb-4">
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-3 leading-tight group-hover:text-primary transition-all duration-300">{post.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>
                    <time className="text-sm text-muted-foreground">{post.date}</time>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Simulator Features</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="group hover:scale-[1.02] transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-all duration-300">Causal Graph Analysis</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Visualize and modify causal relationships between key variables to understand
                  how changes in one factor affect others throughout the system.
                </p>
                <Badge variant="secondary">Explore I</Badge>
              </CardContent>
            </Card>

            <Card className="group hover:scale-[1.02] transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-all duration-300">Chain Reaction Simulator</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Monitor real-time system responses to policy changes as they cascade through
                  stakeholders, markets, regulations, and social systems.
                </p>
                <Badge variant="secondary">Explore II</Badge>
              </CardContent>
            </Card>

            <Card className="group hover:scale-[1.02] transition-all duration-300">
              <CardContent className="pt-6">
                <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-all duration-300">AI Policy Assistant</h3>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  Interact with our AI assistant to ask questions about policy impacts, explore
                  alternative scenarios, and receive insights on potential outcomes.
                </p>
                <Badge variant="secondary">Interactive Analysis</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Team Section */}
      <section className="py-24 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Our Team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Joel Christoph", role: "CEO" },
              { name: "Jonas Kgomo", role: "CPO" },
              { name: "Caleb Maresca", role: "CTO" },
              { name: "Echo Huang", role: "Chief Operations Officer" },
            ].map((member, index) => (
              <Card key={index} className="border-l-4 border-primary group hover:scale-[1.02] transition-all duration-300">
                <CardContent className="pt-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-all duration-300">{member.name}</h3>
                  <p className="text-muted-foreground">{member.role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 md:px-6 lg:px-8 border-t">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div className="mb-8 md:mb-0">
                  <h3 className="text-xl font-bold mb-2">Explore Policy</h3>
                  <p className="text-muted-foreground mb-4">Advancing the science of policy through causal AI</p>
                  <p className="text-sm text-muted-foreground">© 2025 All rights reserved</p>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-3">Research</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        <Link href="/research" className="hover:text-primary transition-colors">
                          Policy Synthesis
                        </Link>
                      </li>
                      <li>
                        <Link href="/research" className="hover:text-primary transition-colors">
                          Impact Analysis
                        </Link>
                      </li>
                      <li>
                        <Link href="/blog" className="hover:text-primary transition-colors">
                          Publications
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Connect</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>
                        <Link href="#" className="hover:text-primary transition-colors">
                          Twitter
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-primary transition-colors">
                          LinkedIn
                        </Link>
                      </li>
                      <li>
                        <Link href="#" className="hover:text-primary transition-colors">
                          GitHub
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </footer>
    </div>
  )
}
