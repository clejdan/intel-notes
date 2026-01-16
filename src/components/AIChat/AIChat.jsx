import { useState, useRef, useEffect } from 'react'
import { useAI } from '../../context/AIContext'
import { useNotes } from '../../context/NotesContext'
import { formatTime } from '../../utils/dateFormat'
import styles from './AIChat.module.css'

function AIChat() {
  const {
    isAIChatOpen,
    toggleAIChat,
    messages,
    sendMessage,
    clearChat,
    isLoading,
    loadingMessage,
    modelStatus,
    embeddingStats,
    saveApiKey,
    hasApiKey,
    showSettings,
    setShowSettings,
  } = useAI()

  const [inputValue, setInputValue] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [collapsedCitations, setCollapsedCitations] = useState({})
  const messagesEndRef = useRef(null)
  const textareaRef = useRef(null)

  const { setSelectedNote } = useNotes()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesEndRef.current) {
      // Safari-friendly scroll with fallback
      try {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
      } catch {
        messagesEndRef.current.scrollIntoView(false)
      }
    }
  }, [messages, isLoading])

  // Focus textarea when chat opens
  useEffect(() => {
    if (isAIChatOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isAIChatOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue)
      setInputValue('')
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      saveApiKey(apiKeyInput.trim())
      setApiKeyInput('')
      setShowSettings(false)
    }
  }

  const handleCopyMessage = async (content, messageId) => {
    try {
      // Use clipboard API with fallback for Safari
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content)
      } else {
        // Fallback for Safari and non-HTTPS contexts
        const textArea = document.createElement('textarea')
        textArea.value = content
        textArea.style.position = 'fixed'
        textArea.style.left = '-9999px'
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
      }
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleRegenerate = () => {
    // Find the last user message and resend it
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content)
    }
  }

  const toggleCitationCollapse = (messageId) => {
    setCollapsedCitations((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }))
  }

  const handleCitationClick = (note) => {
    if (note) {
      setSelectedNote(note)
    }
  }

  const handleTextareaInput = (e) => {
    setInputValue(e.target.value)
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Get last AI message for regenerate button
  const lastAiMessageIndex = [...messages].reverse().findIndex((m) => m.role === 'assistant')
  const lastAiMessageId = lastAiMessageIndex >= 0 ? messages[messages.length - 1 - lastAiMessageIndex]?.id : null

  if (!isAIChatOpen) {
    return null
  }

  return (
    <div className={styles.aiChat}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h3 className={styles.title}>AI Chat</h3>
          <span className={styles.subtitle}>
            Ask questions about your notes
          </span>
        </div>
        <div className={styles.headerActions}>
          <button
            onClick={() => setShowSettings(true)}
            className={styles.settingsBtn}
            title="Settings"
          >
            ⚙
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className={styles.clearBtn}
              title="Clear chat"
            >
              🗑️
            </button>
          )}
          <button
            onClick={toggleAIChat}
            className={styles.closeBtn}
            title="Close chat"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className={styles.settingsModal}>
          <div className={styles.modalContent}>
            <h4>OpenAI Settings</h4>
            <p className={styles.modalDescription}>
              Enter your OpenAI API key to use GPT-3.5/4 for better responses.
            </p>
            <div className={styles.inputGroup}>
              <label htmlFor="apiKey">API Key</label>
              <input
                id="apiKey"
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="sk-..."
                className={styles.apiKeyInput}
                autoFocus
              />
              <p className={styles.hint}>
                {hasApiKey ? '✓ API key is set' : 'Get your key from platform.openai.com'}
              </p>
            </div>
            <div className={styles.modalActions}>
              <button
                onClick={() => {
                  setShowSettings(false)
                  setApiKeyInput('')
                }}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveApiKey}
                className={styles.saveBtn}
                disabled={!apiKeyInput.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status indicator */}
      {modelStatus.loading && (
        <div className={styles.statusBar}>
          <div className={styles.loadingSpinner}></div>
          <span>{loadingMessage}</span>
        </div>
      )}

      {!modelStatus.aiReady && !modelStatus.loading && (
        <div className={styles.statusBar}>
          <span>⚠️ AI model not loaded yet. Send a message to initialize.</span>
        </div>
      )}

      {embeddingStats.missingEmbeddings > 0 && !modelStatus.loading && (
        <div className={styles.statusBar}>
          <span>
            📊 {embeddingStats.missingEmbeddings} notes need to be embedded
          </span>
        </div>
      )}

      {/* Messages area */}
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIconWrapper}>
              <svg
                className={styles.emptyIcon}
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="8" y="12" width="48" height="40" rx="4" stroke="currentColor" strokeWidth="2" />
                <circle cx="20" cy="28" r="3" fill="currentColor" />
                <circle cx="32" cy="28" r="3" fill="currentColor" />
                <circle cx="44" cy="28" r="3" fill="currentColor" />
                <path d="M16 40h32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h4>Start a conversation</h4>
            <p>Ask questions about your notes and I'll help find relevant information.</p>
            <div className={styles.suggestions}>
              <p className={styles.suggestionsTitle}>Try asking:</p>
              <button
                className={styles.suggestionCard}
                onClick={() => setInputValue('What are my main topics?')}
              >
                <span className={styles.suggestionIcon}>📋</span>
                <span className={styles.suggestionText}>What are my main topics?</span>
              </button>
              <button
                className={styles.suggestionCard}
                onClick={() => setInputValue('Summarize my recent notes')}
              >
                <span className={styles.suggestionIcon}>📝</span>
                <span className={styles.suggestionText}>Summarize my recent notes</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isUser = message.role === 'user'
              const isLastAiMessage = message.id === lastAiMessageId
              const hasCitations =
                message.role === 'assistant' &&
                message.relevantNotes &&
                message.relevantNotes.length > 0
              const citationsCollapsed = collapsedCitations[message.id]

              return (
                <div
                  key={message.id}
                  className={`${styles.messageWrapper} ${isUser ? styles.userWrapper : styles.aiWrapper}`}
                >
                  <div className={styles.avatar}>
                    {isUser ? '👤' : '🤖'}
                  </div>
                  <div className={styles.messageBody}>
                    <div
                      className={`${styles.messageBubble} ${
                        isUser ? styles.userBubble : styles.aiBubble
                      }`}
                    >
                      <div className={styles.messageContent}>{message.content}</div>

                      {/* Message actions for AI messages */}
                      {!isUser && (
                        <div className={styles.messageActions}>
                          <button
                            className={styles.actionBtn}
                            onClick={() => handleCopyMessage(message.content, message.id)}
                            title="Copy message"
                          >
                            {copiedId === message.id ? '✓' : '📋'}
                          </button>
                          {isLastAiMessage && !isLoading && (
                            <button
                              className={styles.actionBtn}
                              onClick={handleRegenerate}
                              title="Regenerate response"
                            >
                              ↻
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <span className={styles.timestamp}>
                      {formatTime(message.timestamp)}
                    </span>

                    {/* Citations section */}
                    {hasCitations && (
                      <div className={styles.citations}>
                        <button
                          className={styles.citationsHeader}
                          onClick={() => toggleCitationCollapse(message.id)}
                        >
                          <span className={styles.citationsTitle}>
                            📎 {message.relevantNotes.length} source
                            {message.relevantNotes.length > 1 ? 's' : ''}
                          </span>
                          <span
                            className={`${styles.citationsChevron} ${
                              citationsCollapsed ? styles.collapsed : ''
                            }`}
                          >
                            ▼
                          </span>
                        </button>
                        {!citationsCollapsed && (
                          <div className={styles.citationsList}>
                            {message.relevantNotes.map((item, idx) => (
                              <button
                                key={idx}
                                className={styles.citation}
                                onClick={() => handleCitationClick(item.note)}
                                title="Click to view note"
                              >
                                <span className={styles.citationTitle}>
                                  {item.note.title}
                                </span>
                                <div className={styles.citationScoreWrapper}>
                                  <div
                                    className={styles.citationScoreBar}
                                    style={{ width: `${item.score * 100}%` }}
                                  />
                                  <span className={styles.citationScore}>
                                    {(item.score * 100).toFixed(0)}%
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className={`${styles.messageWrapper} ${styles.aiWrapper}`}>
                <div className={styles.avatar}>🤖</div>
                <div className={styles.messageBody}>
                  <div className={`${styles.messageBubble} ${styles.aiBubble}`}>
                    <div className={styles.typingIndicator}>
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    {loadingMessage && (
                      <span className={styles.loadingText}>{loadingMessage}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <div className={styles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about your notes..."
            className={styles.textarea}
            disabled={isLoading}
            rows={1}
          />
          <span className={styles.inputHint}>Enter to send</span>
        </div>
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!inputValue.trim() || isLoading}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  )
}

export default AIChat
