import { GoogleGenAI } from "@google/genai";
import * as fs from 'fs';
import * as path from 'path';

export interface AIModel {
    Model: string;
    Organization: string;
    'Publication date': string;
    Domain: string;
    Task: string;
    Parameters: string;
    'Parameters notes': string;
    'Training compute (FLOP)': string;
    'Training dataset': string;
    'Training dataset size (datapoints)': string;
    Abstract: string;
    'Organization categorization': string;
    'Country (of organization)': string;
    'Notability criteria': string;
    'Frontier model': string;
    [key: string]: string;
}

export interface ModelEmbedding {
    id: string;
    model: AIModel;
    embedding: number[];
    textContent: string;
}

export class AIModelsEmbeddingService {
    private genAI: GoogleGenAI;
    private embeddings: ModelEmbedding[] = [];

    constructor(apiKey?: string) {
        this.genAI = new GoogleGenAI({
            apiKey: apiKey || process.env.GEMINI_API_KEY || ''
        });
    }

    /**
     * Parse CSV data into structured AI model objects
     */
    parseCSVData(csvContent: string): AIModel[] {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const models: AIModel[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Handle CSV parsing with proper quote handling
            const values = this.parseCSVLine(line);
            if (values.length < headers.length) continue;

            const model: AIModel = {} as AIModel;
            headers.forEach((header, index) => {
                model[header] = values[index] || '';
            });

            // Only include models with meaningful data
            if (model.Model && model.Model.trim()) {
                models.push(model);
            }
        }

        return models;
    }

    /**
     * Parse a single CSV line handling quotes and commas
     */
    private parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        let i = 0;

        while (i < line.length) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    // Escaped quote
                    current += '"';
                    i += 2;
                } else {
                    // Toggle quote state
                    inQuotes = !inQuotes;
                    i++;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
                i++;
            } else {
                current += char;
                i++;
            }
        }

        result.push(current.trim());
        return result;
    }

    /**
     * Create a rich text representation of a model for embedding
     */
    createModelText(model: AIModel): string {
        const parts: string[] = [];

        // Basic info
        parts.push(`Model: ${model.Model}`);
        if (model.Organization) parts.push(`Organization: ${model.Organization}`);
        if (model['Publication date']) parts.push(`Published: ${model['Publication date']}`);

        // Technical details
        if (model.Parameters) parts.push(`Parameters: ${model.Parameters}`);
        if (model.Domain) parts.push(`Domain: ${model.Domain}`);
        if (model.Task) parts.push(`Tasks: ${model.Task}`);

        // Training info
        if (model['Training dataset']) parts.push(`Training Dataset: ${model['Training dataset']}`);
        if (model['Training dataset size (datapoints)']) {
            parts.push(`Dataset Size: ${model['Training dataset size (datapoints)']}`);
        }
        if (model['Training compute (FLOP)']) {
            parts.push(`Training Compute: ${model['Training compute (FLOP)']} FLOPs`);
        }

        // Context and significance
        if (model.Abstract) parts.push(`Abstract: ${model.Abstract}`);
        if (model['Notability criteria']) parts.push(`Notable for: ${model['Notability criteria']}`);
        if (model['Country (of organization)']) parts.push(`Country: ${model['Country (of organization)']}`);

        // Additional notes
        if (model['Parameters notes']) parts.push(`Parameter Notes: ${model['Parameters notes']}`);
        if (model['Frontier model'] && model['Frontier model'].toLowerCase() === 'true') {
            parts.push('This is a frontier model representing state-of-the-art capabilities.');
        }

        return parts.join('\n');
    }

    /**
     * Generate embedding for a single model
     */
    async generateModelEmbedding(model: AIModel): Promise<ModelEmbedding> {
        const textContent = this.createModelText(model);

        try {
            const response = await this.genAI.models.embedContent({
                model: 'text-embedding-004', // Updated to use the latest embedding model
                content: textContent,
            });

            return {
                id: this.generateModelId(model),
                model,
                embedding: response.embedding.values,
                textContent
            };
        } catch (error) {
            console.error(`Error generating embedding for ${model.Model}:`, error);
            throw error;
        }
    }

    /**
     * Generate embeddings for all models in the dataset
     */
    async generateAllEmbeddings(models: AIModel[], batchSize: number = 10): Promise<ModelEmbedding[]> {
        const embeddings: ModelEmbedding[] = [];

        console.log(`Generating embeddings for ${models.length} models...`);

        for (let i = 0; i < models.length; i += batchSize) {
            const batch = models.slice(i, i + batchSize);
            console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(models.length / batchSize)}`);

            const batchPromises = batch.map(model => this.generateModelEmbedding(model));

            try {
                const batchEmbeddings = await Promise.all(batchPromises);
                embeddings.push(...batchEmbeddings);

                // Add delay to respect rate limits
                if (i + batchSize < models.length) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            } catch (error) {
                console.error(`Error processing batch starting at index ${i}:`, error);
                // Continue with next batch
            }
        }

        this.embeddings = embeddings;
        return embeddings;
    }

    /**
     * Find similar models using cosine similarity
     */
    findSimilarModels(queryEmbedding: number[], topK: number = 5): Array<{ model: AIModel, similarity: number }> {
        const similarities = this.embeddings.map(item => ({
            model: item.model,
            similarity: this.cosineSimilarity(queryEmbedding, item.embedding)
        }));

        return similarities
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK);
    }

    /**
     * Search models by text query
     */
    async searchModels(query: string, topK: number = 5): Promise<Array<{ model: AIModel, similarity: number }>> {
        const response = await this.genAI.models.embedContent({
            model: 'text-embedding-004',
            content: query,
        });

        return this.findSimilarModels(response.embedding.values, topK);
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) return 0;

        let dotProduct = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    /**
     * Generate a unique ID for a model
     */
    private generateModelId(model: AIModel): string {
        const name = model.Model.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const org = model.Organization.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return `${org}-${name}`;
    }

    /**
     * Save embeddings to file
     */
    async saveEmbeddings(filePath: string): Promise<void> {
        const data = {
            timestamp: new Date().toISOString(),
            count: this.embeddings.length,
            embeddings: this.embeddings
        };

        await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
        console.log(`Saved ${this.embeddings.length} embeddings to ${filePath}`);
    }

    /**
     * Load embeddings from file
     */
    async loadEmbeddings(filePath: string): Promise<void> {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);
            this.embeddings = data.embeddings || [];
            console.log(`Loaded ${this.embeddings.length} embeddings from ${filePath}`);
        } catch (error) {
            console.error('Error loading embeddings:', error);
            this.embeddings = [];
        }
    }

    /**
     * Get embedding statistics
     */
    getStats() {
        if (this.embeddings.length === 0) return null;

        const organizations = new Set(this.embeddings.map(e => e.model.Organization));
        const domains = new Set(this.embeddings.map(e => e.model.Domain));
        const frontierModels = this.embeddings.filter(e => e.model['Frontier model']?.toLowerCase() === 'true');

        return {
            totalModels: this.embeddings.length,
            organizations: organizations.size,
            domains: domains.size,
            frontierModels: frontierModels.length,
            embeddingDimension: this.embeddings[0]?.embedding.length || 0
        };
    }
}

// Utility function to process the CSV file
export async function processAIModelsDataset(csvFilePath: string, apiKey?: string): Promise<AIModelsEmbeddingService> {
    const service = new AIModelsEmbeddingService(apiKey);

    // Read and parse CSV
    const csvContent = await fs.promises.readFile(csvFilePath, 'utf-8');
    const models = service.parseCSVData(csvContent);

    console.log(`Parsed ${models.length} models from dataset`);

    // Generate embeddings
    await service.generateAllEmbeddings(models);

    return service;
}