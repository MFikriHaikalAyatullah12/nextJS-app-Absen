 import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// GET - Ambil semua siswa untuk guru yang login
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

    const students = await db.student.findMany({
      where: { teacherId: payload.userId },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ students }, { status: 200 })

  } catch (error) {
    console.error('Get students error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// POST - Tambah siswa baru
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

    const { name, nis } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: 'Nama siswa harus diisi' },
        { status: 400 }
      )
    }

    if (!nis) {
      return NextResponse.json(
        { error: 'NIS harus diisi' },
        { status: 400 }
      )
    }

    // Validasi format NIS (hanya angka dan titik)
    const nisPattern = /^[0-9.]+$/
    if (!nisPattern.test(nis)) {
      return NextResponse.json(
        { error: 'NIS hanya boleh berisi angka dan titik' },
        { status: 400 }
      )
    }

    // Cek apakah NIS sudah ada
    const existingStudent = await db.student.findUnique({
      where: { nis }
    })

    if (existingStudent) {
      return NextResponse.json(
        { error: 'NIS sudah digunakan oleh siswa lain' },
        { status: 400 }
      )
    }

    // Ambil data guru untuk mendapatkan grade
    const teacher = await db.user.findUnique({
      where: { id: payload.userId }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: 'Guru tidak ditemukan' },
        { status: 404 }
      )
    }

    const student = await db.student.create({
      data: {
        name,
        nis,
        grade: teacher.grade,
        teacherId: payload.userId
      }
    })

    return NextResponse.json(
      { 
        message: 'Siswa berhasil ditambahkan',
        student 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Add student error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
