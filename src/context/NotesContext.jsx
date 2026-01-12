import { createContext, useContext, useState, useEffect } from 'react'
import * as noteService from '../services/noteService'
import { initializeDatabase } from '../services/db'

const NotesContext = createContext()

export function NotesProvider({ children }) {
  const [notes, setNotes] = useState([])
  const [selectedNote, setSelectedNote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Initialize database and load notes
  useEffect(() => {
    async function init() {
      try {
        await initializeDatabase()
        await loadNotes()
      } catch (error) {
        console.error('Error initializing notes:', error)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Load all notes or search results
  async function loadNotes(query = searchQuery) {
    try {
      const allNotes = query
        ? await noteService.searchNotes(query)
        : await noteService.getAllNotes()
      setNotes(allNotes)
    } catch (error) {
      console.error('Error loading notes:', error)
    }
  }

  // Create a new note
  async function createNote(folderId) {
    try {
      const note = await noteService.createNote(folderId)
      await loadNotes()
      setSelectedNote(note)
      return note
    } catch (error) {
      console.error('Error creating note:', error)
      return null
    }
  }

  // Update a note
  async function updateNote(id, updates) {
    try {
      const updatedNote = await noteService.updateNote(id, updates)
      await loadNotes()
      setSelectedNote(updatedNote)
      return updatedNote
    } catch (error) {
      console.error('Error updating note:', error)
      return null
    }
  }

  // Delete a note
  async function deleteNote(id) {
    try {
      await noteService.deleteNote(id)
      if (selectedNote?.id === id) {
        setSelectedNote(null)
      }
      await loadNotes()
      return true
    } catch (error) {
      console.error('Error deleting note:', error)
      return false
    }
  }

  // Toggle pin
  async function togglePin(id) {
    try {
      await noteService.togglePinNote(id)
      await loadNotes()
      if (selectedNote?.id === id) {
        const updated = await noteService.getNoteById(id)
        setSelectedNote(updated)
      }
    } catch (error) {
      console.error('Error toggling pin:', error)
    }
  }

  // Search notes
  async function searchNotes(query) {
    setSearchQuery(query)
    await loadNotes(query)
  }

  const value = {
    notes,
    selectedNote,
    setSelectedNote,
    loading,
    searchQuery,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    searchNotes,
    refreshNotes: loadNotes,
  }

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
}

export function useNotes() {
  const context = useContext(NotesContext)
  if (!context) {
    throw new Error('useNotes must be used within NotesProvider')
  }
  return context
}

export default NotesContext
