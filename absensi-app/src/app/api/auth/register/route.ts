import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { SUBJECTS_BY_GRADE } from '@/lib/constants'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, grade, subjects } = await request.json()

    // Validasi input
    if (!email || !password || !name || !grade || !subjects) {
      return NextResponse.json(
        { error: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Validasi grade
    if (grade < 1 || grade > 6) {
      return NextResponse.json(
        { error: 'Kelas harus antara 1-6' },
        { status: 400 }
      )
    }

    // Validasi subjects berdasarkan grade
    const availableSubjects = SUBJECTS_BY_GRADE[grade as keyof typeof SUBJECTS_BY_GRADE]
    const invalidSubjects = subjects.filter((subject: string) => !(availableSubjects as readonly string[]).includes(subject))
    
    if (invalidSubjects.length > 0) {
      return NextResponse.json(
        { error: `Mata pelajaran tidak valid untuk kelas ${grade}` },
        { status: 400 }
      )
    }

    // Cek apakah email sudah ada
    const existingUser = await db.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Buat user baru
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        grade,
        subjects
      }
    })

    // Return user tanpa password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'Registrasi berhasil',
        user: userWithoutPassword 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
