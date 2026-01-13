import { getAllNotes } from './noteService'
import { stripHtml, truncate } from '../utils/textUtils'

// Simple keyword-based search for finding relevant notes
// This is a fallback that works without embeddings
export async function findRelevantNotes(query, maxResults = 5) {
  try {
    const notes = await getAllNotes()

    if (notes.length === 0) {
      return []
    }

    // Tokenize query into keywords
    const keywords = query.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2) // Ignore very short words

    // Score each note based on keyword matches
    const scoredNotes = notes.map(note => {
      const title = (note.title || '').toLowerCase()
      const content = stripHtml(note.content || '').toLowerCase()

      let score = 0

      // Count keyword matches
      keywords.forEach(keyword => {
        // Title matches are worth more
        const titleMatches = (title.match(new RegExp(keyword, 'gi')) || []).length
        const contentMatches = (content.match(new RegExp(keyword, 'gi')) || []).length

        score += titleMatches * 3 // Title matches worth 3x
        score += contentMatches
      })

      // Normalize by keyword count to avoid bias toward longer queries
      const normalizedScore = keywords.length > 0 ? score / keywords.length : 0

      return {
        note,
        score: normalizedScore,
        noteId: note.id,
      }
    })

    // Filter out notes with no matches and sort by score
    const relevantNotes = scoredNotes
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)

    // If no keyword matches, return most recent notes as context
    if (relevantNotes.length === 0 && notes.length > 0) {
      return notes.slice(0, maxResults).map(note => ({
        note,
        score: 0.5, // Default score for recent notes
        noteId: note.id,
      }))
    }

    return relevantNotes
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
      // Return a structure that indicates no notes found, but still allows AI to respond
      const defaultPrompt = `The user asked: "${question}"

There are no notes in the system yet, or no relevant notes were found. Please respond helpfully and suggest that the user add some notes first.`

      return {
        prompt: defaultPrompt,
        context: '',
        relevantNotes: [],
        question,
        noNotesFound: true,
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

export default {
  findRelevantNotes,
  buildContext,
  createRAGPrompt,
  queryWithRAG,
}
