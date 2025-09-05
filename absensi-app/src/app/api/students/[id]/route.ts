import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

// PUT - Update siswa
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Cek apakah NIS sudah ada (kecuali untuk siswa yang sedang diupdate)
    const existingNis = await db.student.findFirst({
      where: { 
        nis,
        NOT: { id }
      }
    })

    if (existingNis) {
      return NextResponse.json(
        { error: 'NIS sudah digunakan oleh siswa lain' },
        { status: 400 }
      )
    }

    // Cek apakah siswa ada dan milik guru yang login
    const existingStudent = await db.student.findFirst({
      where: {
        id: id,
        teacherId: payload.userId
      }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    const student = await db.student.update({
      where: { id: id },
      data: { 
        name,
        nis
      }
    })

    return NextResponse.json(
      { 
        message: 'Data siswa berhasil diupdate',
        student 
      },
      { status: 200 }
    )

  } catch (error) {
    console.error('Update student error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}

// DELETE - Hapus siswa
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Cek apakah siswa ada dan milik guru yang login
    const existingStudent = await db.student.findFirst({
      where: {
        id: id,
        teacherId: payload.userId
      }
    })

    if (!existingStudent) {
      return NextResponse.json(
        { error: 'Siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    await db.student.delete({
      where: { id: id }
    })

    return NextResponse.json(
      { message: 'Siswa berhasil dihapus' },
      { status: 200 }
    )

  } catch (error) {
    console.error('Delete student error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
