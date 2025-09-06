import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'
import * as XLSX from 'xlsx'

interface AttendanceWithStudent {
  id: string
  date: Date
  subject: string
  status: string
  studentId: string
  teacherId: string
  createdAt: Date
  updatedAt: Date
  student: {
    id: string
    name: string
    grade: number
  }
}

interface StudentStats {
  name: string
  hadir: number
  izin: number
  alpa: number
  total: number
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Token tidak ditemukan' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Token tidak valid' },
        { status: 401 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build filter
    const where: {
      teacherId: string
      date?: {
        gte?: Date
        lte?: Date
      }
    } = {
      teacherId: payload.userId
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    // Ambil data guru untuk info kelas
    const teacher = await db.user.findUnique({
      where: { id: payload.userId }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Guru tidak ditemukan' },
        { status: 404 }
      )
    }

    // Ambil semua data absensi
    const attendances = await db.attendance.findMany({
      where,
      include: {
        student: true
      },
      orderBy: [
        { subject: 'asc' },
        { date: 'asc' },
        { student: { name: 'asc' } }
      ]
    }) as AttendanceWithStudent[]

    // Group by subject
    const attendancesBySubject = attendances.reduce((acc: Record<string, AttendanceWithStudent[]>, attendance: AttendanceWithStudent) => {
      if (!acc[attendance.subject]) {
        acc[attendance.subject] = []
      }
      acc[attendance.subject].push(attendance)
      return acc
    }, {} as Record<string, AttendanceWithStudent[]>)

    // Buat workbook baru
    const workbook = XLSX.utils.book_new()

    // Untuk setiap mata pelajaran, buat sheet terpisah
    for (const [subject, subjectAttendances] of Object.entries(attendancesBySubject)) {
      // Group by student untuk menghitung statistik
      const studentStats = subjectAttendances.reduce((acc: Record<string, StudentStats>, attendance: AttendanceWithStudent) => {
        const studentId = attendance.studentId
        if (!acc[studentId]) {
          acc[studentId] = {
            name: attendance.student.name,
            hadir: 0,
            izin: 0,
            alpa: 0,
            total: 0
          }
        }
        
        const status = attendance.status.toUpperCase()
        if (status === 'HADIR') {
          acc[studentId].hadir++
        } else if (status === 'IZIN') {
          acc[studentId].izin++
        } else if (status === 'ALFA') {
          acc[studentId].alpa++
        }
        
        acc[studentId].total++
        return acc
      }, {} as Record<string, StudentStats>)

      // Buat data untuk sheet
      const sheetData: (string | number)[][] = [
        ['REKAP ABSENSI'],
        [`Kelas: ${teacher.grade}`],
        [`Mata Pelajaran: ${subject}`],
        [`Periode: ${startDate ? new Date(startDate).toLocaleDateString('id-ID') : 'Semua'} - ${endDate ? new Date(endDate).toLocaleDateString('id-ID') : 'Semua'}`],
        [],
        ['No', 'Nama Siswa', 'Total Hadir', 'Total Izin', 'Total Alfa', 'Total Keseluruhan']
      ]

      // Tambahkan data siswa
      Object.values(studentStats).forEach((student: StudentStats, index) => {
        sheetData.push([
          index + 1,
          student.name,
          student.hadir,
          student.izin,
          student.alpa,
          student.total
        ])
      })

      // Tambahkan baris total
      const grandTotal = Object.values(studentStats).reduce((acc, student) => ({
        hadir: acc.hadir + student.hadir,
        izin: acc.izin + student.izin,
        alpa: acc.alpa + student.alpa,
        total: acc.total + student.total
      }), { hadir: 0, izin: 0, alpa: 0, total: 0 })

      sheetData.push([
        '',
        'TOTAL',
        grandTotal.hadir,
        grandTotal.izin,
        grandTotal.alpa,
        grandTotal.total
      ])

      // Tambahkan detail absensi per tanggal
      sheetData.push([])
      sheetData.push(['DETAIL ABSENSI PER TANGGAL'])
      sheetData.push(['Tanggal', 'Nama Siswa', 'Status'])

      subjectAttendances.forEach((attendance: AttendanceWithStudent) => {
        sheetData.push([
          attendance.date.toLocaleDateString('id-ID'),
          attendance.student.name,
          attendance.status
        ])
      })

      // Buat worksheet
      const worksheet = XLSX.utils.aoa_to_sheet(sheetData)

      // Set lebar kolom untuk readability yang lebih baik
      worksheet['!cols'] = [
        { wch: 5 },   // No
        { wch: 25 },  // Nama Siswa
        { wch: 14 },  // Total Hadir
        { wch: 14 },  // Total Izin
        { wch: 14 },  // Total Alfa
        { wch: 20 },  // Total Keseluruhan
      ]

      // Tambahkan worksheet ke workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, subject.substring(0, 31)) // Excel sheet name max 31 chars
    }

    // Convert workbook to buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' })

    // Set headers for file download
    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    headers.set('Content-Disposition', `attachment; filename="Rekap_Absensi_Kelas_${teacher.grade}_${new Date().toISOString().split('T')[0]}.xlsx"`)

    return new NextResponse(excelBuffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Export excel error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
