# IntelNotes

> A sleek, AI-powered note-taking app with RAG (Retrieval-Augmented Generation) capabilities

IntelNotes is a modern, macOS Notes-inspired web application built with React. It features rich text editing, smart organization, and will soon include AI-powered chat to answer questions about your notes.

## ✨ Features

### 📝 Rich Note Taking
- **Rich Text Editor** - Format your notes with headings, bold, italic, lists, code blocks, and more
- **Auto-Save** - Changes save automatically 500ms after you stop typing
- **Editable Titles** - Click any note title to rename it
- **Pin Important Notes** - Keep frequently used notes at the top of your list
- **Search** - Fast, real-time search across all your notes
- **Note Previews** - See the first few lines of each note in the list

### 📁 Smart Organization
- **Folders** - Organize your notes into folders
- **Rename & Delete** - Right-click actions (or hover) to manage folders
- **Quick Create** - Easily create new notes and folders
- **Visual Hierarchy** - Clear folder and note organization

### ⌨️ Keyboard Shortcuts
- `Ctrl+N` (or `Cmd+N`) - Create a new note
- `Ctrl+F` (or `Cmd+F`) - Focus search bar
- `Enter` - Save when editing titles or folder names
- `Escape` - Cancel editing

### 🎨 Beautiful Dark UI
- Sleek dark theme optimized for long writing sessions
- Smooth transitions and animations
- macOS Notes-inspired three-panel layout
- Responsive design (works on mobile and tablet)

### 💾 Persistent Storage
- All data stored locally in your browser using IndexedDB
- No account required
- Your notes stay private on your device
- Instant loading and saving

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/clejdan/intel-notes.git
cd intel-notes
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 🏗️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Quill.js** - Rich text editor
- **Dexie** - IndexedDB wrapper for data persistence
- **CSS Modules** - Component-scoped styling

## 📖 Usage

### Creating Notes
1. Select a folder from the sidebar (or create a new one with the `+` button)
2. Click **"+ New Note"** in the middle panel
3. Start writing! Your note will auto-save as you type
4. Click the note title to rename it

### Organizing with Folders
1. Click the `+` button in the sidebar header
2. Type a folder name and press Enter
3. Hover over folders to see rename (✏️) and delete (🗑️) options
4. Click a folder to view its notes

### Managing Notes
- **Pin a note** - Click the 📌 button in the note editor
- **Delete a note** - Click the 🗑️ button in the note editor
- **Search notes** - Type in the search bar at the top of the note list
- **Format text** - Use the toolbar in the editor for rich formatting

## 🤖 AI Features (Coming Soon)

IntelNotes will soon include:
- **RAG-based AI Chat** - Ask questions about your notes
- **Smart Context** - AI finds relevant notes automatically
- **Note Citations** - See which notes were used to answer your questions
- **Local AI Option** - Privacy-first AI that runs in your browser
- **Cloud AI Option** - More powerful AI with Claude or OpenAI APIs

## 📁 Project Structure

```
intel-notes/
├── src/
│   ├── components/        # React components
│   │   ├── Sidebar/      # Folder tree
│   │   ├── NoteList/     # Note list view
│   │   ├── NoteEditor/   # Rich text editor
│   │   └── AIChat/       # AI chat (coming soon)
│   ├── context/          # React Context for state
│   ├── services/         # Business logic (DB, notes, folders)
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── constants/        # App configuration
│   └── styles/           # Global styles
├── public/               # Static assets
└── index.html           # Entry point
```

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

MIT License - feel free to use this project however you'd like!

## 🙏 Acknowledgments

- Inspired by macOS Notes
- Built with modern React best practices
- Powered by Quill.js for rich text editing

---

Made with ❤️ by CJ
