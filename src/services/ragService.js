import { generateEmbedding, getAllEmbeddings } from './embeddingService'
import { getAllNotes } from './noteService'
import { cosineSimilarity } from '../utils/vectorMath'
import { stripHtml, truncate } from '../utils/textUtils'
import { APP_CONFIG } from '../constants/config'

// Find relevant notes for a query using embeddings
export async function findRelevantNotes(query, maxResults = APP_CONFIG.maxContextNotes) {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query)

    if (!queryEmbedding) {
      console.warn('Could not generate embedding for query')
      return []
    }

    // Get all note embeddings
    const embeddings = await getAllEmbeddings()

    if (embeddings.length === 0) {
      console.warn('No note embeddings found')
      return []
    }

    // Get all notes
    const notes = await getAllNotes()
    const noteMap = new Map(notes.map(note => [note.id, note]))

    // Calculate similarity scores
    const similarities = embeddings.map(emb => {
      const note = noteMap.get(emb.noteId)
      if (!note) return null

      const similarity = cosineSimilarity(queryEmbedding, emb.vector)

      return {
        note,
        score: similarity,
        noteId: emb.noteId,
      }
    }).filter(Boolean) // Remove null entries

    // Sort by similarity (descending)
    similarities.sort((a, b) => b.score - a.score)

    // Return top results
    return similarities.slice(0, maxResults)
  } catch (error) {
    console.error('Error finding relevant notes:', error)
    return []
  }
}

// Build context string from relevant notes
export function buildContext(relevantNotes) {
  if (!relevantNotes || relevantNotes.length === 0) {
    return 'No relevant notes found.'
  }

  const contextParts = relevantNotes.map((item, index) => {
    const note = item.note
    const plainText = stripHtml(note.content)
    const truncatedContent = truncate(plainText, 500)

    return `[Note ${index + 1}: "${note.title}" (similarity: ${(item.score * 100).toFixed(1)}%)]
${truncatedContent}
---`
  })

  return contextParts.join('\n\n')
}

// Create a RAG prompt with context and question
export function createRAGPrompt(query, context) {
  return `You are a helpful assistant that answers questions based on the user's notes. Use the provided notes to answer the question. If the notes don't contain relevant information, say so.

Context from notes:
${context}

Question: ${query}

Answer:`
}

// Main RAG query function
export async function queryWithRAG(question) {
  try {
    console.log('Finding relevant notes for:', question)

    // Find relevant notes
    const relevantNotes = await findRelevantNotes(question)

    if (relevantNotes.length === 0) {
      return {
        answer: "I couldn't find any relevant notes to answer your question. Try adding more notes or rephrasing your question.",
        relevantNotes: [],
        context: '',
      }
    }

    // Build context
    const context = buildContext(relevantNotes)

    // Create prompt
    const prompt = createRAGPrompt(question, context)

    return {
      prompt,
      context,
      relevantNotes,
      question,
    }
  } catch (error) {
    console.error('Error in RAG query:', error)
    throw error
  }
}

// Get statistics about embeddings
export async function getEmbeddingStats() {
  const embeddings = await getAllEmbeddings()
  const notes = await getAllNotes()

  return {
    totalNotes: notes.length,
    embeddedNotes: embeddings.length,
    missingEmbeddings: notes.length - embeddings.length,
  }
}

export default {
  findRelevantNotes,
  buildContext,
  createRAGPrompt,
  queryWithRAG,
  getEmbeddingStats,
}
