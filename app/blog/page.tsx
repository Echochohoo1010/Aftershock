import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import Link from "next/link"

const blogPosts = [
  {
    id: "causal-inference-policy-design",
    title: "Causal Inference in Policy Design: Beyond Correlation",
    excerpt:
      "Traditional policy analysis often confuses correlation with causation, leading to ineffective interventions. We explore how causal inference methods can revolutionize policy design by identifying true cause-and-effect relationships.",
    content: "Full article content would go here...",
    author: "Echo Huang",
    date: "2025-01-15",
    category: "Research",
    readTime: "8 min read",
    featured: true,
  },
  {
    id: "agent-based-complex-systems",
    title: "Decision Engines: Agent-Based Simulation for Complex Systems",
    excerpt:
      "Exploring how agent-based simulations can address the limitations of current AI forecasting paradigms by modeling dynamic social responses and stakeholder interactions in complex systems.",
    content: "Full article content would go here...",
    author: "Echo Huang",
    date: "2025-08-08",
    category: "Research",
    readTime: "25 min read",
    featured: true,
  },
  {
    id: "future-exploratory-governance",
    title: "The Future of Exploratory Governance",
    excerpt:
      "Why policymakers need to adopt experimental approaches to navigate technological uncertainty and rapid change in the 21st century.",
    content: "Full article content would go here...",
    author: "Joel Christoph",
    date: "2025-01-05",
    category: "Opinion",
    readTime: "6 min read",
    featured: false,
  },
  {
    id: "ai-governance-frameworks",
    title: "Evaluating AI Governance Frameworks",
    excerpt:
      "A comparative analysis of different AI governance approaches and their implications for innovation, safety, and economic development.",
    content: "Full article content would go here...",
    author: "Caleb Maresca",
    date: "2024-12-15",
    category: "Analysis",
    readTime: "15 min read",
    featured: false,
  },
  {
    id: "policy-synthesis-llms",
    title: "Policy Synthesis with Large Language Models",
    excerpt:
      "Exploring how AI can assist in generating policy alternatives by synthesizing vast amounts of research, case studies, and expert knowledge.",
    content: "Full article content would go here...",
    author: "Echo Huang",
    date: "2024-12-10",
    category: "Technology",
    readTime: "9 min read",
    featured: false,
  },
]

const categories = ["All", "Research", "Case Study", "Opinion", "Analysis", "Technology"]

export default function Blog() {
  const featuredPosts = blogPosts.filter((post) => post.featured)
  const regularPosts = blogPosts.filter((post) => !post.featured)

  return (
    <div className="min-h-screen pt-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <h1 className="font-heading text-5xl font-bold mb-6">Research & Insights</h1>
          <p className="text-xl text-gray-700 max-w-3xl leading-relaxed">
            Exploring the intersection of artificial intelligence, policy design, and governance through rigorous
            research and practical applications.
          </p>
        </div>

        {/* Categories */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-none border transition-colors font-heading text-sm ${category === "All"
                  ? "bg-black   border-black"
                  : "bg-white   border-gray-300 hover:border-black hover:text-black"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="mb-16">
            <h2 className="font-heading text-2xl font-semibold mb-8 pb-2 border-b border-gray-200">Featured</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <article className=" h-full flex flex-col">
                    <div className="mb-4">
                      <Badge className="">{post.category}</Badge>
                    </div>
                    <h3 className="font-heading text-2xl font-semibold mb-4 leading-tight">{post.title}</h3>
                    <p className=" mb-6 flex-grow">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-sm   font-heading">
                      <div className="flex items-center space-x-4">
                        <span>{post.author}</span>
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
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
                      </div>
                      <span>{post.readTime}</span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* All Posts */}
        <section>
          <h2 className="font-heading text-2xl font-semibold mb-8 pb-2 border-b border-gray-200">All Posts</h2>
          <div className="space-y-8">
            {regularPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <Card className="flex flex-col md:flex-row md:items-center py-6 border-b border-gray-100 hover:bg-gray-50 transition-colors -mx-4 px-4">
                  <div className="flex-grow">
                    <div className="mb-2">
                      <span className="category-tag">{post.category}</span>
                    </div>
                    <h3 className="font-heading text-xl font-semibold mb-3 leading-tight">{post.title}</h3>
                    <p className=" mb-4">{post.excerpt}</p>
                    <div className="flex items-center space-x-6 text-sm  font-heading">
                      <span>{post.author}</span>
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
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
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 md:ml-8">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5  "
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
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-20 py-16 bg-gray-50 -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-heading text-3xl font-semibold mb-4">Stay Updated</h2>
            <p className="text-lg  mb-8 leading-relaxed">
              Get the latest research insights and policy analysis delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-grow px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
              />
              <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-heading font-medium">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
