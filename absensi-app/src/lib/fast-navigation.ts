'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Optimized navigation dengan instant feedback
export function useOptimizedNavigation() {
  const router = useRouter()
  const [isNavigating, setIsNavigating] = useState(false)

  const navigateTo = async (path: string) => {
    setIsNavigating(true)
    
    // Instant UI feedback
    setTimeout(() => {
      router.push(path)
      setIsNavigating(false)
    }, 50) // Minimal delay untuk smooth transition
  }

  return { navigateTo, isNavigating }
}

// Preload komponen untuk faster navigation
export function preloadRoute(path: string) {
  if (typeof window !== 'undefined') {
    const link = document.createElement('link')
    link.rel = 'prefetch'
    link.href = path
    document.head.appendChild(link)
  }
}

// Cache management yang lebih aggressive
export class FastCache {
  private static instance: FastCache
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  static getInstance(): FastCache {
    if (!FastCache.instance) {
      FastCache.instance = new FastCache()
    }
    return FastCache.instance
  }

  set(key: string, data: any, ttl: number = 60000) { // default 1 minute
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(key?: string) {
    if (key) {
      this.cache.delete(key)
    } else {
      this.cache.clear()
    }
  }
}

// Optimized API fetch dengan immediate cache return
export async function fastFetch(url: string, options?: RequestInit) {
  const cache = FastCache.getInstance()
  const cacheKey = `${url}-${JSON.stringify(options)}`
  
  // Return cached data immediately if available
  const cached = cache.get(cacheKey)
  if (cached) {
    // Start background refresh
    fetch(url, options)
      .then(res => res.json())
      .then(data => cache.set(cacheKey, data))
      .catch(() => {}) // Silent fail for background refresh
    
    return cached
  }

  // Fetch fresh data
  const response = await fetch(url, options)
  const data = await response.json()
  cache.set(cacheKey, data)
  
  return data
}
