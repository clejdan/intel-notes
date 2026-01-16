import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import { useNotes } from '../../context/NotesContext'
import { useAI } from '../../context/AIContext'
import { formatFullDate } from '../../utils/dateFormat'
import { debounce } from '../../utils/debounce'
import { APP_CONFIG } from '../../constants/config'
import styles from './NoteEditor.module.css'

// Toolbar button component
function ToolbarButton({ onClick, isActive, title, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.toolbarBtn} ${isActive ? styles.toolbarBtnActive : ''}`}
      title={title}
    >
      {children}
    </button>
  )
}

// Editor toolbar component
function EditorToolbar({ editor }) {
  if (!editor) return null

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarGroup}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>
      </div>

      <div className={styles.toolbarDivider} />

      <div className={styles.toolbarGroup}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <u>U</u>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <s>S</s>
        </ToolbarButton>
      </div>

      <div className={styles.toolbarDivider} />

      <div className={styles.toolbarGroup}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          •
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          1.
        </ToolbarButton>
      </div>

      <div className={styles.toolbarDivider} />

      <div className={styles.toolbarGroup}>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          "
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          title="Code Block"
        >
          {'</>'}
        </ToolbarButton>
      </div>
    </div>
  )
}

function NoteEditor() {
  const { selectedNote, updateNote, togglePin, deleteNote } = useNotes()
  const { toggleAIChat, isAIChatOpen } = useAI()
  const [title, setTitle] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const titleInputRef = useRef(null)

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

  // Initialize TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: 'Start writing...',
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      if (selectedNote) {
        const html = editor.getHTML()
        debouncedSave(selectedNote.id, html)
      }
    },
  })

  // Update editor content when selected note changes
  useEffect(() => {
    if (selectedNote && editor) {
      // Only update if content is different to avoid cursor jumping
      const currentContent = editor.getHTML()
      if (currentContent !== selectedNote.content) {
        editor.commands.setContent(selectedNote.content || '')
      }
      setTitle(selectedNote.title || 'Untitled')
    } else if (editor) {
      editor.commands.setContent('')
      setTitle('')
    }
  }, [selectedNote, editor])

  // Focus title input when editing
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus()
      titleInputRef.current.select()
    }
  }, [isEditingTitle])

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
            className={`${styles.actionBtn} ${selectedNote.isPinned ? styles.pinned : ''}`}
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

      <EditorToolbar editor={editor} />

      <div className={styles.editorContent}>
        <EditorContent editor={editor} className={styles.tiptap} />
      </div>
    </div>
  )
}

export default NoteEditor
