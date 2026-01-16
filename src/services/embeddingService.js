// Embedding service - stubbed out (using keyword search instead)
// These functions exist for API compatibility but don't do anything

export async function initEmbeddingModel() {
  return null
}

export async function generateEmbedding() {
  return null
}

export async function embedNote() {
  return true
}

export async function embedNotes() {
  return []
}

export async function getNoteEmbedding() {
  return null
}

export async function getAllEmbeddings() {
  return []
}

export async function embedMissingNotes() {
  return []
}

export async function deleteNoteEmbedding() {
  return true
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
