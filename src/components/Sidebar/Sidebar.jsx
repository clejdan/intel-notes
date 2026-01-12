import { useState } from 'react'
import { useFolders } from '../../context/FoldersContext'
import { useNotes } from '../../context/NotesContext'
import styles from './Sidebar.module.css'

function Sidebar() {
  const { folders, selectedFolder, setSelectedFolder, createFolder, renameFolder, deleteFolder } = useFolders()
  const { createNote } = useNotes()
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolderId, setEditingFolderId] = useState(null)
  const [editingName, setEditingName] = useState('')

  const handleFolderClick = (folder, e) => {
    // Only select if not clicking on action buttons
    if (!e.target.closest('button')) {
      setSelectedFolder(folder)
    }
  }

  const handleNewFolder = () => {
    setIsCreatingFolder(true)
    setNewFolderName('')
  }

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim())
      setIsCreatingFolder(false)
      setNewFolderName('')
    }
  }

  const handleCancelCreate = () => {
    setIsCreatingFolder(false)
    setNewFolderName('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCreateFolder()
    } else if (e.key === 'Escape') {
      handleCancelCreate()
    }
  }

  // Rename folder
  const handleRenameFolder = (folder, e) => {
    e.stopPropagation()
    setEditingFolderId(folder.id)
    setEditingName(folder.name)
  }

  const handleSaveRename = async (folderId) => {
    if (editingName.trim() && editingName !== folders.find(f => f.id === folderId)?.name) {
      await renameFolder(folderId, editingName.trim())
    }
    setEditingFolderId(null)
    setEditingName('')
  }

  const handleRenameKeyDown = (e, folderId) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSaveRename(folderId)
    } else if (e.key === 'Escape') {
      setEditingFolderId(null)
      setEditingName('')
    }
  }

  // Delete folder
  const handleDeleteFolder = async (folder, e) => {
    e.stopPropagation()
    if (window.confirm(`Delete folder "${folder.name}" and all its notes?`)) {
      await deleteFolder(folder.id)
    }
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h2 className={styles.title}>IntelNotes</h2>
        <button
          className={styles.newFolderBtn}
          onClick={handleNewFolder}
          title="New Folder"
        >
          +
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.folderList}>
          {folders.map((folder) => (
            <div
              key={folder.id}
              className={`${styles.folderItem} ${
                selectedFolder?.id === folder.id ? styles.selected : ''
              }`}
              onClick={(e) => handleFolderClick(folder, e)}
            >
              <span className={styles.folderIcon}>📁</span>
              {editingFolderId === folder.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  onBlur={() => handleSaveRename(folder.id)}
                  onKeyDown={(e) => handleRenameKeyDown(e, folder.id)}
                  className={styles.input}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className={styles.folderName}>{folder.name}</span>
              )}
              <div className={styles.folderActions}>
                <button
                  className={styles.folderActionBtn}
                  onClick={(e) => handleRenameFolder(folder, e)}
                  title="Rename folder"
                >
                  ✏️
                </button>
                <button
                  className={styles.folderActionBtn}
                  onClick={(e) => handleDeleteFolder(folder, e)}
                  title="Delete folder"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}

          {isCreatingFolder && (
            <div className={styles.newFolderInput}>
              <span className={styles.folderIcon}>📁</span>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={handleKeyPress}
                onBlur={handleCreateFolder}
                placeholder="Folder name..."
                autoFocus
                className={styles.input}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
