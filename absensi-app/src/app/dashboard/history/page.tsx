'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface Attendance {
  id: string
  date: string
  subject: string
  status: 'HADIR' | 'IZIN' | 'ALPA'
  student: {
    id: string
    name: string
  }
}

interface User {
  id: string
  name: string
  email: string
  grade: number
  subjects: string[]
}

export default function History() {
  const [attendances, setAttendances] = useState<Attendance[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    subject: '',
    startDate: '',
    endDate: '',
    period: ''
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (user) {
      fetchAttendances()
    }
  }, [filters, user])

  const fetchInitialData = async () => {
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

  const fetchAttendances = async () => {
    try {
      let url = '/api/attendance?'
      const params = new URLSearchParams()

      if (filters.subject) {
        params.append('subject', filters.subject)
      }

      if (filters.startDate) {
        params.append('startDate', filters.startDate)
      }

      if (filters.endDate) {
        params.append('endDate', filters.endDate)
      }

      const response = await fetch(`/api/attendance?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setAttendances(data.attendances)
      }
    } catch (error) {
      console.error('Error fetching attendances:', error)
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
      default:
        startDate = ''
        endDate = ''
    }

    setFilters(prev => ({
      ...prev,
      period,
      startDate,
      endDate
    }))
  }

  const getAttendanceStats = () => {
    const stats = attendances.reduce((acc, attendance) => {
      if (!acc[attendance.student.id]) {
        acc[attendance.student.id] = {
          name: attendance.student.name,
          hadir: 0,
          izin: 0,
          alpa: 0,
          total: 0
        }
      }
      acc[attendance.student.id][attendance.status.toLowerCase() as 'hadir' | 'izin' | 'alpa']++
      acc[attendance.student.id].total++
      return acc
    }, {} as Record<string, any>)

    return Object.values(stats)
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

  const attendanceStats = getAttendanceStats()

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Riwayat Absensi</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filter Data</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Mata Pelajaran
              </label>
              <select
                id="subject"
                value={filters.subject}
                onChange={(e) => setFilters(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Mata Pelajaran</option>
                {user?.subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai
              </label>
              <input
                type="date"
                id="startDate"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
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
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Cepat
              </label>
              <div className="space-y-2">
                {[
                  { value: 'week', label: 'Minggu Ini' },
                  { value: 'month', label: 'Bulan Ini' },
                  { value: 'semester', label: 'Semester Ini' }
                ].map(period => (
                  <button
                    key={period.value}
                    onClick={() => handlePeriodChange(period.value)}
                    className={`w-full text-left px-3 py-1 rounded text-sm ${
                      filters.period === period.value
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {period.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Summary */}
        {attendanceStats.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Statistik</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hadir
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Izin
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Alpa
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Persentase Hadir
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceStats.map((stat: any) => (
                    <tr key={stat.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stat.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-green-600 font-medium">
                        {stat.hadir}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-yellow-600 font-medium">
                        {stat.izin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-red-600 font-medium">
                        {stat.alpa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900 font-medium">
                        {stat.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                        <span className={`font-medium ${
                          stat.total > 0 && (stat.hadir / stat.total) >= 0.8
                            ? 'text-green-600'
                            : stat.total > 0 && (stat.hadir / stat.total) >= 0.6
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}>
                          {stat.total > 0 ? Math.round((stat.hadir / stat.total) * 100) : 0}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Attendance Details */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Detail Absensi</h2>
          </div>
          
          {attendances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mata Pelajaran
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendances.map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(attendance.date).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {attendance.student.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attendance.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attendance.status === 'HADIR'
                            ? 'bg-green-100 text-green-800'
                            : attendance.status === 'IZIN'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attendance.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tidak ada data absensi</h3>
              <p className="text-gray-600">
                {filters.subject || filters.startDate || filters.endDate
                  ? 'Tidak ada data dengan filter yang dipilih.'
                  : 'Belum ada data absensi yang tercatat.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
