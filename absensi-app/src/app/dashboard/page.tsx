'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface DashboardStats {
  totalStudents: number
  totalAttendanceToday: number
  totalAttendanceThisMonth: number
  recentAttendances: any[]
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch students
        const studentsResponse = await fetch('/api/students')
        const studentsData = await studentsResponse.json()
        
        // Fetch today's attendance
        const today = new Date().toISOString().split('T')[0]
        const todayAttendanceResponse = await fetch(`/api/attendance?startDate=${today}&endDate=${today}`)
        const todayAttendanceData = await todayAttendanceResponse.json()
        
        // Fetch this month's attendance
        const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
        const monthAttendanceResponse = await fetch(`/api/attendance?startDate=${startOfMonth}`)
        const monthAttendanceData = await monthAttendanceResponse.json()
        
        // Fetch recent attendance (last 5)
        const recentAttendanceResponse = await fetch('/api/attendance')
        const recentAttendanceData = await recentAttendanceResponse.json()

        setStats({
          totalStudents: studentsData.students?.length || 0,
          totalAttendanceToday: todayAttendanceData.attendances?.length || 0,
          totalAttendanceThisMonth: monthAttendanceData.attendances?.length || 0,
          recentAttendances: recentAttendanceData.attendances?.slice(0, 5) || []
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

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
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">👥</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Siswa</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalStudents || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">📝</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absen Hari Ini</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalAttendanceToday || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Absen Bulan Ini</p>
                <p className="text-2xl font-semibold text-gray-900">{stats?.totalAttendanceThisMonth || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Aktivitas Absensi Terbaru</h2>
          </div>
          <div className="p-6">
            {stats?.recentAttendances && stats.recentAttendances.length > 0 ? (
              <div className="space-y-4">
                {stats.recentAttendances.map((attendance) => (
                  <div key={attendance.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${
                        attendance.status === 'HADIR' ? 'bg-green-500' :
                        attendance.status === 'IZIN' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{attendance.student.name}</p>
                        <p className="text-sm text-gray-600">{attendance.subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{attendance.status}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(attendance.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">Belum ada data absensi</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a
            href="/dashboard/students"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-900">Kelola Siswa</h3>
              <p className="text-sm text-gray-600 mt-1">Tambah, edit, atau hapus data siswa</p>
            </div>
          </a>

          <a
            href="/dashboard/attendance"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📝</div>
              <h3 className="font-semibold text-gray-900">Catat Absensi</h3>
              <p className="text-sm text-gray-600 mt-1">Catat kehadiran siswa</p>
            </div>
          </a>

          <a
            href="/dashboard/history"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">📊</div>
              <h3 className="font-semibold text-gray-900">Lihat Riwayat</h3>
              <p className="text-sm text-gray-600 mt-1">Lihat riwayat absensi siswa</p>
            </div>
          </a>

          <a
            href="/dashboard/download"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="text-center">
              <div className="text-3xl mb-2">⬇️</div>
              <h3 className="font-semibold text-gray-900">Download Excel</h3>
              <p className="text-sm text-gray-600 mt-1">Export data ke Excel</p>
            </div>
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
