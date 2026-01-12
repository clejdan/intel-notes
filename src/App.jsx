import { useRef } from 'react'
import { NotesProvider, useNotes } from './context/NotesContext'
import { FoldersProvider, useFolders } from './context/FoldersContext'
import { AIProvider } from './context/AIContext'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import Sidebar from './components/Sidebar/Sidebar'
import NoteList from './components/NoteList/NoteList'
import NoteEditor from './components/NoteEditor/NoteEditor'
import AIChat from './components/AIChat/AIChat'
import styles from './App.module.css'

function AppContent() {
  const { createNote } = useNotes()
  const { selectedFolder } = useFolders()
  const searchInputRef = useRef(null)

  // Define keyboard shortcuts
  const shortcuts = [
    {
      key: 'n',
      ctrl: true,
      callback: () => {
        if (selectedFolder) {
          createNote(selectedFolder.id)
        }
      },
    },
    {
      key: 'f',
      ctrl: true,
      callback: () => {
        // Focus search input if available
        const searchInput = document.querySelector('input[type="search"]')
        if (searchInput) {
          searchInput.focus()
        }
      },
    },
  ]

  useKeyboardShortcuts(shortcuts)

  return (
    <div className={styles.app}>
      <div className={styles.layout}>
        {/* Left Panel - Sidebar/Folders */}
        <Sidebar />

        {/* Middle Panel - Note List */}
        <NoteList />

        {/* Right Panel - Note Editor */}
        <NoteEditor />
      </div>

      {/* AI Chat Panel */}
      <AIChat />
    </div>
  )
}

function App() {
  return (
    <FoldersProvider>
      <NotesProvider>
        <AIProvider>
          <AppContent />
        </AIProvider>
      </NotesProvider>
    </FoldersProvider>
  )
}

export default App
