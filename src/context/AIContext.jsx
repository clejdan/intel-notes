import { createContext, useContext, useState, useEffect } from 'react'
import { useNotes } from './NotesContext'
import * as aiService from '../services/aiService'

const AIContext = createContext()

export function AIProvider({ children }) {
  const { notes } = useNotes()
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [modelStatus, setModelStatus] = useState({
    embeddingReady: true, // Using keyword search, no embeddings needed
    aiReady: false,
    loading: false,
  })
  const [aiProvider, setAiProvider] = useState('openai')
  const [hasApiKey, setHasApiKey] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // Load API key on mount
  useEffect(() => {
    const hasKey = aiService.loadOpenAIKey()
    setHasApiKey(hasKey)
    if (hasKey) {
      setModelStatus(prev => ({ ...prev, aiReady: true }))
    }
  }, [])

  // Initialize AI (for OpenAI, just check if key exists)
  async function initializeAI() {
    try {
      setModelStatus(prev => ({ ...prev, loading: true }))
      setLoadingMessage('Initializing AI...')

      // For OpenAI, we just need the API key
      if (aiProvider === 'openai' && hasApiKey) {
        setModelStatus(prev => ({ ...prev, aiReady: true }))
        setLoadingMessage('')
        console.log('AI initialized successfully!')
      } else if (aiProvider === 'openai' && !hasApiKey) {
        setModelStatus(prev => ({ ...prev, aiReady: false }))
        setLoadingMessage('OpenAI API key required. Click settings to add your key.')
      }
    } catch (error) {
      console.error('Error initializing AI:', error)
      setLoadingMessage('Error initializing AI.')
    } finally {
      setModelStatus(prev => ({ ...prev, loading: false }))
    }
  }

  // Send a message to the AI
  async function sendMessage(userMessage) {
    if (!userMessage.trim()) return

    // Add user message
    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    }
    setMessages(prev => [...prev, userMsg])

    // Set loading state
    setIsLoading(true)
    setLoadingMessage('Thinking...')

    try {
      // Get AI response with RAG (using keyword search)
      const result = await aiService.answerQuestion(userMessage, (msg) => {
        setLoadingMessage(msg)
      })

      // Add AI response
      const aiMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.answer,
        relevantNotes: result.relevantNotes,
        timestamp: Date.now(),
      }
      setMessages(prev => [...prev, aiMsg])
    } catch (error) {
      console.error('Error getting AI response:', error)

      // Add error message with more detail
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: hasApiKey
          ? 'Sorry, I encountered an error. Please check your API key and try again.'
          : 'Please add your OpenAI API key in settings to use the AI chat.',
        timestamp: Date.now(),
        isError: true,
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  // Clear chat history
  function clearChat() {
    setMessages([])
  }

  // Toggle AI chat panel
  function toggleAIChat() {
    setIsAIChatOpen(prev => !prev)

    // Initialize AI on first open if not already initialized
    if (!isAIChatOpen && !modelStatus.aiReady && !modelStatus.loading) {
      initializeAI()
    }
  }

  // Save OpenAI API key
  function saveApiKey(key) {
    aiService.setOpenAIKey(key)
    setHasApiKey(!!key)
    if (key) {
      setModelStatus(prev => ({ ...prev, aiReady: true }))
    }
  }

  // Change AI provider
  function changeProvider(provider) {
    aiService.setAIProvider(provider)
    setAiProvider(provider)
  }

  const value = {
    isAIChatOpen,
    toggleAIChat,
    messages,
    sendMessage,
    clearChat,
    isLoading,
    loadingMessage,
    modelStatus,
    embeddingStats: { totalNotes: notes.length, embeddedNotes: 0, missingEmbeddings: 0 },
    initializeAI,
    embedNote: async () => true, // No-op since we use keyword search
    saveApiKey,
    changeProvider,
    aiProvider,
    hasApiKey,
    showSettings,
    setShowSettings,
  }

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>
}

export function useAI() {
  const context = useContext(AIContext)
  if (!context) {
    throw new Error('useAI must be used within AIProvider')
  }
  return context
}

export default AIContext
