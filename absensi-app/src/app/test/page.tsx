'use client'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          🎉 Login Berhasil!
        </h1>
        <p className="text-gray-600 mb-8">
          Halaman test - redirect berhasil
        </p>
        <a 
          href="/dashboard" 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Lanjut ke Dashboard
        </a>
      </div>
    </div>
  )
}
