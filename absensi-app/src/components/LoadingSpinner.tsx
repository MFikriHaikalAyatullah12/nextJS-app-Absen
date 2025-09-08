'use client'

import { Suspense } from 'react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  minimal?: boolean
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'md',
  minimal = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  }

  if (minimal) {
    return (
      <div className="flex items-center justify-center p-2">
        <div className={`animate-spin rounded-full border-2 border-blue-600 border-t-transparent ${sizeClasses[size]}`}></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="text-center">
        <div className={`animate-spin rounded-full border-2 border-blue-600 border-t-transparent mx-auto ${sizeClasses[size]}`}></div>
        {message && <p className="mt-2 text-gray-600 text-sm">{message}</p>}
      </div>
    </div>
  )
}

export function LoadingPage({ message = 'Memuat halaman...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <LoadingSpinner message={message} size="lg" />
    </div>
  )
}

export function FastLoading({ message }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-4">
      <LoadingSpinner message={message} size="sm" minimal />
    </div>
  )
}

export function PageSuspense({ children, fallback }: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <Suspense fallback={fallback || <FastLoading />}>
      {children}
    </Suspense>
  )
}
