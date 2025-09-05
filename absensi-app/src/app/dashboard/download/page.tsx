'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface User {
  id: string
  name: string
  email: string
  grade: number
  subjects: string[]
}

export default function Download() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    period: ''
  })

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const userResponse = await fetch('/api/auth/me')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePeriodChange = (period: string) => {
    const today = new Date()
    let startDate = ''
    let endDate = today.toISOString().split('T')[0]

    switch (period) {
      case 'week':
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        startDate = startOfWeek.toISOString().split('T')[0]
        break
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
        break
      case 'semester':
        // Assume semester starts in July or January
        const currentMonth = today.getMonth()
        if (currentMonth >= 6) {
          // Second semester (July - December)
          startDate = new Date(today.getFullYear(), 6, 1).toISOString().split('T')[0]
        } else {
          // First semester (January - June)
          startDate = new Date(today.getFullYear(), 0, 1).toISOString().split('T')[0]
        }
        break
      case 'all':
        startDate = ''
        endDate = ''
        break
      default:
        startDate = ''
        endDate = ''
    }

    setFilters({
      period,
      startDate,
      endDate
    })
  }

  const handleDownload = async () => {
    setIsDownloading(true)

    try {
      const params = new URLSearchParams()
      
      if (filters.startDate) {
        params.append('startDate', filters.startDate)
      }
      
      if (filters.endDate) {
        params.append('endDate', filters.endDate)
      }

      const response = await fetch(`/api/attendance/export?${params.toString()}`)
      
      if (response.ok) {
        // Get the blob from response
        const blob = await response.blob()
        
        // Create download link
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        
        // Get filename from response headers or create default
        const contentDisposition = response.headers.get('Content-Disposition')
        let filename = `Rekap_Absensi_Kelas_${user?.grade}_${new Date().toISOString().split('T')[0]}.xlsx`
        
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="(.+)"/)
          if (filenameMatch) {
            filename = filenameMatch[1]
          }
        }
        
        a.download = filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        alert('File berhasil didownload!')
      } else {
        const data = await response.json()
        alert(data.error || 'Terjadi kesalahan saat download')
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan')
    } finally {
      setIsDownloading(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Download Laporan Absensi</h1>

        <div className="max-w-2xl">
          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">ℹ️</span>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-blue-800">Tentang Laporan Excel</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>File akan berisi sheet terpisah untuk setiap mata pelajaran</li>
                    <li>Setiap sheet memiliki ringkasan statistik kehadiran per siswa</li>
                    <li>Detail absensi per tanggal juga disertakan</li>
                    <li>Data mencakup jumlah hadir, izin, dan alpa untuk setiap siswa</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Filter and Download Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Pilih Periode Data</h2>
            
            {/* Quick Period Buttons */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Filter Cepat
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'week', label: 'Minggu Ini', icon: '📅' },
                  { value: 'month', label: 'Bulan Ini', icon: '📆' },
                  { value: 'semester', label: 'Semester Ini', icon: '📚' },
                  { value: 'all', label: 'Semua Data', icon: '📊' }
                ].map(period => (
                  <button
                    key={period.value}
                    onClick={() => handlePeriodChange(period.value)}
                    className={`flex flex-col items-center p-4 rounded-lg border-2 transition-colors ${
                      filters.period === period.value
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <span className="text-2xl mb-2">{period.icon}</span>
                    <span className="text-sm font-medium">{period.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Atau Pilih Rentang Tanggal
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value, period: 'custom' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    id="endDate"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value, period: 'custom' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Selected Period Info */}
            {filters.period && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Periode yang Dipilih:</h3>
                <div className="text-sm text-gray-600">
                  {filters.period === 'all' ? (
                    <span>Semua data absensi</span>
                  ) : filters.startDate && filters.endDate ? (
                    <span>
                      {new Date(filters.startDate).toLocaleDateString('id-ID')} - {' '}
                      {new Date(filters.endDate).toLocaleDateString('id-ID')}
                    </span>
                  ) : (
                    <span>Pilih rentang tanggal</span>
                  )}
                </div>
              </div>
            )}

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Memproses Download...
                </>
              ) : (
                <>
                  <span className="mr-2">⬇️</span>
                  Download Excel
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 mt-3 text-center">
              File akan didownload dalam format .xlsx
            </p>
          </div>

          {/* Preview Info */}
          <div className="mt-6 bg-gray-50 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Mata Pelajaran yang Akan Disertakan:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {user?.subjects.map(subject => (
                <div key={subject} className="flex items-center text-sm text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  {subject}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Setiap mata pelajaran akan memiliki sheet terpisah dalam file Excel
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
