import { createContext, useContext, useState, useEffect } from 'react'
import * as folderService from '../services/folderService'

const FoldersContext = createContext()

export function FoldersProvider({ children }) {
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [loading, setLoading] = useState(true)

  // Load folders on mount
  useEffect(() => {
    loadFolders()
  }, [])

  // Load all folders
  async function loadFolders() {
    try {
      const allFolders = await folderService.getAllFolders()
      setFolders(allFolders)

      // Auto-select first folder if none selected
      if (!selectedFolder && allFolders.length > 0) {
        setSelectedFolder(allFolders[0])
      }
    } catch (error) {
      console.error('Error loading folders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get folder tree structure
  async function getFolderTree() {
    try {
      return await folderService.getFolderTree()
    } catch (error) {
      console.error('Error getting folder tree:', error)
      return []
    }
  }

  // Create a new folder
  async function createFolder(name, parentId = null) {
    try {
      const folder = await folderService.createFolder(name, parentId)
      await loadFolders()
      setSelectedFolder(folder)
      return folder
    } catch (error) {
      console.error('Error creating folder:', error)
      return null
    }
  }

  // Rename a folder
  async function renameFolder(id, newName) {
    try {
      await folderService.renameFolder(id, newName)
      await loadFolders()
      if (selectedFolder?.id === id) {
        const updated = await folderService.getFolderById(id)
        setSelectedFolder(updated)
      }
    } catch (error) {
      console.error('Error renaming folder:', error)
    }
  }

  // Delete a folder
  async function deleteFolder(id) {
    try {
      await folderService.deleteFolder(id)
      if (selectedFolder?.id === id) {
        const remaining = folders.filter(f => f.id !== id)
        setSelectedFolder(remaining[0] || null)
      }
      await loadFolders()
      return true
    } catch (error) {
      console.error('Error deleting folder:', error)
      return false
    }
  }

  const value = {
    folders,
    selectedFolder,
    setSelectedFolder,
    loading,
    createFolder,
    renameFolder,
    deleteFolder,
    refreshFolders: loadFolders,
    getFolderTree,
  }

  return (
    <FoldersContext.Provider value={value}>{children}</FoldersContext.Provider>
  )
}

export function useFolders() {
  const context = useContext(FoldersContext)
  if (!context) {
    throw new Error('useFolders must be used within FoldersProvider')
  }
  return context
}

export default FoldersContext
