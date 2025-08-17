"use client"

import { useEffect } from "react"

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase()
      const ctrlKey = event.ctrlKey || event.metaKey
      const shiftKey = event.shiftKey
      const altKey = event.altKey

      for (const shortcut of shortcuts) {
        const matches =
          shortcut.key === key &&
          !!shortcut.ctrl === ctrlKey &&
          !!shortcut.shift === shiftKey &&
          !!shortcut.alt === altKey

        if (matches) {
          event.preventDefault()
          shortcut.action()
          break
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [shortcuts])
}
