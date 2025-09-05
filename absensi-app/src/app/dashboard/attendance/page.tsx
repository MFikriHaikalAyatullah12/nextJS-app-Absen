'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'

interface Student {
  id: string
  name: string
  grade: number
}

interface User {
  id: string
  name: string
  email: string
  grade: number
  subjects: string[]
}

interface AttendanceData {
  studentId: string
  status: 'HADIR' | 'IZIN' | 'ALPA'
}

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [selectedSubject, setSelectedSubject] = useState('')
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceData>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    try {
      // Fetch user data
      const userResponse = await fetch('/api/auth/me')
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setUser(userData.user)
      }

      // Fetch students
      const studentsResponse = await fetch('/api/students')
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setStudents(studentsData.students)
        
        // Initialize attendance data
        const initialAttendance: Record<string, AttendanceData> = {}
        studentsData.students.forEach((student: Student) => {
          initialAttendance[student.id] = {
            studentId: student.id,
            status: 'HADIR'
          }
        })
        setAttendanceData(initialAttendance)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = (studentId: string, status: 'HADIR' | 'IZIN' | 'ALPA') => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }))
  }

  const handleSubmit = async () => {
    if (!selectedSubject) {
      alert('Pilih mata pelajaran terlebih dahulu')
      return
    }

    setIsSubmitting(true)

    try {
      const attendanceArray = Object.values(attendanceData).map(data => ({
        ...data,
        subject: selectedSubject,
        date: selectedDate
      }))

      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attendanceData: attendanceArray }),
      })

      if (response.ok) {
        alert('Absensi berhasil disimpan!')
        
        // Reset form
        const initialAttendance: Record<string, AttendanceData> = {}
        students.forEach((student) => {
          initialAttendance[student.id] = {
            studentId: student.id,
            status: 'HADIR'
          }
        })
        setAttendanceData(initialAttendance)
        setSelectedSubject('')
      } else {
        const data = await response.json()
        alert(data.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      alert('Terjadi kesalahan jaringan')
    } finally {
      setIsSubmitting(false)
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

  if (students.length === 0) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada data siswa</h3>
          <p className="text-gray-600 mb-4">Tambahkan siswa terlebih dahulu sebelum melakukan absensi.</p>
          <a
            href="/dashboard/students"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Tambah Siswa
          </a>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Catat Absensi</h1>

        {/* Form Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal
              </label>
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                Mata Pelajaran
              </label>
              <select
                id="subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Pilih mata pelajaran</option>
                {user?.subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSubmit}
                disabled={!selectedSubject || isSubmitting}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Absensi'}
              </button>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Daftar Siswa Kelas {user?.grade}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nama Siswa
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Kehadiran
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{student.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center space-x-4">
                        {(['HADIR', 'IZIN', 'ALPA'] as const).map((status) => (
                          <label key={status} className="flex items-center">
                            <input
                              type="radio"
                              name={`attendance-${student.id}`}
                              checked={attendanceData[student.id]?.status === status}
                              onChange={() => handleStatusChange(student.id, status)}
                              className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                            />
                            <span className={`text-sm font-medium ${
                              status === 'HADIR' ? 'text-green-700' :
                              status === 'IZIN' ? 'text-yellow-700' : 'text-red-700'
                            }`}>
                              {status}
                            </span>
                          </label>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        {selectedSubject && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Ringkasan:</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-green-700 font-medium">
                  Hadir: {Object.values(attendanceData).filter(data => data.status === 'HADIR').length}
                </span>
              </div>
              <div>
                <span className="text-yellow-700 font-medium">
                  Izin: {Object.values(attendanceData).filter(data => data.status === 'IZIN').length}
                </span>
              </div>
              <div>
                <span className="text-red-700 font-medium">
                  Alpa: {Object.values(attendanceData).filter(data => data.status === 'ALPA').length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
