// Application configuration
export const APP_CONFIG = {
  name: 'IntelNotes',
  version: '0.1.0',

  // Auto-save settings
  autoSaveDelay: 500, // milliseconds

  // AI settings
  aiProvider: 'local', // 'local' or 'cloud'
  maxContextNotes: 5, // Max notes to include in RAG context
  embeddingDimension: 384, // Default embedding size

  // UI settings
  defaultFolderName: 'My Notes',
  maxNotePreviewLength: 150,

  // IndexedDB
  dbName: 'IntelNotesDB',
  dbVersion: 1,
}

export default APP_CONFIG
