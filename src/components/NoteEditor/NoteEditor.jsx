import { useState, useEffect, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useNotes } from '../../context/NotesContext'
import { useAI } from '../../context/AIContext'
import { formatFullDate } from '../../utils/dateFormat'
import { debounce } from '../../utils/debounce'
import { APP_CONFIG } from '../../constants/config'
import styles from './NoteEditor.module.css'

function NoteEditor() {
  const { selectedNote, updateNote, togglePin, deleteNote } = useNotes()
  const { toggleAIChat, isAIChatOpen } = useAI()
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const quillRef = useRef(null)
  const titleInputRef = useRef(null)

  // Load selected note content and title
  useEffect(() => {
    if (selectedNote) {
      setContent(selectedNote.content || '')
      setTitle(selectedNote.title || 'Untitled')
    } else {
      setContent('')
      setTitle('')
    }
  }, [selectedNote])

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

  // Debounced save function
  const debouncedSave = useRef(
    debounce(async (noteId, newContent) => {
      if (!noteId) return

      setIsSaving(true)
      try {
        await updateNote(noteId, { content: newContent })
      } catch (error) {
        console.error('Error saving note:', error)
      } finally {
        setIsSaving(false)
      }
    }, APP_CONFIG.autoSaveDelay)
  ).current

  // Handle content change
  const handleChange = (value) => {
    setContent(value)
    if (selectedNote) {
      debouncedSave(selectedNote.id, value)
    }
  }

  // Handle pin toggle
  const handleTogglePin = async () => {
    if (selectedNote) {
      await togglePin(selectedNote.id)
    }
  }

  // Handle delete note
  const handleDeleteNote = async () => {
    if (selectedNote && window.confirm(`Delete "${selectedNote.title}"?`)) {
      await deleteNote(selectedNote.id)
    }
  }

  // Handle title click - start editing
  const handleTitleClick = () => {
    setIsEditingTitle(true)
  }

  // Handle title change
  const handleTitleChange = (e) => {
    setTitle(e.target.value)
  }

  // Handle title save
  const handleTitleSave = async () => {
    if (selectedNote && title.trim()) {
      setIsSaving(true)
      try {
        await updateNote(selectedNote.id, { title: title.trim() })
      } catch (error) {
        console.error('Error updating title:', error)
      } finally {
        setIsSaving(false)
        setIsEditingTitle(false)
      }
    } else if (selectedNote && !title.trim()) {
      // Revert to original title if empty
      setTitle(selectedNote.title)
      setIsEditingTitle(false)
    }
  }

  // Handle title keyboard events
  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleTitleSave()
    } else if (e.key === 'Escape') {
      setTitle(selectedNote.title)
      setIsEditingTitle(false)
    }
  }

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'code-block'],
      ['link'],
      ['clean'],
    ],
  }

  const formats = [
    'header',
    'bold',
    'italic',
    'underline',
    'strike',
    'list',
    'bullet',
    'blockquote',
    'code-block',
    'link',
  ]

  if (!selectedNote) {
    return (
      <div className={styles.editor}>
        <div className={styles.emptyState}>
          <h2>No note selected</h2>
          <p>Select a note from the list or create a new one</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <div className={styles.noteInfo}>
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={handleTitleChange}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              className={styles.titleInput}
              placeholder="Note title..."
            />
          ) : (
            <h1
              className={styles.noteTitle}
              onClick={handleTitleClick}
              title="Click to edit title"
            >
              {selectedNote.title}
            </h1>
          )}
          <p className={styles.noteDate}>
            {formatFullDate(selectedNote.updatedAt)}
            {isSaving && (
              <span className={styles.savingIndicator}> • Saving...</span>
            )}
          </p>
        </div>
        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${
              selectedNote.isPinned ? styles.pinned : ''
            }`}
            onClick={handleTogglePin}
            title={selectedNote.isPinned ? 'Unpin note' : 'Pin note'}
          >
            📌
          </button>
          <button
            className={styles.deleteBtn}
            onClick={handleDeleteNote}
            title="Delete note"
          >
            🗑️
          </button>
          <button
            className={`${styles.aiBtn} ${isAIChatOpen ? styles.aiBtnActive : ''}`}
            onClick={toggleAIChat}
            title={isAIChatOpen ? 'Close AI Chat' : 'Open AI Chat'}
          >
            🤖 AI Chat
          </button>
        </div>
      </div>

      <div className={styles.editorContent}>
        <ReactQuill
          ref={quillRef}
          value={content}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          theme="snow"
          placeholder="Start writing..."
          className={styles.quill}
        />
      </div>
    </div>
  )
}

export default NoteEditor
