'use client'

import { useState, useEffect, useCallback } from 'react'
import { FastCache } from '@/lib/fast-navigation'

interface UseApiOptions {
  cacheKey?: string
  cacheDuration?: number // dalam ms, default 2 menit untuk response lebih cepat
  immediate?: boolean // immediate return dari cache
}

export function useApi<T>(
  url: string, 
  options: UseApiOptions = {}
) {
  const { cacheKey, cacheDuration = 2 * 60 * 1000, immediate = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const cache = FastCache.getInstance()

  const fetchData = useCallback(async (forceRefresh = false) => {
    const key = cacheKey || url

    // Immediate cache return untuk responsiveness
    if (!forceRefresh && immediate) {
      const cached = cache.get(key)
      if (cached) {
        setData(cached)
        setLoading(false)
        
        // Background refresh
        fetch(url)
          .then(res => res.json())
          .then(result => {
            cache.set(key, result, cacheDuration)
            setData(result)
          })
          .catch(() => {}) // Silent background refresh
        
        return cached
      }
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(url, {
        // Tambahkan cache headers untuk optimasi browser
        headers: {
          'Cache-Control': 'max-age=60'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      
      const result = await response.json()
      
      // Cache the result
      cache.set(key, result, cacheDuration)
      
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }, [url, cacheKey, cacheDuration, immediate, cache])

  const refetch = useCallback(() => fetchData(true), [fetchData])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

export function clearCache(key?: string) {
  const cache = FastCache.getInstance()
  if (key) {
    cache.clear(key)
  } else {
    cache.clear()
  }
}

export function useOptimizedStudents() {
  return useApi<{ students: any[] }>('/api/students', {
    cacheKey: 'students',
    cacheDuration: 60000 // 1 menit untuk data yang lebih fresh
  })
}

export function useOptimizedUser() {
  return useApi<{ user: any }>('/api/auth/me', {
    cacheKey: 'user',
    cacheDuration: 300000 // 5 menit
  })
}
