import db from './db'
import { generateId } from '../utils/uuid'

// Create a new folder
export async function createFolder(name, parentId = null) {
  const folder = {
    id: generateId(),
    name: name || 'New Folder',
    parentId,
    createdAt: Date.now(),
  }

  try {
    await db.folders.add(folder)
    console.log('Folder created:', folder.id)
    return folder
  } catch (error) {
    console.error('Error creating folder:', error)
    throw error
  }
}

// Get all folders
export async function getAllFolders() {
  try {
    const folders = await db.folders.toArray()
    // Sort by createdAt ascending
    return folders.sort((a, b) => a.createdAt - b.createdAt)
  } catch (error) {
    console.error('Error getting all folders:', error)
    return []
  }
}

// Get a single folder by ID
export async function getFolderById(id) {
  try {
    return await db.folders.get(id)
  } catch (error) {
    console.error('Error getting folder:', error)
    return null
  }
}

// Get subfolders of a folder
export async function getSubfolders(parentId) {
  try {
    const folders = await db.folders
      .where('parentId')
      .equals(parentId)
      .toArray()
    return folders.sort((a, b) => a.createdAt - b.createdAt)
  } catch (error) {
    console.error('Error getting subfolders:', error)
    return []
  }
}

// Get root folders (no parent)
export async function getRootFolders() {
  try {
    const folders = await db.folders
      .where('parentId')
      .equals(null)
      .toArray()
    return folders.sort((a, b) => a.createdAt - b.createdAt)
  } catch (error) {
    console.error('Error getting root folders:', error)
    return []
  }
}

// Update a folder
export async function updateFolder(id, updates) {
  try {
    const currentFolder = await db.folders.get(id)
    if (!currentFolder) {
      throw new Error('Folder not found')
    }

    await db.folders.update(id, updates)
    console.log('Folder updated:', id)

    return await db.folders.get(id)
  } catch (error) {
    console.error('Error updating folder:', error)
    throw error
  }
}

// Rename a folder
export async function renameFolder(id, newName) {
  try {
    return await updateFolder(id, { name: newName })
  } catch (error) {
    console.error('Error renaming folder:', error)
    throw error
  }
}

// Delete a folder and all its notes
export async function deleteFolder(id) {
  try {
    // Get all subfolders recursively
    const subfoldersToDelete = await getAllSubfoldersRecursive(id)
    const allFolderIds = [id, ...subfoldersToDelete.map(f => f.id)]

    // Delete all notes in these folders
    for (const folderId of allFolderIds) {
      await db.notes.where('folderId').equals(folderId).delete()
    }

    // Delete all folders
    for (const folderId of allFolderIds) {
      await db.folders.delete(folderId)
    }

    console.log('Folder deleted:', id)
    return true
  } catch (error) {
    console.error('Error deleting folder:', error)
    throw error
  }
}

// Helper: Get all subfolders recursively
async function getAllSubfoldersRecursive(parentId) {
  const subfolders = await getSubfolders(parentId)
  let allSubfolders = [...subfolders]

  for (const folder of subfolders) {
    const nestedSubfolders = await getAllSubfoldersRecursive(folder.id)
    allSubfolders = [...allSubfolders, ...nestedSubfolders]
  }

  return allSubfolders
}

// Get folder tree structure
export async function getFolderTree() {
  try {
    const allFolders = await getAllFolders()
    const folderMap = new Map()

    // Create a map of folders
    allFolders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] })
    })

    // Build tree structure
    const tree = []
    allFolders.forEach(folder => {
      const folderNode = folderMap.get(folder.id)
      if (folder.parentId === null) {
        tree.push(folderNode)
      } else {
        const parent = folderMap.get(folder.parentId)
        if (parent) {
          parent.children.push(folderNode)
        }
      }
    })

    return tree
  } catch (error) {
    console.error('Error getting folder tree:', error)
    return []
  }
}

export default {
  createFolder,
  getAllFolders,
  getFolderById,
  getSubfolders,
  getRootFolders,
  updateFolder,
  renameFolder,
  deleteFolder,
  getFolderTree,
}
