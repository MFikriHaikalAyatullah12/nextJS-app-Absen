# Sistem Absensi Sekolah Dasar

Sistem manajemen absensi siswa untuk guru sekolah dasar kelas 1-6 yang dibangun dengan Next.js, TypeScript, Tailwind CSS, dan PostgreSQL.

## 🚀 Fitur Utama

### 1. **Autentikasi & Manajemen Akun**
- ✅ Registrasi guru dengan pemilihan kelas (1-6)
- ✅ Login/logout yang aman
- ✅ Sistem autentikasi berbasis JWT
- ✅ Fitur hapus akun dengan konfirmasi

### 2. **Manajemen Data Siswa**
- ✅ Tambah, edit, dan hapus data siswa
- ✅ Data siswa otomatis terkait dengan kelas guru
- ✅ Interface yang user-friendly

### 3. **Sistem Absensi**
- ✅ Catat kehadiran siswa per mata pelajaran
- ✅ Status kehadiran: Hadir, Izin, Alpa
- ✅ Pemilihan tanggal dan mata pelajaran
- ✅ Ringkasan real-time saat pencatatan

### 4. **Riwayat & Laporan**
- ✅ Lihat riwayat absensi dengan filter lengkap
- ✅ Filter berdasarkan mata pelajaran, tanggal, periode
- ✅ Filter cepat: mingguan, bulanan, semester
- ✅ Statistik kehadiran per siswa
- ✅ Persentase kehadiran dengan indikator warna

### 5. **Export Excel**
- ✅ Download laporan dalam format Excel (.xlsx)
- ✅ Sheet terpisah untuk setiap mata pelajaran
- ✅ Ringkasan statistik per siswa
- ✅ Detail absensi per tanggal
- ✅ Filter periode yang fleksibel

### 6. **Dashboard Informatif**
- ✅ Statistik keseluruhan (jumlah siswa, absen hari ini, dll.)
- ✅ Aktivitas absensi terbaru
- ✅ Menu navigasi yang intuitif
- ✅ Quick actions untuk akses cepat

## 📚 Mata Pelajaran

### Kelas 1-3:
- Bahasa Indonesia
- Matematika
- Pendidikan Pancasila
- Pendidikan Agama Islam
- Seni (Rupa, Teater, Musik, Tari)
- Penjas

### Kelas 4-6:
- Bahasa Indonesia
- Matematika
- Pendidikan Pancasila
- Pendidikan Agama Islam
- Seni (Rupa, Teater, Musik, Tari)
- Penjas
- Bahasa Inggris
- IPAS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 + React 18
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Styling**: Tailwind CSS
- **Authentication**: JWT + HTTP-only cookies
- **Excel Export**: xlsx library
- **Type Safety**: TypeScript
- **Deployment**: Vercel-ready

## 📦 Instalasi & Setup

### 1. Clone Repository
```bash
git clone <repository-url>
cd absensi-app
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Buat file `.env.local`:
```env
# Database
DATABASE_URL="your-postgresql-connection-string"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# JWT Secret
JWT_SECRET="your-jwt-secret-key-here"
```

### 4. Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

## 🚀 Deployment ke Vercel

### 1. Push ke GitHub
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy ke Vercel
1. Buka [Vercel Dashboard](https://vercel.com)
2. Import project dari GitHub
3. Set environment variables di Vercel:
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `JWT_SECRET`
4. Deploy!

### 3. Setup Database Production
```bash
# Setelah deploy, push schema ke production database
npx prisma db push
```

## 📱 Penggunaan

### 1. **Registrasi Pertama**
- Buka halaman utama
- Klik "Daftar Akun Baru"
- Isi data guru dan pilih kelas
- Pilih mata pelajaran yang akan diajar
- Daftar dan login

### 2. **Mengelola Siswa**
- Masuk ke menu "Data Siswa"
- Tambah siswa satu per satu
- Edit/hapus data siswa sesuai kebutuhan

### 3. **Mencatat Absensi**
- Pilih menu "Absensi"
- Pilih tanggal dan mata pelajaran
- Tandai kehadiran setiap siswa
- Simpan data absensi

### 4. **Melihat Laporan**
- Menu "Riwayat Absen" untuk statistik
- Menu "Download" untuk export Excel
- Gunakan filter untuk periode tertentu

## 🔒 Keamanan

- ✅ Password di-hash dengan bcrypt
- ✅ JWT token aman dengan HTTP-only cookies
- ✅ Validasi input di frontend dan backend
- ✅ Middleware autentikasi untuk halaman protected
- ✅ SQL injection protection dengan Prisma ORM

## 📊 Database Schema

```prisma
model User {
  id       String   @id @default(cuid())
  email    String   @unique
  name     String
  password String
  grade    Int      // 1-6
  subjects String[] // mata pelajaran
  
  students    Student[]
  attendances Attendance[]
}

model Student {
  id    String @id @default(cuid())
  name  String
  grade Int
  
  teacher     User @relation(fields: [teacherId], references: [id])
  teacherId   String
  attendances Attendance[]
}

model Attendance {
  id      String @id @default(cuid())
  date    DateTime @default(now())
  subject String
  status  AttendanceStatus // HADIR, IZIN, ALPA
  
  student   Student @relation(fields: [studentId], references: [id])
  studentId String
  teacher   User @relation(fields: [teacherId], references: [id])
  teacherId String
}
```

## 🤝 Kontribusi

1. Fork repository
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🆘 Support

Jika mengalami masalah:
1. Pastikan semua dependencies terinstall
2. Periksa environment variables
3. Pastikan database connection string benar
4. Cek console browser untuk error

## 🎯 Roadmap

- [ ] Export PDF reports
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Multi-sekolah support
- [ ] Advanced analytics
- [ ] Backup & restore data

---

**Dibuat dengan ❤️ untuk memudahkan guru dalam mengelola absensi siswa**
