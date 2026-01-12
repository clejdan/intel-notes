import { createContext, useContext, useState, useEffect } from 'react'
import { useNotes } from './NotesContext'
import * as aiService from '../services/aiService'
import * as embeddingService from '../services/embeddingService'
import { getEmbeddingStats } from '../services/ragService'

const AIContext = createContext()

export function AIProvider({ children }) {
  const { notes } = useNotes()
  const [isAIChatOpen, setIsAIChatOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [modelStatus, setModelStatus] = useState({
    embeddingReady: false,
    aiReady: false,
    loading: false,
  })
  const [embeddingStats, setEmbeddingStats] = useState({
    totalNotes: 0,
    embeddedNotes: 0,
    missingEmbeddings: 0,
  })

  // Update embedding stats when notes change
  useEffect(() => {
    updateEmbeddingStats()
  }, [notes])

  // Update embedding statistics
  async function updateEmbeddingStats() {
    const stats = await getEmbeddingStats()
    setEmbeddingStats(stats)
  }

  // Initialize AI models
  async function initializeAI() {
    try {
      setModelStatus(prev => ({ ...prev, loading: true }))
      setLoadingMessage('Initializing AI models...')

      // Initialize embedding model first
      await embeddingService.initEmbeddingModel()
      setModelStatus(prev => ({ ...prev, embeddingReady: true }))

      // Embed any missing notes
      if (embeddingStats.missingEmbeddings > 0) {
        setLoadingMessage(`Embedding ${embeddingStats.missingEmbeddings} notes...`)
        await embeddingService.embedMissingNotes(notes)
        await updateEmbeddingStats()
      }

      // Initialize AI model
      setLoadingMessage('Loading AI model...')
      await aiService.initAIModel()
      setModelStatus(prev => ({ ...prev, aiReady: true }))

      setLoadingMessage('')
      console.log('AI initialized successfully!')
    } catch (error) {
      console.error('Error initializing AI:', error)
      setLoadingMessage('Error loading AI. Please refresh and try again.')
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
      // Get AI response with RAG
      const result = await aiService.answerQuestion(userMessage, (msg, progress) => {
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

      // Add error message
      const errorMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
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

  // Embed a specific note
  async function embedNote(note) {
    try {
      await embeddingService.embedNote(note)
      await updateEmbeddingStats()
      return true
    } catch (error) {
      console.error('Error embedding note:', error)
      return false
    }
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
    embeddingStats,
    initializeAI,
    embedNote,
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
