import db from './db'
import { stripHtml } from '../utils/textUtils'

// Singleton instance of the embedding pipeline
let embeddingPipeline = null
let isInitializing = false

// Initialize the embedding model using dynamic import
export async function initEmbeddingModel() {
  if (embeddingPipeline) {
    return embeddingPipeline
  }

  if (isInitializing) {
    // Wait for the initialization to complete
    while (isInitializing) {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    return embeddingPipeline
  }

  try {
    isInitializing = true
    console.log('Loading embedding model...')

    // Dynamic import to avoid loading ONNX runtime at startup
    const { pipeline, env } = await import('@xenova/transformers')

    // Configure for browser environment
    env.allowLocalModels = false
    env.useBrowserCache = true

    // Use a small, efficient model for embeddings
    // all-MiniLM-L6-v2 is a good balance of size and quality
    embeddingPipeline = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      {
        quantized: true,
        progress_callback: (progress) => {
          if (progress.status === 'progress') {
            console.log(`Loading model: ${Math.round(progress.progress)}%`)
          }
        }
      }
    )

    console.log('Embedding model loaded successfully!')
    return embeddingPipeline
  } catch (error) {
    console.error('Error loading embedding model:', error)
    throw error
  } finally {
    isInitializing = false
  }
}

// Generate embedding for a text
export async function generateEmbedding(text) {
  try {
    const model = await initEmbeddingModel()

    // Clean and prepare text
    const cleanText = stripHtml(text).trim()
    if (!cleanText) {
      return null
    }

    // Generate embedding
    const output = await model(cleanText, {
      pooling: 'mean',
      normalize: true,
    })

    // Convert to regular array
    const embedding = Array.from(output.data)
    return embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    return null
  }
}

// Generate and store embedding for a note
export async function embedNote(note) {
  try {
    // Combine title and content for better context
    const textToEmbed = `${note.title}\n\n${note.content}`

    const embedding = await generateEmbedding(textToEmbed)

    if (!embedding) {
      console.warn('Could not generate embedding for note:', note.id)
      return false
    }

    // Store in database
    await db.embeddings.put({
      noteId: note.id,
      vector: embedding,
      updatedAt: Date.now(),
    })

    console.log('Embedding stored for note:', note.id)
    return true
  } catch (error) {
    console.error('Error embedding note:', error)
    return false
  }
}

// Batch embed multiple notes
export async function embedNotes(notes) {
  const results = []

  for (const note of notes) {
    const success = await embedNote(note)
    results.push({ noteId: note.id, success })
  }

  return results
}

// Get embedding for a note from database
export async function getNoteEmbedding(noteId) {
  try {
    const embedding = await db.embeddings.get(noteId)
    return embedding
  } catch (error) {
    console.error('Error getting note embedding:', error)
    return null
  }
}

// Get all embeddings from database
export async function getAllEmbeddings() {
  try {
    const embeddings = await db.embeddings.toArray()
    return embeddings
  } catch (error) {
    console.error('Error getting all embeddings:', error)
    return []
  }
}

// Re-embed notes that don't have embeddings
export async function embedMissingNotes(notes) {
  const embeddings = await getAllEmbeddings()
  const embeddedNoteIds = new Set(embeddings.map(e => e.noteId))

  const missingNotes = notes.filter(note => !embeddedNoteIds.has(note.id))

  if (missingNotes.length === 0) {
    console.log('All notes already have embeddings')
    return []
  }

  console.log(`Embedding ${missingNotes.length} notes...`)
  return await embedNotes(missingNotes)
}

// Delete embedding for a note
export async function deleteNoteEmbedding(noteId) {
  try {
    await db.embeddings.delete(noteId)
    return true
  } catch (error) {
    console.error('Error deleting note embedding:', error)
    return false
  }
}

export default {
  initEmbeddingModel,
  generateEmbedding,
  embedNote,
  embedNotes,
  getNoteEmbedding,
  getAllEmbeddings,
  embedMissingNotes,
  deleteNoteEmbedding,
}
