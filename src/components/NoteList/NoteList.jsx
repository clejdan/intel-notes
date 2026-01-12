import { useNotes } from '../../context/NotesContext'
import { useFolders } from '../../context/FoldersContext'
import { formatDate } from '../../utils/dateFormat'
import { getPreview } from '../../utils/textUtils'
import styles from './NoteList.module.css'

function NoteList() {
  const {
    notes,
    selectedNote,
    setSelectedNote,
    createNote,
    searchNotes,
    searchQuery,
  } = useNotes()
  const { selectedFolder } = useFolders()

  // Filter notes by selected folder
  const filteredNotes = selectedFolder
    ? notes.filter(note => note.folderId === selectedFolder.id)
    : notes

  const handleNewNote = async () => {
    if (selectedFolder) {
      await createNote(selectedFolder.id)
    }
  }

  const handleSearch = (e) => {
    searchNotes(e.target.value)
  }

  const handleNoteClick = (note) => {
    setSelectedNote(note)
  }

  return (
    <div className={styles.noteList}>
      <div className={styles.header}>
        <input
          type="search"
          placeholder="Search notes..."
          value={searchQuery}
          onChange={handleSearch}
          className={styles.searchInput}
        />
        <button
          className={styles.newNoteBtn}
          onClick={handleNewNote}
          disabled={!selectedFolder}
        >
          + New Note
        </button>
      </div>

      <div className={styles.content}>
        {filteredNotes.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No notes yet</p>
            <p className={styles.emptyHint}>
              Click "+ New Note" to create your first note
            </p>
          </div>
        ) : (
          <div className={styles.noteItems}>
            {filteredNotes.map((note) => (
              <div
                key={note.id}
                className={`${styles.noteItem} ${
                  selectedNote?.id === note.id ? styles.selected : ''
                }`}
                onClick={() => handleNoteClick(note)}
              >
                <div className={styles.noteHeader}>
                  <h3 className={styles.noteTitle}>
                    {note.isPinned && (
                      <span className={styles.pinIcon}>📌</span>
                    )}
                    {note.title}
                  </h3>
                  <span className={styles.noteDate}>
                    {formatDate(note.updatedAt)}
                  </span>
                </div>
                <p className={styles.notePreview}>
                  {getPreview(note.content)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NoteList
