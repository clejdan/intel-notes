import { pipeline } from '@xenova/transformers'
import { queryWithRAG } from './ragService'

// Singleton instance of the text generation pipeline
let textGenerationPipeline = null
let isInitializing = false

// Initialize the AI model
export async function initAIModel() {
  if (textGenerationPipeline) {
    return textGenerationPipeline
  }

  if (isInitializing) {
    // Wait for initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return textGenerationPipeline
  }

  try {
    isInitializing = true
    console.log('Loading AI model... This may take a minute on first load.')

    // Use a small text generation model
    // Xenova/LaMini-Flan-T5-783M is a good balance for local inference
    textGenerationPipeline = await pipeline(
      'text2text-generation',
      'Xenova/LaMini-Flan-T5-783M',
      { quantized: true }
    )

    console.log('AI model loaded successfully!')
    return textGenerationPipeline
  } catch (error) {
    console.error('Error loading AI model:', error)
    throw error
  } finally {
    isInitializing = false
  }
}

// Generate text using the local AI model
export async function generateText(prompt, options = {}) {
  try {
    const model = await initAIModel()

    const defaultOptions = {
      max_length: 512,
      temperature: 0.7,
      top_k: 50,
      top_p: 0.95,
      do_sample: true,
      ...options,
    }

    console.log('Generating response...')
    const output = await model(prompt, defaultOptions)

    if (output && output.length > 0 && output[0].generated_text) {
      return output[0].generated_text
    }

    return 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('Error generating text:', error)
    throw error
  }
}

// Answer a question using RAG
export async function answerQuestion(question, onProgress) {
  try {
    // Update progress
    if (onProgress) onProgress('Finding relevant notes...', 0.2)

    // Get RAG context
    const ragResult = await queryWithRAG(question)

    if (onProgress) onProgress('Generating answer...', 0.5)

    // Generate answer
    const answer = await generateText(ragResult.prompt, {
      max_length: 256,
      temperature: 0.7,
    })

    if (onProgress) onProgress('Complete!', 1.0)

    return {
      answer: answer.trim(),
      relevantNotes: ragResult.relevantNotes,
      question: ragResult.question,
      context: ragResult.context,
    }
  } catch (error) {
    console.error('Error answering question:', error)
    throw error
  }
}

// Check if AI is ready
export function isAIReady() {
  return textGenerationPipeline !== null
}

// Get AI status
export function getAIStatus() {
  if (textGenerationPipeline) {
    return { ready: true, loading: false }
  }
  if (isInitializing) {
    return { ready: false, loading: true }
  }
  return { ready: false, loading: false }
}

export default {
  initAIModel,
  generateText,
  answerQuestion,
  isAIReady,
  getAIStatus,
}
