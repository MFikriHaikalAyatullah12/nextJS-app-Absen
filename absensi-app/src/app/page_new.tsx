'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Cek apakah user sudah login
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('Auth check error:', error)
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sistem Absensi
          </h1>
          <p className="text-gray-600 mb-8 font-bold">
            UPT SD Negeri 117 Inpres Bontomangape
          </p>
          
          <div className="space-y-4">
            <Link
              href="/login"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors block text-center"
            >
              Masuk ke Akun
            </Link>
            
            <Link
              href="/register"
              className="w-full bg-white text-blue-600 py-3 px-4 rounded-lg font-medium border-2 border-blue-600 hover:bg-blue-50 transition-colors block text-center"
            >
              Daftar Akun Baru
            </Link>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>Untuk guru kelas 1 - 6</p>
          </div>
        </div>
      </div>
    </div>
  )
}
