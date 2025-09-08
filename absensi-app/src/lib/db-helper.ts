import { db } from './db'

// Helper function untuk retry database operations saat Neon database sleep
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 2, // Kurangi retry untuk kecepatan
  delay: number = 500 // Delay lebih kecil
): Promise<T> {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      
      // Jika error adalah connection error dan bukan attempt terakhir
      if (
        (error.code === 'P1001' || error.message.includes("Can't reach database server")) &&
        attempt < maxRetries
      ) {
        console.log(`Database connection attempt ${attempt} failed, retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
        delay *= 1.5 // Exponential backoff yang lebih cepat
        continue
      }
      
      throw error
    }
  }
  
  throw lastError!
}

// Wrapper untuk operasi database yang umum digunakan
export const dbOperations = {
  async findUserByEmail(email: string) {
    return withRetry(() => db.user.findUnique({ where: { email } }))
  },
  
  async createUser(data: any) {
    return withRetry(() => db.user.create({ data }))
  },
  
  async findStudents() {
    return withRetry(() => db.student.findMany())
  },
  
  async createStudent(data: any) {
    return withRetry(() => db.student.create({ data }))
  },
  
  async createAttendance(data: any) {
    return withRetry(() => db.attendance.create({ data }))
  },
  
  async findAttendanceWithStudents(where?: any) {
    return withRetry(() => db.attendance.findMany({
      where,
      include: { student: true },
      orderBy: { date: 'desc' }
    }))
  }
}
