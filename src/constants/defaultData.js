import { APP_CONFIG } from './config'

// Generate a simple UUID
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// Default folder structure
export const defaultFolders = [
  {
    id: 'default-folder',
    name: APP_CONFIG.defaultFolderName,
    parentId: null,
    createdAt: Date.now(),
  }
]

// Welcome note shown on first launch
export const welcomeNote = {
  id: 'welcome-note',
  title: 'Welcome to IntelNotes',
  content: `<h1>Welcome to IntelNotes!</h1>
<p>This is your AI-powered note-taking app with RAG (Retrieval-Augmented Generation) capabilities.</p>

<h2>Getting Started</h2>
<ul>
  <li><strong>Create a note:</strong> Click the "New Note" button in the toolbar</li>
  <li><strong>Organize with folders:</strong> Use the sidebar to create and manage folders</li>
  <li><strong>Rich text editing:</strong> Use the toolbar to format your notes with bold, italic, lists, and more</li>
  <li><strong>Auto-save:</strong> Your notes are automatically saved as you type</li>
</ul>

<h2>AI Features</h2>
<p>Click the <strong>AI</strong> button to open the chat panel. You can ask questions about your notes, and the AI will search through them to find relevant information and provide answers.</p>

<p><em>Start by creating your first note and exploring the features!</em></p>`,
  folderId: 'default-folder',
  isPinned: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  embedding: null,
}

export { generateId }
