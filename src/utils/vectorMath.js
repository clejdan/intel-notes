// Vector math utilities for RAG

// Calculate dot product of two vectors
export function dotProduct(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  let sum = 0
  for (let i = 0; i < vecA.length; i++) {
    sum += vecA[i] * vecB[i]
  }
  return sum
}

// Calculate magnitude (length) of a vector
export function magnitude(vector) {
  let sum = 0
  for (let i = 0; i < vector.length; i++) {
    sum += vector[i] * vector[i]
  }
  return Math.sqrt(sum)
}

// Calculate cosine similarity between two vectors
// Returns a value between -1 and 1 (higher = more similar)
export function cosineSimilarity(vecA, vecB) {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same length')
  }

  const dot = dotProduct(vecA, vecB)
  const magA = magnitude(vecA)
  const magB = magnitude(vecB)

  if (magA === 0 || magB === 0) {
    return 0
  }

  return dot / (magA * magB)
}

// Find top K most similar vectors to a query vector
export function findTopKSimilar(queryVector, vectors, k = 5) {
  // Calculate similarity scores for all vectors
  const similarities = vectors.map((vec, index) => ({
    index,
    score: cosineSimilarity(queryVector, vec.embedding),
    data: vec,
  }))

  // Sort by similarity score (descending)
  similarities.sort((a, b) => b.score - a.score)

  // Return top K
  return similarities.slice(0, k)
}

// Normalize a vector (make its magnitude = 1)
export function normalize(vector) {
  const mag = magnitude(vector)
  if (mag === 0) return vector

  return vector.map(val => val / mag)
}

export default {
  dotProduct,
  magnitude,
  cosineSimilarity,
  findTopKSimilar,
  normalize,
}
