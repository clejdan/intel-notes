// Strip HTML tags from text (uses DOMParser for safety - doesn't execute scripts)
export function stripHtml(html) {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return doc.body.textContent || ''
}

// Truncate text to specified length
export function truncate(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// Extract title from HTML content (first heading or first line)
export function extractTitle(html) {
  if (!html) return 'Untitled'

  // Try to find first heading
  const headingMatch = html.match(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/i)
  if (headingMatch && headingMatch[1]) {
    return stripHtml(headingMatch[1]).trim()
  }

  // Otherwise get first line of plain text
  const plainText = stripHtml(html).trim()
  const firstLine = plainText.split('\n')[0]

  if (!firstLine) return 'Untitled'

  return truncate(firstLine, 100)
}

// Get preview text (plain text, truncated)
export function getPreview(html, maxLength = 150) {
  const plainText = stripHtml(html).trim()
  if (!plainText) return 'No content'
  return truncate(plainText, maxLength)
}

export default {
  stripHtml,
  truncate,
  extractTitle,
  getPreview,
}
