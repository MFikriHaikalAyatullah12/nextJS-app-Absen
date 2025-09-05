const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test connection with a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database connection successful!')
    console.log('Test query result:', result)
    
    // Test if tables exist
    const userCount = await prisma.user.count()
    console.log(`✅ Users table accessible. Current count: ${userCount}`)
    
    const studentCount = await prisma.student.count()
    console.log(`✅ Students table accessible. Current count: ${studentCount}`)
    
    const attendanceCount = await prisma.attendance.count()
    console.log(`✅ Attendance table accessible. Current count: ${attendanceCount}`)
    
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error(error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
