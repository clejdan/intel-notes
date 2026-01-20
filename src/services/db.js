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

    // Only runs when database is first created (not on every open)
    this.on('populate', async () => {
      console.log('Populating database with default data...')
      await this.folders.bulkAdd(defaultFolders)
      await this.notes.add(welcomeNote)
    })
  }
}

// Create database instance
const db = new IntelNotesDB()

// Open database connection
export async function initializeDatabase() {
  try {
    await db.open()
    console.log('Database opened successfully')
    return true
  } catch (error) {
    console.error('Error opening database:', error)
    return false
  }
}

export default db
