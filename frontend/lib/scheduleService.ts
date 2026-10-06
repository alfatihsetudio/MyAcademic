/**
 * Centralized Academic Schedule Service (myAcademic)
 * Synchronizes weekly KBM timetable between Admin, Guru, and Murid/Siswa in real time.
 */

export interface ScheduleLesson {
  subject: string;
  code: string;
  teacher: string;
  room: string;
  category: 'MIPA' | 'Bahasa' | 'Informatika' | 'Agama' | 'Sosial' | 'Olahraga' | 'Seni' | 'Umum';
  topics?: string;
  status?: string;
  accentBorder?: string;
}

export interface ScheduleSlot {
  id: string;
  rowNum: number;
  period: string; // e.g. "Jam Ke 1 - 2", "Pra-KBM", "Istirahat I"
  time: string;   // e.g. "07:30 - 09:00"
  startTime: string; // e.g. "07:30"
  endTime: string;   // e.g. "09:00"
  isBreak?: boolean;
  breakLabel?: string;
  days: Record<string, ScheduleLesson | null>;
}

export const SCHEDULE_DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const DEFAULT_WEEKLY_SLOTS: ScheduleSlot[] = [
  {
    id: 'slot-1',
    rowNum: 1,
    period: 'Pra-KBM',
    time: '07:00 - 07:30',
    startTime: '07:00',
    endTime: '07:30',
    isBreak: false,
    days: {
      Senin: { subject: 'Upacara Bendera Mingguan', code: 'UPC', teacher: 'Pembina Upacara & Dewan Guru', room: 'Lapangan Utama', category: 'Umum' },
      Selasa: { subject: 'Literasi Akademik & Pembiasaan', code: 'LIT', teacher: 'Wali Kelas / Tim Literasi', room: 'R. 204 Gedung B', category: 'Umum' },
      Rabu: { subject: 'Apel Penguatan Karakter', code: 'APL', teacher: 'Tim Kedisiplinan Sekolah', room: 'Lapangan / Ruang Kelas', category: 'Umum' },
      Kamis: { subject: 'Senam Kebugaran Jasmani', code: 'SNM', teacher: 'Instruktur PJOK', room: 'Lapangan Olahraga', category: 'Olahraga' },
      Jumat: { subject: 'Pembinaan Rohani & Doa Bersama', code: 'DHU', teacher: 'Guru PAI & Takmir Masjid', room: 'Masjid Sekolah', category: 'Agama' },
      Sabtu: { subject: 'Perwalian & Manajemen Kelas', code: 'WLI', teacher: 'Dra. Endang Supartini', room: 'R. 204 Gedung B', category: 'Umum' },
    }
  },
  {
    id: 'slot-2',
    rowNum: 2,
    period: 'Jam Ke 1 - 2',
    time: '07:30 - 09:00',
    startTime: '07:30',
    endTime: '09:00',
    isBreak: false,
    days: {
      Senin: { subject: 'Matematika Wajib', code: 'MTK-10', teacher: 'Drs. Bambang Sudiro, M.Pd', room: 'R. 204 Gedung B', category: 'MIPA', topics: 'Sistem Persamaan Linear Tiga Variabel & Matriks Ordo 3x3', status: 'Sedang Berlangsung' },
      Selasa: { subject: 'Kimia Organik', code: 'KIM-10', teacher: 'Dra. Endang Supartini', room: 'Lab Kimia Lt. 2', category: 'MIPA', topics: 'Senyawa Hidrokarbon & Tata Nama Gugus Fungsi' },
      Rabu: { subject: 'Bahasa Inggris', code: 'ENG-10', teacher: 'David Prasetyo, M.Hum', room: 'R. 204 Gedung B', category: 'Bahasa', topics: 'Analytical Exposition Text & Reading Comprehension' },
      Kamis: { subject: 'Informatika & Algoritma', code: 'INF-10', teacher: 'Yusuf Ramadhan, S.Kom', room: 'Lab Komputer 1', category: 'Informatika', topics: 'Logika Algoritma & Dasar Pemrograman Python' },
      Jumat: { subject: 'Pendidikan Agama Islam', code: 'PAI-10', teacher: 'Ustadz Ahmad Fauzi, Lc', room: 'R. 204 Gedung B', category: 'Agama', topics: 'Kajian QS. Al-Hujurat tentang Toleransi & Ukhuwah' },
      Sabtu: { subject: 'Seni Budaya & Prakarya', code: 'SNB-10', teacher: 'Dewi Sartika, S.Sn', room: 'Ruang Kesenian', category: 'Seni', topics: 'Eksplorasi Harmoni Musik Tradisional Nusantara' },
    }
  },
  {
    id: 'slot-3',
    rowNum: 3,
    period: 'Jam Ke 3 - 4',
    time: '09:15 - 10:45',
    startTime: '09:15',
    endTime: '10:45',
    isBreak: false,
    days: {
      Senin: { subject: 'Bahasa Indonesia', code: 'BIN-10', teacher: 'Nurul Hidayati, S.Pd', room: 'R. 204 Gedung B', category: 'Bahasa', topics: 'Analisis Karakteristik & Nilai Edukatif Teks Hikayat', status: 'Berikutnya' },
      Selasa: { subject: 'Biologi Terapan', code: 'BIO-10', teacher: 'Ratna Wulandari, S.Si', room: 'Lab Biologi Lt. 1', category: 'MIPA', topics: 'Struktur Membran Sel & Transpor Pasif Organel' },
      Rabu: { subject: 'Sejarah Indonesia', code: 'SEJ-10', teacher: 'Subagio, M.Pd', room: 'R. 204 Gedung B', category: 'Sosial', topics: 'Dinamika Kolonialisme Belanda & Perang Diponegoro' },
      Kamis: { subject: 'PJOK / Penjasorkes', code: 'PJK-10', teacher: 'Bambang Triantoro, S.Pd', room: 'Lapangan Olahraga', category: 'Olahraga', topics: 'Teknik Dasar Bola Basket: Passing & Pivot' },
      Jumat: { subject: 'Pendidikan Pancasila (PPKn)', code: 'PPK-10', teacher: 'Drs. Wahyudi, M.Si', room: 'R. 204 Gedung B', category: 'Sosial', topics: 'Harmonisasi Hak & Kewajiban Warga Negara' },
      Sabtu: { subject: 'Matematika Peminatan', code: 'MTK-P', teacher: 'Drs. Bambang Sudiro, M.Pd', room: 'R. 204 Gedung B', category: 'MIPA', topics: 'Operasi Aljabar Vektor Tiga Dimensi' },
    }
  },
  {
    id: 'slot-4',
    rowNum: 4,
    period: 'Istirahat I',
    time: '10:45 - 11:15',
    startTime: '10:45',
    endTime: '11:15',
    isBreak: true,
    breakLabel: 'Istirahat Sesi I (10:45 – 11:15 WIB)',
    days: {}
  },
  {
    id: 'slot-5',
    rowNum: 5,
    period: 'Jam Ke 5 - 6',
    time: '11:15 - 12:45',
    startTime: '11:15',
    endTime: '12:45',
    isBreak: false,
    days: {
      Senin: { subject: 'Fisika Dasar', code: 'FIS-10', teacher: 'Ir. Hendra Gunawan, M.T', room: 'Lab Fisika Lt. 1', category: 'MIPA', topics: 'Hukum Dinamika Partikel Newton & Gesekan Permukaan', status: 'Akan Datang' },
      Selasa: { subject: 'Bahasa Indonesia (Lanjutan)', code: 'BIN-10', teacher: 'Nurul Hidayati, S.Pd', room: 'R. 204 Gedung B', category: 'Bahasa', topics: 'Kaidah Kebahasaan & Penulisan Esai Argumentatif' },
      Rabu: { subject: 'Praktikum Fisika', code: 'FIS-10', teacher: 'Ir. Hendra Gunawan, M.T', room: 'Lab Fisika Lt. 1', category: 'MIPA', topics: 'Uji Eksperimen Koefisien Gesek Statis dan Kinetis' },
      Kamis: { subject: 'Praktikum Kimia', code: 'KIM-10', teacher: 'Dra. Endang Supartini', room: 'Lab Kimia Lt. 2', category: 'MIPA', topics: 'Identifikasi Gugus Fungsi Aldehid & Keton' },
      Jumat: { subject: 'Bimbingan Konseling (BK)', code: 'BK-10', teacher: 'Siti Nurhaliza, M.Pd', room: 'R. Konseling BK', category: 'Umum', topics: 'Pemetaan Bakat & Perencanaan Studi Lanjut' },
      Sabtu: { subject: 'Projek P5 (Profil Pancasila)', code: 'P5-10', teacher: 'Tim Fasilitator P5', room: 'Aula Gedung C', category: 'Umum', topics: 'Tema Kewirausahaan & Pengelolaan Berkelanjutan' },
    }
  },
  {
    id: 'slot-6',
    rowNum: 6,
    period: 'Istirahat II',
    time: '12:45 - 13:15',
    startTime: '12:45',
    endTime: '13:15',
    isBreak: true,
    breakLabel: 'Istirahat Sesi II & Ishoma (12:45 – 13:15 WIB)',
    days: {}
  },
  {
    id: 'slot-7',
    rowNum: 7,
    period: 'Jam Ke 7 - 8',
    time: '13:15 - 14:45',
    startTime: '13:15',
    endTime: '14:45',
    isBreak: false,
    days: {
      Senin: { subject: 'Pendidikan Agama Islam', code: 'PAI-10', teacher: 'Ustadz Ahmad Fauzi, Lc', room: 'R. 204 Gedung B', category: 'Agama', topics: 'Hukum Fiqih Muamalah & Etika Sosial', status: 'Akan Datang' },
      Selasa: { subject: 'Matematika Wajib (Tutorial)', code: 'MTK-10', teacher: 'Drs. Bambang Sudiro, M.Pd', room: 'R. 204 Gedung B', category: 'MIPA', topics: 'Pembahasan Soal Pengayaan Matriks' },
      Rabu: { subject: 'Informatika & Rekayasa Web', code: 'INF-10', teacher: 'Yusuf Ramadhan, S.Kom', room: 'Lab Komputer 1', category: 'Informatika', topics: 'Desain Komponen Antarmuka Web Modern' },
      Kamis: { subject: 'Bahasa Inggris (Academic Speaking)', code: 'ENG-10', teacher: 'David Prasetyo, M.Hum', room: 'Lab Bahasa Lt. 2', category: 'Bahasa', topics: 'Structured Group Presentation & Debate' },
      Jumat: { subject: 'Ibadah Sholat Jumat / Keputrian', code: 'JUM', teacher: 'Pembina Rohis', room: 'Masjid Utama', category: 'Agama', topics: 'Khutbah Jumat & Bimbingan Keputrian' },
      Sabtu: { subject: 'Pendidikan Kepramukaan (Wajib)', code: 'PRM', teacher: 'Kak Hendra Gunawan', room: 'Lapangan Utama', category: 'Umum', topics: 'Kepemimpinan Regu & Manajemen Organisasi' },
    }
  },
  {
    id: 'slot-8',
    rowNum: 8,
    period: 'Jam Ke 9 - 10',
    time: '15:00 - 16:30',
    startTime: '15:00',
    endTime: '16:30',
    isBreak: false,
    days: {
      Senin: { subject: 'Bimbingan Olimpiade Sains (OSN)', code: 'OSN', teacher: 'Drs. Bambang Sudiro, M.Pd', room: 'R. Multimedia', category: 'MIPA', topics: 'Kombinatorika & Problem Solving Tingkat Lanjut' },
      Selasa: { subject: 'Klinik Pembelajaran Akademik', code: 'REM', teacher: 'Guru Piket Akademik', room: 'Perpustakaan Lt. 2', category: 'Umum', topics: 'Konsultasi Mandiri & Pembahasan Materi' },
      Rabu: { subject: 'Ekstrakurikuler Robotika & TIK', code: 'ROB', teacher: 'Yusuf Ramadhan, S.Kom', room: 'Lab Riset IoT', category: 'Informatika', topics: 'Pemrograman Mikrokontroler & Sensor Terapan' },
      Kamis: { subject: 'Latihan Olahraga Prestasi', code: 'EKS', teacher: 'Pelatih Olahraga', room: 'GOR Serbaguna', category: 'Olahraga', topics: 'Latihan Fisik Terpadu & Taktik Bertanding' },
      Jumat: null,
      Sabtu: { subject: 'Palang Merah Remaja (PMR)', code: 'PMR', teacher: 'Pembina UKS', room: 'Ruang UKS', category: 'Umum', topics: 'Manajemen Penanganan Darurat Medis Dasar' },
    }
  }
];

const STORAGE_KEY = 'myacademic_central_kbm_schedule';
const EVENT_NAME = 'kbm_schedule_synced';

/**
 * Retrieve current schedule slots from central store (or default).
 */
export function getCentralSchedule(): ScheduleSlot[] {
  if (typeof window === 'undefined') return DEFAULT_WEEKLY_SLOTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WEEKLY_SLOTS));
      return DEFAULT_WEEKLY_SLOTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return DEFAULT_WEEKLY_SLOTS;
  } catch (err) {
    console.error('Failed to load schedule from central storage', err);
    return DEFAULT_WEEKLY_SLOTS;
  }
}

/**
 * Save updated schedule slots and dispatch real-time sync event across all views.
 */
export function saveCentralSchedule(slots: ScheduleSlot[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    // Sort slots chronologically based on startTime
    const sorted = [...slots].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
    const renumbered = sorted.map((s, idx) => ({ ...s, rowNum: idx + 1 }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(renumbered));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: renumbered }));
    return true;
  } catch (err) {
    console.error('Failed to save central schedule', err);
    return false;
  }
}

/**
 * Reset central schedule to school standard default.
 */
export function resetCentralSchedule(): ScheduleSlot[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_WEEKLY_SLOTS));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: DEFAULT_WEEKLY_SLOTS }));
  }
  return DEFAULT_WEEKLY_SLOTS;
}

/**
 * Subscribe to real-time schedule updates from admin/guru.
 */
export function subscribeToScheduleUpdates(callback: (slots: ScheduleSlot[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<ScheduleSlot[]>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getCentralSchedule());
    }
  };

  window.addEventListener(EVENT_NAME, handler);
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getCentralSchedule());
    }
  });

  return () => {
    window.removeEventListener(EVENT_NAME, handler);
  };
}
