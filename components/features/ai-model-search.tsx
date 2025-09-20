"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Loader2, Zap, Brain, Database } from "lucide-react"

interface SearchResult {
    model: {
        name: string
        organization: string
        parameters: string
        domain: string
        tasks: string
        publicationDate: string
        abstract: string
        frontierModel: boolean
    }
    similarity: number
}

interface EmbeddingStats {
    totalModels: number
    organizations: number
    domains: number
    frontierModels: number
    embeddingDimension: number
}

export default function AIModelSearch() {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [stats, setStats] = useState<EmbeddingStats | null>(null)
    const [embeddingsGenerated, setEmbeddingsGenerated] = useState(false)
    const [generating, setGenerating] = useState(false)

    const generateEmbeddings = async () => {
        setGenerating(true)
        try {
            const response = await fetch('/api/ai-models-embeddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'generate' })
            })

            const data = await response.json()
            if (data.success) {
                setStats(data.stats)
                setEmbeddingsGenerated(true)
            } else {
                console.error('Failed to generate embeddings:', data.error)
            }
        } catch (error) {
            console.error('Error generating embeddings:', error)
        } finally {
            setGenerating(false)
        }
    }

    const searchModels = async () => {
        if (!query.trim()) return

        setLoading(true)
        try {
            const response = await fetch('/api/ai-models-embeddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'search',
                    query: query.trim(),
                    topK: 5
                })
            })

            const data = await response.json()
            if (data.success) {
                setResults(data.results)
            } else {
                console.error('Search failed:', data.error)
            }
        } catch (error) {
            console.error('Error searching models:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            const response = await fetch('/api/ai-models-embeddings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'stats' })
            })

            const data = await response.json()
            if (data.success && data.stats) {
                setStats(data.stats)
                setEmbeddingsGenerated(true)
            }
        } catch (error) {
            console.error('Error loading stats:', error)
        }
    }

    // Load stats on component mount
    useState(() => {
        loadStats()
    })

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">AI Model Semantic Search</h3>
                <p className="text-sm text-muted-foreground">
                    Search through AI models using natural language queries powered by Gemini embeddings
                </p>
            </div>

            {/* Stats Card */}
            {stats && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Embedding Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Total Models:</span>
                                    <Badge variant="outline">{stats.totalModels}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Organizations:</span>
                                    <Badge variant="outline">{stats.organizations}</Badge>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>Domains:</span>
                                    <Badge variant="outline">{stats.domains}</Badge>
                                </div>
                                <div className="flex justify-between">
                                    <span>Frontier Models:</span>
                                    <Badge variant="outline">{stats.frontierModels}</Badge>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Generate Embeddings */}
            {!embeddingsGenerated && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center space-y-4">
                            <Brain className="h-12 w-12 mx-auto text-muted-foreground" />
                            <div>
                                <h4 className="font-medium">Generate Embeddings</h4>
                                <p className="text-sm text-muted-foreground">
                                    Create semantic embeddings for the AI models dataset using Gemini
                                </p>
                            </div>
                            <Button
                                onClick={generateEmbeddings}
                                disabled={generating}
                                className="w-full"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating Embeddings...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-4 w-4 mr-2" />
                                        Generate Embeddings
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Search Interface */}
            {embeddingsGenerated && (
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search for AI models (e.g., 'multimodal models for vision tasks')"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && searchModels()}
                            className="flex-1"
                        />
                        <Button onClick={searchModels} disabled={loading || !query.trim()}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    {/* Example Queries */}
                    <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-muted-foreground">Try:</span>
                        {[
                            'code generation models',
                            'multimodal vision language',
                            'reasoning and mathematics',
                            'open source LLMs'
                        ].map((example) => (
                            <Button
                                key={example}
                                variant="outline"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => {
                                    setQuery(example)
                                    setTimeout(searchModels, 100)
                                }}
                            >
                                {example}
                            </Button>
                        ))}
                    </div>
                </div>
            )}

            {/* Search Results */}
            {results.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium">Search Results</h4>
                    {results.map((result, index) => (
                        <Card key={index}>
                            <CardContent className="pt-4">
                                <div className="space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h5 className="font-medium text-sm">{result.model.name}</h5>
                                                {result.model.frontierModel && (
                                                    <Badge variant="default" className="text-xs">Frontier</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{result.model.organization}</span>
                                                {result.model.parameters && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{result.model.parameters}</span>
                                                    </>
                                                )}
                                                {result.model.publicationDate && (
                                                    <>
                                                        <span>•</span>
                                                        <span>{result.model.publicationDate}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="text-xs">
                                            {(result.similarity * 100).toFixed(1)}% match
                                        </Badge>
                                    </div>

                                    {result.model.domain && (
                                        <div className="flex flex-wrap gap-1">
                                            {result.model.domain.split(',').map((domain, i) => (
                                                <Badge key={i} variant="secondary" className="text-xs">
                                                    {domain.trim()}
                                                </Badge>
                                            ))}
                                        </div>
                                    )}

                                    {result.model.abstract && (
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {result.model.abstract}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* No Results */}
            {query && results.length === 0 && !loading && embeddingsGenerated && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center text-sm text-muted-foreground">
                            No models found for "{query}". Try a different search term.
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}