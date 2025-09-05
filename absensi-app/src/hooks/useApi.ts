'use client'

import { useState, useEffect, useCallback } from 'react'

interface UseApiOptions {
  cacheKey?: string
  cacheDuration?: number // dalam ms, default 5 menit
}

// Simple cache untuk data yang sering diakses
const cache = new Map<string, { data: any; timestamp: number }>()

export function useApi<T>(
  url: string, 
  options: UseApiOptions = {}
) {
  const { cacheKey, cacheDuration = 5 * 60 * 1000 } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (forceRefresh = false) => {
    const key = cacheKey || url

    // Check cache first
    if (!forceRefresh && cache.has(key)) {
      const cached = cache.get(key)!
      if (Date.now() - cached.timestamp < cacheDuration) {
        setData(cached.data)
        setLoading(false)
        return cached.data
      }
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      // Cache the result
      cache.set(key, { data: result, timestamp: Date.now() })
      
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url, cacheKey, cacheDuration])

  const refetch = useCallback(() => fetchData(true), [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

export function clearCache(key?: string) {
  if (key) {
    cache.delete(key)
  } else {
    cache.clear()
  }
}

export function useOptimizedStudents() {
  return useApi<{ students: any[] }>('/api/students', {
    cacheKey: 'students',
    cacheDuration: 2 * 60 * 1000 // 2 menit
  })
}

export function useOptimizedUser() {
  return useApi<{ user: any }>('/api/auth/me', {
    cacheKey: 'user',
    cacheDuration: 10 * 60 * 1000 // 10 menit
  })
}
