// Mata pelajaran untuk setiap kelas
export const SUBJECTS_BY_GRADE = {
  1: [
    'Bahasa Indonesia',
    'Matematika', 
    'Pendidikan Pancasila',
    'Pendidikan Agama Islam',
    'Seni Rupa',
    'Seni Teater',
    'Seni Musik',
    'Seni Tari',
    'Penjas'
  ],
  2: [
    'Bahasa Indonesia',
    'Matematika',
    'Pendidikan Pancasila', 
    'Pendidikan Agama Islam',
    'Seni Rupa',
    'Seni Teater',
    'Seni Musik',
    'Seni Tari',
    'Penjas'
  ],
  3: [
    'Bahasa Indonesia',
    'Matematika',
    'Pendidikan Pancasila',
    'Pendidikan Agama Islam',
    'Seni Rupa',
    'Seni Teater', 
    'Seni Musik',
    'Seni Tari',
    'Penjas'
  ],
  4: [
    'Bahasa Indonesia',
    'Matematika',
    'Pendidikan Pancasila',
    'Pendidikan Agama Islam',
    'Seni Rupa',
    'Seni Teater',
    'Seni Musik',
    'Seni Tari',
    'Penjas',
    'Bahasa Inggris',
    'IPAS'
  ],
  5: [
    'Bahasa Indonesia',
    'Matematika',
    'Pendidikan Pancasila',
    'Pendidikan Agama Islam',
    'Seni Rupa',
    'Seni Teater',
    'Seni Musik',
    'Seni Tari',
    'Penjas',
    'Bahasa Inggris',
    'IPAS'
  ],
  6: [
    'Bahasa Indonesia',
    'Matematika',
    'Pendidikan Pancasila',
    'Pendidikan Agama Islam',
    'Seni Rupa',
    'Seni Teater',
    'Seni Musik',
    'Seni Tari',
    'Penjas',
    'Bahasa Inggris',
    'IPAS'
  ]
} as const

// Mata pelajaran default untuk wali kelas (semua mata pelajaran)
export const getSubjectsForGrade = (grade: number): string[] => {
  if (grade >= 1 && grade <= 3) {
    return [
      'Bahasa Indonesia',
      'Matematika',
      'Pendidikan Pancasila',
      'Pendidikan Agama Islam',
      'Seni Rupa',
      'Seni Teater',
      'Seni Musik',
      'Seni Tari',
      'Penjas'
    ]
  } else if (grade >= 4 && grade <= 6) {
    return [
      'Bahasa Indonesia',
      'Matematika',
      'Pendidikan Pancasila',
      'Pendidikan Agama Islam',
      'Seni Rupa',
      'Seni Teater',
      'Seni Musik',
      'Seni Tari',
      'Penjas',
      'Bahasa Inggris',
      'IPAS'
    ]
  }
  return []
}

export const ATTENDANCE_STATUS = {
  HADIR: 'Hadir',
  IZIN: 'Izin', 
  ALPA: 'Alpa'
} as const

export const GRADES = [1, 2, 3, 4, 5, 6] as const
