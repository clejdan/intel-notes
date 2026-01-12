// Format timestamp to human-readable date
export function formatDate(timestamp) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  // Less than a minute ago
  if (diffMins < 1) {
    return 'Just now'
  }

  // Less than an hour ago
  if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
  }

  // Less than a day ago
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }

  // Less than a week ago
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }

  // Show actual date
  const options = { month: 'short', day: 'numeric', year: 'numeric' }
  return date.toLocaleDateString('en-US', options)
}

// Format timestamp to full date string
export function formatFullDate(timestamp) {
  const date = new Date(timestamp)
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }
  return date.toLocaleDateString('en-US', options)
}

export default formatDate
