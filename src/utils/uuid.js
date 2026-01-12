// Generate a simple unique ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export default generateId
