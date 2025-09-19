/**
 * Script to generate embeddings for the AI models dataset
 * Run with: node scripts/generate-embeddings.js
 */

const { processAIModelsDataset } = require('../lib/ai-models-embeddings');
const path = require('path');

async function main() {
  try {
    console.log('Starting AI models embedding generation...');
    
    // Path to the CSV file
    const csvPath = path.join(__dirname, '..', 'public', 'data', 'notable_ai_models.csv');
    
    // Check if GEMINI_API_KEY is set
    if (!process.env.GEMINI_API_KEY) {
      console.error('Please set GEMINI_API_KEY environment variable');
      process.exit(1);
    }
    
    // Process the dataset
    const service = await processAIModelsDataset(csvPath, process.env.GEMINI_API_KEY);
    
    // Save embeddings
    const outputPath = path.join(__dirname, '..', 'public', 'data', 'ai_models_embeddings.json');
    await service.saveEmbeddings(outputPath);
    
    // Show stats
    const stats = service.getStats();
    console.log('Embedding generation complete!');
    console.log('Stats:', stats);
    
    // Test search
    console.log('\nTesting search functionality...');
    const searchResults = await service.searchModels('large language model for code generation', 3);
    console.log('Search results for "large language model for code generation":');
    searchResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.model.Model} (${result.model.Organization}) - Similarity: ${result.similarity.toFixed(3)}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();