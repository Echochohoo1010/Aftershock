import { NextRequest, NextResponse } from 'next/server';
import { AIModelsEmbeddingService } from '@/lib/ai-models-embeddings';
import * as path from 'path';

// Initialize the service (will be cached)
let embeddingService: AIModelsEmbeddingService | null = null;
const EMBEDDINGS_CACHE_FILE = path.join(process.cwd(), 'public', 'data', 'ai_models_embeddings.json');

async function getEmbeddingService(): Promise<AIModelsEmbeddingService> {
    if (!embeddingService) {
        embeddingService = new AIModelsEmbeddingService();

        // Try to load cached embeddings first
        try {
            await embeddingService.loadEmbeddings(EMBEDDINGS_CACHE_FILE);
            console.log('Loaded cached embeddings');
        } catch (error) {
            console.log('No cached embeddings found, will generate on first use');
        }
    }

    return embeddingService;
}

export async function POST(request: NextRequest) {
    try {
        const { action, query, topK = 5, regenerate = false } = await request.json();

        const service = await getEmbeddingService();

        switch (action) {
            case 'generate':
                // Generate embeddings from the CSV file
                const csvPath = path.join(process.cwd(), 'public', 'data', 'notable_ai_models.csv');
                const fs = await import('fs');

                if (!fs.existsSync(csvPath)) {
                    return NextResponse.json({ error: 'AI models dataset not found' }, { status: 404 });
                }

                // Read and parse CSV
                const csvContent = await fs.promises.readFile(csvPath, 'utf-8');
                const models = service.parseCSVData(csvContent);

                console.log(`Processing ${models.length} models for embedding generation`);

                // Generate embeddings (limit to first 100 for demo to avoid rate limits)
                const limitedModels = models.slice(0, 100);
                await service.generateAllEmbeddings(limitedModels, 5); // Smaller batch size

                // Save to cache
                await service.saveEmbeddings(EMBEDDINGS_CACHE_FILE);

                const stats = service.getStats();

                return NextResponse.json({
                    success: true,
                    message: `Generated embeddings for ${limitedModels.length} models`,
                    stats
                });

            case 'search':
                if (!query) {
                    return NextResponse.json({ error: 'Query is required for search' }, { status: 400 });
                }

                const results = await service.searchModels(query, topK);

                return NextResponse.json({
                    success: true,
                    query,
                    results: results.map(r => ({
                        model: {
                            name: r.model.Model,
                            organization: r.model.Organization,
                            parameters: r.model.Parameters,
                            domain: r.model.Domain,
                            tasks: r.model.Task,
                            publicationDate: r.model['Publication date'],
                            abstract: r.model.Abstract?.substring(0, 200) + '...',
                            frontierModel: r.model['Frontier model']?.toLowerCase() === 'true'
                        },
                        similarity: r.similarity
                    }))
                });

            case 'stats':
                const serviceStats = service.getStats();
                return NextResponse.json({
                    success: true,
                    stats: serviceStats
                });

            case 'similar':
                // Find models similar to a specific model
                const { modelName } = await request.json();
                if (!modelName) {
                    return NextResponse.json({ error: 'Model name is required' }, { status: 400 });
                }

                // Find the model and get similar ones
                const allEmbeddings = (service as any).embeddings;
                const targetModel = allEmbeddings.find((e: any) =>
                    e.model.Model.toLowerCase().includes(modelName.toLowerCase())
                );

                if (!targetModel) {
                    return NextResponse.json({ error: 'Model not found' }, { status: 404 });
                }

                const similarModels = service.findSimilarModels(targetModel.embedding, topK + 1)
                    .filter(r => r.model.Model !== targetModel.model.Model); // Exclude the target model itself

                return NextResponse.json({
                    success: true,
                    targetModel: targetModel.model.Model,
                    similarModels: similarModels.map(r => ({
                        model: {
                            name: r.model.Model,
                            organization: r.model.Organization,
                            parameters: r.model.Parameters,
                            domain: r.model.Domain,
                            similarity: r.similarity
                        }
                    }))
                });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

    } catch (error) {
        console.error('Error in AI models embeddings API:', error);
        return NextResponse.json({
            error: 'Internal server error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const service = await getEmbeddingService();
        const stats = service.getStats();

        return NextResponse.json({
            success: true,
            stats,
            endpoints: {
                generate: 'POST /api/ai-models-embeddings with { "action": "generate" }',
                search: 'POST /api/ai-models-embeddings with { "action": "search", "query": "your search query" }',
                similar: 'POST /api/ai-models-embeddings with { "action": "similar", "modelName": "GPT-4" }',
                stats: 'POST /api/ai-models-embeddings with { "action": "stats" }'
            }
        });
    } catch (error) {
        console.error('Error getting embeddings info:', error);
        return NextResponse.json({
            error: 'Internal server error'
        }, { status: 500 });
    }
}