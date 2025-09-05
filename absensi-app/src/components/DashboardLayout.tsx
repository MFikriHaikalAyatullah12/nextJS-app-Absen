'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
  grade: number
  subjects: string[]
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

// Cache user data di session storage untuk performa
const getUserFromCache = (): User | null => {
  if (typeof window === 'undefined') return null
  try {
    const cached = sessionStorage.getItem('user_data')
    return cached ? JSON.parse(cached) : null
  } catch {
    return null
  }
}

const setUserToCache = (user: User) => {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem('user_data', JSON.stringify(user))
  } catch {
    // Ignore storage errors
  }
}

const clearUserCache = () => {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem('user_data')
  } catch {
    // Ignore storage errors
  }
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    const cachedUser = getUserFromCache()
    if (cachedUser) {
      setUser(cachedUser)
      setIsLoading(false)
    }
  }, [])

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setUserToCache(data.user)
      } else {
        clearUserCache()
        router.push('/login')
      }
    } catch (error) {
      clearUserCache()
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (!mounted) return
    
    // Jika sudah ada user di cache, skip loading
    if (user) {
      setIsLoading(false)
      return
    }
    
    fetchUser()
  }, [mounted, user, fetchUser])

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      clearUserCache()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [router])

  const handleDeleteAccount = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/delete-account', { method: 'DELETE' })
      if (response.ok) {
        router.push('/?message=Akun berhasil dihapus')
      } else {
        alert('Gagal menghapus akun')
      }
    } catch (error) {
      alert('Terjadi kesalahan')
    }
    setShowDeleteConfirm(false)
  }, [router])

  // Optimized navigation items with useMemo
  const navigationItems = useMemo(() => [
    { path: '/dashboard', label: '📊 Dashboard', icon: '🏠' },
    { path: '/dashboard/students', label: '👥 Data Siswa', icon: '👥' },
    { path: '/dashboard/attendance', label: '✅ Absensi', icon: '✅' },
    { path: '/dashboard/history', label: '📋 Riwayat', icon: '📋' },
    { path: '/dashboard/download', label: '📥 Download', icon: '📥' }
  ], [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Sistem Absensi - Kelas {user.grade}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Selamat datang, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="bg-white w-64 min-h-screen shadow-sm">
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link
                    href={item.path}
                    prefetch={true}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      pathname === item.path
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
            
            <div className="mt-8 pt-8 border-t">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                🗑️ Hapus Akun
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Konfirmasi Hapus Akun
            </h3>
            <p className="text-gray-600 mb-6">
              Apakah Anda yakin ingin menghapus akun ini? Semua data siswa dan absensi akan ikut terhapus dan tidak dapat dikembalikan.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Batal
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
