import { useEffect, useState } from 'react'

const STORAGE_KEY = 'tamales.includeNsfw'
const EVENT_NAME = 'tamales:include-nsfw-changed'

function readPreference() {
  if (typeof window === 'undefined') {
    return false
  }

  return window.localStorage.getItem(STORAGE_KEY) === 'true'
}

export function useNsfwPreference() {
  const [includeNsfw, setIncludeNsfwState] = useState(false)

  useEffect(() => {
    setIncludeNsfwState(readPreference())

    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        setIncludeNsfwState(readPreference())
      }
    }

    const handleLocalEvent = () => {
      setIncludeNsfwState(readPreference())
    }

    window.addEventListener('storage', handleStorage)
    window.addEventListener(EVENT_NAME, handleLocalEvent)

    return () => {
      window.removeEventListener('storage', handleStorage)
      window.removeEventListener(EVENT_NAME, handleLocalEvent)
    }
  }, [])

  const setIncludeNsfw = (nextValue: boolean) => {
    setIncludeNsfwState(nextValue)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, String(nextValue))
      window.dispatchEvent(new Event(EVENT_NAME))
    }
  }

  return { includeNsfw, setIncludeNsfw }
}
