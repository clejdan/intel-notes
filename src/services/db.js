import Dexie from 'dexie'
import { APP_CONFIG } from '../constants/config'
import { defaultFolders, welcomeNote } from '../constants/defaultData'

// Initialize IndexedDB using Dexie
class IntelNotesDB extends Dexie {
  constructor() {
    super(APP_CONFIG.dbName)

    // Define database schema
    this.version(APP_CONFIG.dbVersion).stores({
      notes: 'id, title, folderId, isPinned, createdAt, updatedAt',
      folders: 'id, name, parentId, createdAt',
      embeddings: 'noteId, vector',
    })

    // Access tables
    this.notes = this.table('notes')
    this.folders = this.table('folders')
    this.embeddings = this.table('embeddings')
  }
}

// Create database instance
const db = new IntelNotesDB()

// Initialize database with default data on first run
export async function initializeDatabase() {
  try {
    // Check if database is already initialized
    const folderCount = await db.folders.count()
    const noteCount = await db.notes.count()

    // If empty, add default data
    if (folderCount === 0) {
      console.log('Initializing database with default folders...')
      await db.folders.bulkAdd(defaultFolders)
    }

    if (noteCount === 0) {
      console.log('Initializing database with welcome note...')
      await db.notes.add(welcomeNote)
    }

    console.log('Database initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing database:', error)
    return false
  }
}

export default db
