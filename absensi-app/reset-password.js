const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

async function resetPassword() {
  const prisma = new PrismaClient()
  
  try {
    const email = 'devy@gmail.com'
    const newPassword = '123456'
    
    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 12)
    
    // Update password
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    })
    
    console.log(`✅ Password untuk ${email} berhasil direset ke: ${newPassword}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

resetPassword()
