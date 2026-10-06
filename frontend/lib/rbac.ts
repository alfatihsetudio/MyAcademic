export type RoleType =
  | 'superadmin'
  | 'murid'
  | 'guru'
  | 'walikelas'
  | 'bk'
  | 'tu'
  | 'kepsek'
  | 'admin'
  | 'parent';

export interface RoleConfig {
  id: RoleType;
  label: string;
  description: string;
  defaultTab: string;
  allowedTabs: string[];
}

export const ROLE_CONFIGS: Record<RoleType, RoleConfig> = {
  superadmin: {
    id: 'superadmin',
    label: 'Super Admin (Platform Owner)',
    description: 'Control Tower SaaS Multi-School (82 Fitur Platform): Tenant Management, Billing & MRR, Security Center, Feature Flags, System Health, Impersonation & Global Control',
    defaultTab: 'super-admin-hub',
    allowedTabs: [
      'super-admin-hub',
      'catalog',
    ],
  },
  admin: {
    id: 'admin',
    label: 'Admin Sekolah',
    description: 'Pengelola seluruh data dan operasional sistem sekolah (49 Fitur Master Suite: Master Data, Pengguna, Akademik, Jadwal, Presensi, Monitoring KBM, Rapor & Data Quality)',
    defaultTab: 'school-admin',
    allowedTabs: [
      'school-admin',
    ],
  },
  kepsek: {
    id: 'kepsek',
    label: 'Kepala Sekolah',
    description: 'Portal Eksekutif Kepala Sekolah (33 Fitur Lengkap): Monitoring Holistik, Evaluasi KBM & Akademik, Approval Center, Early Warning System & Analitik Pimpinan',
    defaultTab: 'principal-hub',
    allowedTabs: [
      'principal-hub',
    ],
  },
  tu: {
    id: 'tu',
    label: 'Tata Usaha (TU)',
    description: 'Portal Administrasi Terpadu TU (34 Fitur): Surat-Menyurat, Siswa, Guru & Tendik, Disposisi, Arsip, Layanan Tiket, Mutasi, Kelulusan, Presensi, Inventaris & Data Quality',
    defaultTab: 'tu-hub',
    allowedTabs: [
      'tu-hub',
      'goal',
      'learn',
      'boost',
    ],
  },
  walikelas: {
    id: 'walikelas',
    label: 'Wali Kelas',
    description: 'Portal Lengkap Wali Kelas (42 Fitur Asuhan): Monitoring Holistik, Profil Kelas, Data Siswa 360°, Presensi & Koreksi, Akademik, Disiplin, BK, Komunikasi Ortu, Rapor, Kenaikan Kelas, dan Class Analytics',
    defaultTab: 'walikelas-hub',
    allowedTabs: [
      'walikelas-hub',
      'teacher-hub',
      'schedule',
      'attendance',
      'gradebook',
      'classes',
      'subjects',
      'assignments',
      'catalog',
    ],
  },
  bk: {
    id: 'bk',
    label: 'Konselor BK',
    description: 'Portal Terpadu Konselor BK (46 Fitur Master Suite): Case Management, Konseling Individu & Kelompok, Asesmen & Library, EWS & Risk Monitoring, Privacy Model & Need-to-Know Access, Career & Studi Lanjut, Bullying Cases & Laporan Eksekutif',
    defaultTab: 'bk-hub',
    allowedTabs: [
      'bk-hub',
      'catalog',
    ],
  },
  guru: {
    id: 'guru',
    label: 'Guru Pengampu',
    description: 'Portal Khusus Guru Pengajar (38 Fitur): KBM Murni, Sesi Mengajar, Jurnal, Presensi Siswa, Tugas, CBT, Bank Soal, Gradebook & Analisis Nilai (Dapat beralih ke peran Wali Kelas)',
    defaultTab: 'teacher-hub',
    allowedTabs: [
      'teacher-hub',
      'walikelas-hub',
    ],
  },
  murid: {
    id: 'murid',
    label: 'Siswa / Murid',
    description: 'Portal Lengkap Siswa: 36 Fitur Akademik, KBM, Ujian CBT, Materi, Tugas, Presensi & Asisten AI',
    defaultTab: 'student-hub',
    allowedTabs: [
      'student-hub',
      'cbt',
      'assignments',
      'grades',
      'schedule',
      'space-belajar',
      'attendance',
      'classes',
      'subjects',
    ],
  },
  parent: {
    id: 'parent',
    label: 'Orang Tua / Wali Murid',
    description: 'Portal Lengkap Pemantauan Orang Tua (36 Fitur): Multi-Anak Switcher, Presensi RFID Gerbang, Akademik, Jadwal, Tugas, Nilai, Rapor Digital, Komunikasi Wali Kelas/BK, Pengajuan Izin, Parent Meeting & AI Assistant',
    defaultTab: 'parent',
    allowedTabs: [
      'parent',
      'catalog',
      'journey',
    ],
  },
};

/**
 * Check if a given role is allowed to access a specific tab
 */
export function isTabAllowed(role: string, tabId: string): boolean {
  const normRole = (role || 'murid').toLowerCase() as RoleType;
  const config = ROLE_CONFIGS[normRole];
  if (!config) return false;
  return config.allowedTabs.includes(tabId);
}

/**
 * Get human-readable allowed roles for a tab
 */
export function getAllowedRolesForTab(tabId: string): string[] {
  const allowed: string[] = [];
  (Object.keys(ROLE_CONFIGS) as RoleType[]).forEach((roleKey) => {
    if (ROLE_CONFIGS[roleKey].allowedTabs.includes(tabId)) {
      allowed.push(ROLE_CONFIGS[roleKey].label);
    }
  });
  return allowed;
}
