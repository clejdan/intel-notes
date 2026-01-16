# IntelNotes

A note-taking app with AI chat. Think macOS Notes but with the ability to ask questions about your notes.

Built with React 19, Vite, and TipTap. Data stays in your browser via IndexedDB.

https://intel-notes.vercel.app

## What it does

**Notes** - Text editor with auto-save. Organize into folders, pin important ones, search across everything.

**AI Chat** - Click the robot icon to chat. The AI searches your notes using keyword matching and answers questions with OpenAI (bring your own API key).

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

## Stack

- React 19
- Vite
- TipTap 
- Dexie
- OpenAI API required for AI chat (work in prog.)

## License

MIT
