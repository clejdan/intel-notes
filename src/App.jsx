import { useState } from 'react'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
      {/* Three-panel layout */}
      <div className={styles.layout}>
        {/* Left Panel - Sidebar/Folders */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.appTitle}>IntelNotes</h2>
          </div>
          <div className={styles.sidebarContent}>
            <p>Folders will appear here</p>
          </div>
        </aside>

        {/* Middle Panel - Note List */}
        <div className={styles.noteList}>
          <div className={styles.noteListHeader}>
            <input
              type="search"
              placeholder="Search notes..."
              className={styles.searchInput}
            />
            <button className={styles.newNoteBtn}>+ New Note</button>
          </div>
          <div className={styles.noteListContent}>
            <p>Notes will appear here</p>
          </div>
        </div>

        {/* Right Panel - Note Editor */}
        <main className={styles.editor}>
          <div className={styles.editorHeader}>
            <button className={styles.aiBtn}>AI Chat</button>
          </div>
          <div className={styles.editorContent}>
            <p>Select a note to edit</p>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
