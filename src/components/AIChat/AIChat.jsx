import { useState, useRef, useEffect } from 'react'
import { useAI } from '../../context/AIContext'
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
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  // Focus input when chat opens
  useEffect(() => {
    if (isAIChatOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isAIChatOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim() && !isLoading) {
      sendMessage(inputValue)
      setInputValue('')
    }
  }

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      saveApiKey(apiKeyInput.trim())
      setApiKeyInput('')
      setShowSettings(false)
    }
  }

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
            ⚙️
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
            <div className={styles.emptyIcon}>💬</div>
            <h4>Start a conversation</h4>
            <p>Ask questions about your notes and I'll help find answers!</p>
            <div className={styles.suggestions}>
              <p className={styles.suggestionsTitle}>Try asking:</p>
              <button
                className={styles.suggestionBtn}
                onClick={() => setInputValue('What are my main topics?')}
              >
                "What are my main topics?"
              </button>
              <button
                className={styles.suggestionBtn}
                onClick={() => setInputValue('Summarize my recent notes')}
              >
                "Summarize my recent notes"
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`${styles.message} ${
                  message.role === 'user' ? styles.userMessage : styles.aiMessage
                }`}
              >
                <div className={styles.messageContent}>
                  {message.content}
                </div>

                {/* Show relevant notes for AI responses */}
                {message.role === 'assistant' && message.relevantNotes && message.relevantNotes.length > 0 && (
                  <div className={styles.citations}>
                    <p className={styles.citationsTitle}>📎 Sources:</p>
                    {message.relevantNotes.map((item, idx) => (
                      <div key={idx} className={styles.citation}>
                        <span className={styles.citationTitle}>
                          {item.note.title}
                        </span>
                        <span className={styles.citationScore}>
                          {(item.score * 100).toFixed(0)}% match
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className={`${styles.message} ${styles.aiMessage}`}>
                <div className={styles.messageContent}>
                  <div className={styles.loadingDots}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  {loadingMessage && (
                    <span className={styles.loadingText}>{loadingMessage}</span>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question about your notes..."
          className={styles.input}
          disabled={isLoading}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={!inputValue.trim() || isLoading}
        >
          ➤
        </button>
      </form>
    </div>
  )
}

export default AIChat
