import { queryWithRAG } from './ragService'

// OpenAI API key (loaded from localStorage)
let openaiApiKey = null

// Set OpenAI API key
export function setOpenAIKey(key) {
  openaiApiKey = key
  if (key) {
    localStorage.setItem('openai_api_key', key)
  } else {
    localStorage.removeItem('openai_api_key')
  }
}

// Load OpenAI API key from localStorage
export function loadOpenAIKey() {
  const key = localStorage.getItem('openai_api_key')
  if (key) {
    openaiApiKey = key
    return true
  }
  return false
}

// Check if OpenAI API key is set
export function hasOpenAIKey() {
  return !!openaiApiKey
}

// Generate text using OpenAI API
async function generateText(prompt, options = {}) {
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not set')
  }

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
}

// Answer a question using RAG
export async function answerQuestion(question, onProgress) {
  loadOpenAIKey()

  if (onProgress) onProgress('Finding relevant notes...', 0.2)

  const ragResult = await queryWithRAG(question)

  // If no notes found, return helpful message
  if (ragResult.noNotesFound || ragResult.relevantNotes.length === 0) {
    if (onProgress) onProgress('Complete!', 1.0)
    return {
      answer: "I don't have any notes to search through yet. Try creating some notes first, then ask me questions about them!",
      relevantNotes: [],
      question: question,
      context: '',
      provider: 'OpenAI',
    }
  }

  if (onProgress) onProgress('Generating answer with OpenAI...', 0.5)

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
    provider: 'OpenAI',
  }
}

// Stub functions for API compatibility
export function setAIProvider() {}
export function getAIProvider() { return 'openai' }
export function isAIReady() { return hasOpenAIKey() }
export function getAIStatus() {
  return {
    ready: hasOpenAIKey(),
    loading: false,
    provider: 'OpenAI',
    needsKey: !hasOpenAIKey(),
  }
}

export const AI_PROVIDERS = { LOCAL: 'local', OPENAI: 'openai' }

export default {
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
