import { useEffect } from 'react'

// Hook to handle keyboard shortcuts
export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Check each shortcut
      for (const shortcut of shortcuts) {
        const {
          key,
          ctrl = false,
          shift = false,
          alt = false,
          callback,
        } = shortcut

        // Check if all modifier keys match
        const ctrlMatch = ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey
        const shiftMatch = shift ? event.shiftKey : !event.shiftKey
        const altMatch = alt ? event.altKey : !event.altKey

        // Check if the key matches (case insensitive)
        const keyMatch = event.key.toLowerCase() === key.toLowerCase()

        // If everything matches, execute callback
        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault()
          callback(event)
          break
        }
      }
    }

    // Add event listener
    window.addEventListener('keydown', handleKeyDown)

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [shortcuts])
}

export default useKeyboardShortcuts
