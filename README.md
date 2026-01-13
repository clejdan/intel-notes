# IntelNotes

A note-taking app with AI chat. Think macOS Notes but with the ability to ask questions about your notes.

Built with React, Vite, and Quill.js. Data stays in your browser via IndexedDB.

https://intel-notes.vercel.app

## What it does

**Notes** - Text editor with auto-save. Organize into folders, pin important ones, search across everything.

**AI Chat** - Click the AI Chat icon to chat. The AI searches your notes for relevant context and answers questions about them. Currently uses OpenAI (bring your own API key).

## Keyboard shortcuts

- `Ctrl/Cmd + N` - New note
- `Ctrl/Cmd + F` - Search
- `Escape` - Cancel editing

## Project structure

```
src/
  components/     # Sidebar, NoteList, NoteEditor, AIChat
  context/        # React context for app state
  services/       # Database, notes, folders, AI/RAG logic
  utils/          # Helper functions
```

## Tech

- React 18
- Vite
- Quill.js (rich text)
- Dexie (IndexedDB wrapper)
- OpenAI API for chat

## License

MIT
