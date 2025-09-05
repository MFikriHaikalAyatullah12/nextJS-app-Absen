import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comparePassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    console.log('Login attempt for email:', email)

    // Validasi input
    if (!email || !password) {
      console.log('Missing email or password')
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      )
    }

    // Cari user berdasarkan email
    const user = await db.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('User not found for email:', email)
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    console.log('User found:', { id: user.id, email: user.email, name: user.name })

    // Verifikasi password
    const isPasswordValid = await comparePassword(password, user.password)

    if (!isPasswordValid) {
      console.log('Invalid password for user:', email)
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      )
    }

    console.log('Password valid, generating token...')

    // Generate token
    const token = generateToken(user.id)
    console.log('Token generated successfully')

    // Return user tanpa password dan token
    const { password: _, ...userWithoutPassword } = user

    const response = NextResponse.json(
      { 
        message: 'Login berhasil',
        user: userWithoutPassword 
      },
      { status: 200 }
    )

    // Set cookie token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: false, // Set ke false untuk development
      sameSite: 'lax', // Ubah dari strict ke lax
      maxAge: 7 * 24 * 60 * 60, // 7 hari
      path: '/' // Pastikan path di-set
    })

    console.log('Login successful, cookie set with token:', token.substring(0, 20) + '...')
    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
