# AI Models Embeddings System

This system creates semantic embeddings for the notable AI models dataset using Google's Gemini embedding model, enabling powerful semantic search and similarity analysis.

## Features

- **Semantic Search**: Find AI models using natural language queries
- **Similarity Analysis**: Discover models similar to a specific model
- **Rich Metadata**: Embeddings include model parameters, capabilities, organizations, and more
- **Caching**: Embeddings are cached to avoid regeneration
- **Rate Limiting**: Handles API rate limits with batching and delays

## Setup

1. **Install Dependencies**:
   ```bash
   npm install @google/genai
   ```

2. **Set Environment Variable**:
   ```bash
   export GEMINI_API_KEY="your-gemini-api-key"
   ```

3. **Generate Embeddings**:
   ```bash
   node scripts/generate-embeddings.js
   ```

## API Endpoints

### Generate Embeddings
```javascript
POST /api/ai-models-embeddings
{
  "action": "generate"
}
```

### Search Models
```javascript
POST /api/ai-models-embeddings
{
  "action": "search",
  "query": "multimodal models for vision tasks",
  "topK": 5
}
```

### Find Similar Models
```javascript
POST /api/ai-models-embeddings
{
  "action": "similar",
  "modelName": "GPT-4",
  "topK": 5
}
```

### Get Statistics
```javascript
POST /api/ai-models-embeddings
{
  "action": "stats"
}
```

## Usage Examples

### Basic Search
```javascript
const service = new AIModelsEmbeddingService(apiKey);
await service.loadEmbeddings('embeddings.json');

const results = await service.searchModels('code generation models', 5);
console.log(results);
```

### Find Similar Models
```javascript
const similar = await service.searchModels('GPT-4', 5);
console.log('Models similar to GPT-4:', similar);
```

### Custom Queries
- "large language models for reasoning"
- "multimodal vision and language models"
- "open source alternatives to GPT"
- "models trained on code datasets"
- "efficient small language models"

## Data Processing

The system processes the following model attributes for embedding:
- Model name and organization
- Technical specifications (parameters, compute)
- Capabilities and tasks
- Training data information
- Publication details and abstracts
- Notability criteria

## Performance

- **Embedding Dimension**: 768 (Gemini text-embedding-004)
- **Batch Processing**: 5-10 models per batch to respect rate limits
- **Caching**: Embeddings saved to JSON for reuse
- **Search Speed**: Sub-second similarity search on cached embeddings

## Integration

The embedding system is integrated into the Foundation page with:
- Interactive search interface in the right sidebar
- Real-time search results with similarity scores
- Model metadata display
- Statistics dashboard

## Rate Limits

The system handles Gemini API rate limits by:
- Processing models in small batches (5-10 at a time)
- Adding delays between batches (1 second)
- Graceful error handling and retry logic
- Caching results to avoid re-processing

## File Structure

```
lib/ai-models-embeddings.ts          # Core embedding service
app/api/ai-models-embeddings/route.ts # API endpoints
components/features/ai-model-search.tsx # React search component
scripts/generate-embeddings.js       # CLI generation script
public/data/ai_models_embeddings.json # Cached embeddings
```