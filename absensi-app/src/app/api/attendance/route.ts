import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// POST - Catat absensi
export async function POST(request: NextRequest) {
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

    const { attendanceData } = await request.json()

    if (!attendanceData || !Array.isArray(attendanceData)) {
      return NextResponse.json(
        { error: 'Data absensi tidak valid' },
        { status: 400 }
      )
    }

    // Validasi setiap data absensi
    for (const data of attendanceData) {
      if (!data.studentId || !data.subject || !data.status) {
        return NextResponse.json(
          { error: 'Data absensi tidak lengkap' },
          { status: 400 }
        )
      }

      if (!['HADIR', 'IZIN', 'ALPA'].includes(data.status)) {
        return NextResponse.json(
          { error: 'Status absensi tidak valid' },
          { status: 400 }
        )
      }
    }

    // Simpan semua data absensi
    const attendances = await Promise.all(
      attendanceData.map((data: any) =>
        db.attendance.create({
          data: {
            studentId: data.studentId,
            subject: data.subject,
            status: data.status,
            teacherId: payload.userId,
            date: data.date ? new Date(data.date) : new Date()
          },
          include: {
            student: true
          }
        })
      )
    )

    return NextResponse.json(
      { 
        message: 'Absensi berhasil disimpan',
        attendances 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Save attendance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// GET - Ambil data absensi dengan filter
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
    const subject = searchParams.get('subject')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const studentId = searchParams.get('studentId')

    // Build filter
    const where: any = {
      teacherId: payload.userId
    }

    if (subject) {
      where.subject = subject
    }

    if (studentId) {
      where.studentId = studentId
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    } else if (startDate) {
      where.date = {
        gte: new Date(startDate)
      }
    } else if (endDate) {
      where.date = {
        lte: new Date(endDate)
      }
    }

    const attendances = await db.attendance.findMany({
      where,
      include: {
        student: true
      },
      orderBy: {
        date: 'desc'
      }
    })

    return NextResponse.json({ attendances }, { status: 200 })

  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
