import { queryWithRAG } from './ragService'

// AI Provider types
export const AI_PROVIDERS = {
  LOCAL: 'local',
  OPENAI: 'openai',
}

// Current AI provider (default to OpenAI if API key is available)
let currentProvider = AI_PROVIDERS.OPENAI

// OpenAI API key (will be loaded from localStorage)
let openaiApiKey = null

// Singleton instance of the local text generation pipeline
let textGenerationPipeline = null
let isInitializing = false

// Set the AI provider
export function setAIProvider(provider) {
  if (provider === AI_PROVIDERS.LOCAL || provider === AI_PROVIDERS.OPENAI) {
    currentProvider = provider
    console.log('AI provider set to:', provider)
    return true
  }
  return false
}

// Get current AI provider
export function getAIProvider() {
  return currentProvider
}

// Set OpenAI API key
export function setOpenAIKey(key) {
  openaiApiKey = key
  if (key) {
    // Save to localStorage
    localStorage.setItem('openai_api_key', key)
    console.log('OpenAI API key saved')
  } else {
    localStorage.removeItem('openai_api_key')
  }
}

// Load OpenAI API key from localStorage
export function loadOpenAIKey() {
  const key = localStorage.getItem('openai_api_key')
  if (key) {
    openaiApiKey = key
    console.log('OpenAI API key loaded')
    return true
  }
  return false
}

// Check if OpenAI API key is set
export function hasOpenAIKey() {
  return !!openaiApiKey
}

// Initialize the local AI model using dynamic import
export async function initLocalAIModel() {
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
    console.log('Loading local AI model... This may take a minute on first load.')

    // Dynamic import to avoid loading ONNX runtime at startup
    const { pipeline, env } = await import('@xenova/transformers')

    // Configure for browser environment
    env.allowLocalModels = false
    env.useBrowserCache = true

    // Use a small text generation model
    textGenerationPipeline = await pipeline(
      'text2text-generation',
      'Xenova/LaMini-Flan-T5-783M',
      { quantized: true }
    )

    console.log('Local AI model loaded successfully!')
    return textGenerationPipeline
  } catch (error) {
    console.error('Error loading local AI model:', error)
    throw error
  } finally {
    isInitializing = false
  }
}

// Generate text using local AI model
async function generateTextLocal(prompt, options = {}) {
  try {
    const model = await initLocalAIModel()

    const defaultOptions = {
      max_length: 512,
      temperature: 0.7,
      top_k: 50,
      top_p: 0.95,
      do_sample: true,
      ...options,
    }

    console.log('Generating response with local AI...')
    const output = await model(prompt, defaultOptions)

    if (output && output.length > 0 && output[0].generated_text) {
      return output[0].generated_text
    }

    return 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('Error generating text with local AI:', error)
    throw error
  }
}

// Generate text using OpenAI API
async function generateTextOpenAI(prompt, options = {}) {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not set')
  }

  try {
    console.log('Generating response with OpenAI...')

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that answers questions based on the user\'s notes. Be concise and accurate.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 500,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'OpenAI API request failed')
    }

    const data = await response.json()

    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content
    }

    return 'Sorry, I could not generate a response.'
  } catch (error) {
    console.error('Error generating text with OpenAI:', error)
    throw error
  }
}

// Generate text (automatically uses current provider)
export async function generateText(prompt, options = {}) {
  if (currentProvider === AI_PROVIDERS.OPENAI && hasOpenAIKey()) {
    return await generateTextOpenAI(prompt, options)
  } else {
    // Fall back to local AI
    return await generateTextLocal(prompt, options)
  }
}

// Answer a question using RAG
export async function answerQuestion(question, onProgress) {
  try {
    // Load OpenAI key if available
    loadOpenAIKey()

    // Update progress
    if (onProgress) onProgress('Finding relevant notes...', 0.2)

    // Get RAG context
    const ragResult = await queryWithRAG(question)

    // Check if we have an OpenAI key or need to use local AI
    const useOpenAI = currentProvider === AI_PROVIDERS.OPENAI && hasOpenAIKey()

    // If no notes found, return a helpful message without calling AI
    if (ragResult.noNotesFound || ragResult.relevantNotes.length === 0) {
      if (onProgress) onProgress('Complete!', 1.0)
      return {
        answer: "I don't have any notes to search through yet. Try creating some notes first, then ask me questions about them!",
        relevantNotes: [],
        question: question,
        context: '',
        provider: useOpenAI ? 'OpenAI' : 'Local',
      }
    }

    if (onProgress) {
      const provider = useOpenAI ? 'OpenAI' : 'Local AI'
      onProgress(`Generating answer with ${provider}...`, 0.5)
    }

    // Generate answer using current provider
    const answer = await generateText(ragResult.prompt, {
      max_tokens: 500,
      temperature: 0.7,
    })

    if (onProgress) onProgress('Complete!', 1.0)

    return {
      answer: answer.trim(),
      relevantNotes: ragResult.relevantNotes,
      question: ragResult.question,
      context: ragResult.context,
      provider: useOpenAI ? 'OpenAI' : 'Local',
    }
  } catch (error) {
    console.error('Error answering question:', error)
    throw error
  }
}

// Check if AI is ready
export function isAIReady() {
  if (currentProvider === AI_PROVIDERS.OPENAI && hasOpenAIKey()) {
    return true // OpenAI doesn't need initialization
  }
  return textGenerationPipeline !== null
}

// Get AI status
export function getAIStatus() {
  if (currentProvider === AI_PROVIDERS.OPENAI && hasOpenAIKey()) {
    return {
      ready: true,
      loading: false,
      provider: 'OpenAI',
      needsKey: false,
    }
  }

  if (textGenerationPipeline) {
    return {
      ready: true,
      loading: false,
      provider: 'Local',
      needsKey: false,
    }
  }

  if (isInitializing) {
    return {
      ready: false,
      loading: true,
      provider: 'Local',
      needsKey: false,
    }
  }

  return {
    ready: false,
    loading: false,
    provider: currentProvider,
    needsKey: currentProvider === AI_PROVIDERS.OPENAI && !hasOpenAIKey(),
  }
}

export default {
  initLocalAIModel,
  generateText,
  answerQuestion,
  isAIReady,
  getAIStatus,
  setAIProvider,
  getAIProvider,
  setOpenAIKey,
  loadOpenAIKey,
  hasOpenAIKey,
  AI_PROVIDERS,
}
