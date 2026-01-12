import db from './db'
import { generateId } from '../utils/uuid'
import { extractTitle } from '../utils/textUtils'

// Create a new note
export async function createNote(folderId, content = '') {
  const now = Date.now()
  const note = {
    id: generateId(),
    title: extractTitle(content) || 'Untitled',
    content,
    folderId: folderId || 'default-folder',
    isPinned: false,
    createdAt: now,
    updatedAt: now,
    embedding: null,
  }

  try {
    await db.notes.add(note)
    console.log('Note created:', note.id)
    return note
  } catch (error) {
    console.error('Error creating note:', error)
    throw error
  }
}

// Get all notes
export async function getAllNotes() {
  try {
    const notes = await db.notes.toArray()
    // Sort by pinned first, then by updatedAt descending
    return notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.updatedAt - a.updatedAt
    })
  } catch (error) {
    console.error('Error getting all notes:', error)
    return []
  }
}

// Get notes by folder
export async function getNotesByFolder(folderId) {
  try {
    const notes = await db.notes.where('folderId').equals(folderId).toArray()
    // Sort by pinned first, then by updatedAt descending
    return notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1
      return b.updatedAt - a.updatedAt
    })
  } catch (error) {
    console.error('Error getting notes by folder:', error)
    return []
  }
}

// Get a single note by ID
export async function getNoteById(id) {
  try {
    return await db.notes.get(id)
  } catch (error) {
    console.error('Error getting note:', error)
    return null
  }
}

// Update a note
export async function updateNote(id, updates) {
  try {
    const currentNote = await db.notes.get(id)
    if (!currentNote) {
      throw new Error('Note not found')
    }

    const updatedData = {
      ...updates,
      updatedAt: Date.now(),
    }

    // Auto-update title if content changed
    if (updates.content !== undefined) {
      updatedData.title = extractTitle(updates.content) || 'Untitled'
    }

    await db.notes.update(id, updatedData)
    console.log('Note updated:', id)

    return await db.notes.get(id)
  } catch (error) {
    console.error('Error updating note:', error)
    throw error
  }
}

// Delete a note
export async function deleteNote(id) {
  try {
    await db.notes.delete(id)
    // Also delete associated embedding
    await db.embeddings.where('noteId').equals(id).delete()
    console.log('Note deleted:', id)
    return true
  } catch (error) {
    console.error('Error deleting note:', error)
    throw error
  }
}

// Toggle pin status
export async function togglePinNote(id) {
  try {
    const note = await db.notes.get(id)
    if (!note) {
      throw new Error('Note not found')
    }

    await db.notes.update(id, { isPinned: !note.isPinned })
    console.log('Note pin toggled:', id)
    return await db.notes.get(id)
  } catch (error) {
    console.error('Error toggling pin:', error)
    throw error
  }
}

// Search notes by text
export async function searchNotes(query) {
  if (!query || query.trim() === '') {
    return await getAllNotes()
  }

  try {
    const allNotes = await db.notes.toArray()
    const lowerQuery = query.toLowerCase()

    // Filter notes that match the query in title or content
    const matchedNotes = allNotes.filter(note => {
      const titleMatch = note.title.toLowerCase().includes(lowerQuery)
      const contentMatch = note.content.toLowerCase().includes(lowerQuery)
      return titleMatch || contentMatch
    })

    // Sort by relevance (title matches first, then by updated date)
    return matchedNotes.sort((a, b) => {
      const aTitleMatch = a.title.toLowerCase().includes(lowerQuery)
      const bTitleMatch = b.title.toLowerCase().includes(lowerQuery)

      if (aTitleMatch && !bTitleMatch) return -1
      if (!aTitleMatch && bTitleMatch) return 1

      if (a.isPinned && !b.isPinned) return -1
      if (!a.isPinned && b.isPinned) return 1

      return b.updatedAt - a.updatedAt
    })
  } catch (error) {
    console.error('Error searching notes:', error)
    return []
  }
}

export default {
  createNote,
  getAllNotes,
  getNotesByFolder,
  getNoteById,
  updateNote,
  deleteNote,
  togglePinNote,
  searchNotes,
}
