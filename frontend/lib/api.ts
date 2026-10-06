import { DashboardResponse, User } from './types';
import axiosInstance from './axios';

export const DEFAULT_USER: User = {
  id: 1,
  name: 'Ahmad Siswa',
  email: 'ahmad@myacademic.test',
  role: 'murid',
  school_id: 1,
  class_id: 1,
};

export const DEFAULT_DASHBOARD: DashboardResponse = {
  success: true,
  primary_class: {
    id: 1,
    nama_kelas: 'X-IPA 1',
    level: '10',
    jurusan: 'IPA',
    wali_kelas: { id: 2, name: 'Budi Santoso, M.Pd' },
    nama_km: 'Ahmad Siswa',
    no_telpon_km: '081234567890',
  },
  members: [
    { id: 1, name: 'Budi Santoso', role: 'Wali Kelas', badge: 2, color: '#3b82f6' },
    { id: 2, name: 'Siti Aminah', role: 'Guru', badge: 3, color: '#ec4899' },
    { id: 3, name: 'Ahmad Siswa', role: 'KM', badge: 2, color: '#10b981' },
    { id: 4, name: 'Nadia Az-Zahra', role: 'Siswa', badge: 1, color: '#f59e0b' },
    { id: 5, name: 'Farhan Maulana', role: 'Siswa', badge: 1, color: '#8b5cf6' },
    { id: 6, name: 'Aisyah Putri', role: 'Siswa', badge: 1, color: '#06b6d4' },
    { id: 7, name: 'Dewi Lestari', role: 'Guru', badge: 4, color: '#6366f1' },
  ],
  workflow_stages: [
    {
      id: 'allocation',
      title: 'Alokasi & Orientasi',
      items: [
        { id: 1, title: 'Kelas: X-IPA 1', subtitle: 'Wali: Budi Santoso, M.Pd', date: 'Semester 1', status: 'completed', icon: 'school' },
        { id: 2, title: 'KM & Struktur Kelas', subtitle: 'KM: Ahmad Siswa', date: 'Terkonfirmasi', status: 'completed', icon: 'user-check' },
      ],
    },
    {
      id: 'identification',
      title: 'Mata Pelajaran & Materi',
      items: [
        { id: 3, title: 'Distribusi Modul Belajar', subtitle: '6 Materi Terkini', date: 'Update Harian', status: 'active', icon: 'book-open' },
        { id: 4, title: 'Jadwal Tatap Muka & Presensi', subtitle: 'Kehadiran: 94%', date: 'Setiap Hari', status: 'active', icon: 'calendar' },
      ],
    },
    {
      id: 'resolution',
      title: 'Evaluasi & Penilaian',
      items: [
        { id: 5, title: 'Pemeriksaan Tugas Siswa', subtitle: '8 Tugas Diserahkan', date: 'Mingguan', status: 'pending', icon: 'check-circle' },
        { id: 6, title: 'Rekap Nilai Online & Offline', subtitle: 'Standar KKM 75.0', date: 'Tengah Semester', status: 'pending', icon: 'award' },
      ],
    },
    {
      id: 'tasks',
      title: 'Aksi & Modul Cepat',
      items: [
        { id: 't1', title: 'Pengumpulan Tugas', active: true },
        { id: 't2', title: 'Presensi Harian', active: false },
        { id: 't3', title: 'Space Belajar', active: false },
        { id: 't4', title: 'Rekap Nilai', active: false },
        { id: 't5', title: 'Dokumen Nilai', active: false },
        { id: 't6', title: 'Pengaturan Akun', active: false },
      ],
    },
  ],
  knowledge_items: [
    { id: 1, subject: 'Fisika Dasar: Termodinamika', nama_mapel: 'Fisika', status: 'Executed', start_date: '2026-10-01 08:00', end_date: '2026-10-07 15:00', assigned_user: 'Budi Santoso' },
    { id: 2, subject: 'Matematika: Aljabar Linier & Matriks', nama_mapel: 'Matematika', status: 'Scheduled', start_date: '2026-10-02 09:30', end_date: '2026-10-09 12:00', assigned_user: 'Siti Aminah' },
    { id: 3, subject: 'Kimia: Reaksi Redoks & Larutan', nama_mapel: 'Kimia', status: 'Executed', start_date: '2026-10-03 10:00', end_date: '2026-10-10 14:00', assigned_user: 'Dewi Lestari' },
    { id: 4, subject: 'Biologi: Genetika Molekuler', nama_mapel: 'Biologi', status: 'Scheduled', start_date: '2026-10-04 11:00', end_date: '2026-10-11 16:00', assigned_user: 'Dr. Hendra' },
  ],
  stats: {
    executed_count: 8,
    active_count: 5,
    attendance_rate: 94,
    total_classes: 12,
    total_subjects: 18,
    total_materials: 24,
    total_assignments: 14,
  },
  upcoming_assignments: [],
  recent_materials: [],
};

// Helper to get stored auth token
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ma_auth_token');
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ma_auth_token', token);
  }
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ma_auth_token');
    localStorage.removeItem('ma_user');
  }
}

export function getStoredUser(): User {
  if (typeof window === 'undefined') return DEFAULT_USER;
  const data = localStorage.getItem('ma_user');
  if (data) {
    try {
      return JSON.parse(data);
    } catch (error) { throw error; }
  }
  return DEFAULT_USER;
}

export function setStoredUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ma_user', JSON.stringify(user));
  }
}

export async function fetchDashboard(): Promise<DashboardResponse> {
  try {
    const response = await axiosInstance.get('/dashboard');
    if (response.data && response.data.success) {
      return response.data;
    }
    return DEFAULT_DASHBOARD;
  } catch {
    return DEFAULT_DASHBOARD;
  }
}

export async function fetchStudentDashboard(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/dashboard');
    if (response.data && response.data.success) {
      return response.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchStudentProfile(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/profile');
    if (response.data && response.data.success) {
      return response.data;
    }
    return null;
  } catch {
    return null;
  }
}

export async function updateStudentProfile(payload: { phone?: string; nickname?: string; address?: string }): Promise<any> {
  try {
    const response = await axiosInstance.post('/student/profile', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchStudentSubjects(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/subjects');
    return response.data;
  } catch {
    return null;
  }
}

export async function fetchStudentSchedule(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/schedule');
    return response.data;
  } catch {
    return null;
  }
}

export async function fetchStudentMaterials(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/materials');
    return response.data;
  } catch {
    return null;
  }
}

export async function fetchStudentAssignments(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/assignments');
    return response.data;
  } catch {
    return null;
  }
}

export async function fetchStudentGrades(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/grades');
    return response.data;
  } catch {
    return null;
  }
}

export async function fetchStudentAttendance(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/attendance');
    return response.data;
  } catch {
    return null;
  }
}

export async function fetchStudentReportCards(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/report-cards');
    return response.data;
  } catch {
    return null;
  }
}

export async function fetchStudentAnnouncements(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/announcements');
    return response.data;
  } catch {
    return null;
  }
}

export async function fetchStudentCalendar(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/calendar');
    return response.data;
  } catch {
    return null;
  }
}

export async function submitStudentLeave(payload: any): Promise<any> {
  try {
    const response = await axiosInstance.post('/student/leave', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function submitStudentCounseling(payload: any): Promise<any> {
  try {
    const response = await axiosInstance.post('/student/counseling', payload);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchStudentClassMembers(): Promise<any> {
  try {
    const response = await axiosInstance.get('/student/class-members');
    return response.data;
  } catch {
    return null;
  }
}

export async function submitStudentAssignment(assignmentId: number, konten: string): Promise<any> {
  try {
    const response = await axiosInstance.post(`/student/assignments/${assignmentId}/submit`, { konten });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; token?: string; user?: User; message?: string }> {
  try {
    const response = await axiosInstance.post('/login', { email, password });
    if (response.data.success) {
      setToken(response.data.token);
      setStoredUser(response.data.user);
    }
    return response.data;
  } catch (error) { throw error; }
}

export async function submitTask(assignmentId: number, linkDrive: string, catatan: string): Promise<boolean> {
  try {
    const response = await axiosInstance.post(`/assignments/${assignmentId}/submit`, { link_drive: linkDrive, catatan });
    return response.data.success;
  } catch (error) { throw error; }
}

export async function updateAccount(payload: { name: string; email: string; current_password?: string; new_password?: string; new_password_confirmation?: string }): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axiosInstance.post('/profile', payload);
    return { success: response.data.success, message: response.data.message || 'Berhasil diperbarui' };
  } catch (error) { throw error; }
}

// Space Belajar: File Explorer
export async function fetchExplorer(parentId?: number | null): Promise<{ folders: any[]; files: any[]; current_folder?: any }> {
  try {
    const query = parentId ? `?parent_id=${parentId}` : '';
    const response = await axiosInstance.get(`/space-belajar/explorer${query}`);
    return response.data && response.data.success ? response.data : { folders: [], files: [] };
  } catch (error) { throw error; }
}

export async function createFolderApi(name: string, parentId?: number | null): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axiosInstance.post('/space-belajar/folder', { name, parent_id: parentId });
    return { success: true, message: response.data?.message || 'Folder dibuat' };
  } catch (error) { throw error; }
}

export async function createNoteApi(title: string, description: string, folderId?: number | null): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axiosInstance.post('/space-belajar/note', { title, description, folder_id: folderId });
    return { success: true, message: response.data?.message || 'Catatan dibuat' };
  } catch (error) { throw error; }
}

export async function deleteExplorerItemApi(type: 'folder' | 'file', id: number): Promise<{ success: boolean }> {
  try {
    const response = await axiosInstance.delete('/space-belajar/item', { data: { type, id } });
    return { success: response.data?.success || true };
  } catch (error) { throw error; }
}

// Space Belajar: Calendar
export async function fetchCalendarApi(year: number = 2026): Promise<{ year: number; events: any[] }> {
  try {
    const response = await axiosInstance.get(`/space-belajar/calendar?year=${year}`);
    return response.data && response.data.success ? response.data : { year, events: [] };
  } catch (error) { throw error; }
}

export async function addCalendarEventApi(event: { title: string; event_date: string; type: string; note?: string }): Promise<{ success: boolean; message: string }> {
  try {
    const response = await axiosInstance.post('/space-belajar/calendar/event', event);
    return { success: true, message: response.data?.message || 'Jadwal ditambahkan' };
  } catch (error) { throw error; }
}

// ==========================================
// TEACHER MASTER SUITE API HELPERS
// ==========================================

export async function fetchTeacherDashboard(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/dashboard');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherProfile(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/profile');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function updateTeacherProfileApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/profile', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function startTeacherSessionApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/sessions/start', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function finishTeacherSessionApi(sessionId: number): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post(`/teacher/sessions/${sessionId}/finish`);
    return response.data;
  } catch (error) { throw error; }
}

export async function saveTeacherAttendanceApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/attendance', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function createTeacherMaterialApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/materials', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function createTeacherAssignmentApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/assignments', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function gradeSubmissionApi(submissionId: number, score: number, feedback: string): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post(`/teacher/submissions/${submissionId}/grade`, { score, feedback });
    return response.data;
  } catch (error) { throw error; }
}

export async function chatTeacherAiAssistantApi(prompt: string): Promise<{ success: boolean; reply: string }> {
  try {
    const response = await axiosInstance.post('/teacher/ai-chat', { prompt });
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherSubjects(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/subjects');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherClasses(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/classes');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherSchedule(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/schedule');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherJournals(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/journals');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function storeTeacherJournalApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/journals', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherAttendance(params?: { class?: string; date?: string }): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/attendance', { params });
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherAttendanceRecap(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/attendance/recap');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherMaterials(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/materials');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function deleteTeacherMaterialApi(id: number): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.delete(`/teacher/materials/${id}`);
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherAssignments(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/assignments');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function deleteTeacherAssignmentApi(id: number): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.delete(`/teacher/assignments/${id}`);
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherQuizzes(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/quizzes');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function createTeacherQuizApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/quizzes', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherExams(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/exams');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherQuestionBank(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/question-bank');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function createTeacherQuestionApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/question-bank', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherAssessments(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/assessments');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function saveTeacherAssessmentsApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/assessments', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherGradebook(params?: { class?: string }): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/gradebook', { params });
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function saveTeacherGradebookApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/gradebook', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherGradeAnalysis(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/grade-analysis');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherRemedial(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/remedial');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherAnnouncements(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/announcements');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function createTeacherAnnouncementApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/announcements', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherMessages(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/messages');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function sendTeacherMessageApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/messages', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherCalendar(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/calendar');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherNotifications(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/notifications');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherProgress(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/progress');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherCurriculum(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/curriculum');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherTeachingNotes(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/teaching-notes');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function createTeacherTeachingNoteApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/teaching-notes', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherClassPerformance(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/class-performance');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function importTeacherGradesApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/import-grades', payload);
    return response.data;
  } catch (error) { throw error; }
}

export async function exportTeacherDataApi(type: string): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.get(`/teacher/export?type=${type}`);
    return response.data;
  } catch (error) { throw error; }
}

export async function fetchTeacherReports(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/reports');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherFiles(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/files');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function fetchTeacherArchives(): Promise<Record<string, unknown> | null> {
  try {
    const response = await axiosInstance.get('/teacher/archives');
    return response.data?.success ? response.data : null;
  } catch (error) { throw error; }
}

export async function updateTeacherSecurityPasswordApi(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
  try {
    const response = await axiosInstance.post('/teacher/security/password', payload);
    return response.data;
  } catch (error) { throw error; }
}

// ==========================================
// 🏫 SCHOOL ADMIN MASTER SUITE API (49 FITUR)
// ==========================================

export async function fetchSchoolAdminDashboard(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/dashboard');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminProfile(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/profile');
    return res.data;
  } catch (error) { throw error; }
}

export async function updateSchoolAdminProfile(payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.post('/school-admin/profile', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminSettings(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/settings');
    return res.data;
  } catch (error) { throw error; }
}

export async function updateSchoolAdminSettings(payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.post('/school-admin/settings', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminUsers(params?: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/users', { params });
    return res.data;
  } catch (error) { throw error; }
}

export async function createSchoolAdminUser(payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.post('/school-admin/users', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function resetSchoolAdminPassword(id: number, password?: string): Promise<any> {
  try {
    const res = await axiosInstance.post(`/school-admin/users/${id}/reset-password`, { password });
    return res.data;
  } catch (error) { throw error; }
}

export async function updateSchoolAdminUser(id: number, payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.put(`/school-admin/users/${id}`, payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function deleteSchoolAdminUser(id: number): Promise<any> {
  try {
    const res = await axiosInstance.delete(`/school-admin/users/${id}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function assignSchoolAdminRole(id: number, role: string): Promise<any> {
  try {
    const res = await axiosInstance.post(`/school-admin/users/${id}/assign-role`, { role });
    return res.data;
  } catch (error) { throw error; }
}

export async function toggleSchoolAdminUserStatus(id: number): Promise<any> {
  try {
    const res = await axiosInstance.post(`/school-admin/users/${id}/toggle-status`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminStudents(params?: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/students', { params });
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminTeachers(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/teachers');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminParents(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/parents');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminClasses(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/classes');
    return res.data;
  } catch (error) { throw error; }
}

export async function createSchoolAdminClass(payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.post('/school-admin/classes', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function updateSchoolAdminClass(id: number, payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.put(`/school-admin/classes/${id}`, payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function deleteSchoolAdminClass(id: number): Promise<any> {
  try {
    const res = await axiosInstance.delete(`/school-admin/classes/${id}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminAcademicYears(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/academic-years');
    return res.data;
  } catch (error) { throw error; }
}

export async function createSchoolAdminAcademicYear(payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.post('/school-admin/academic-years', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function updateSchoolAdminAcademicYear(id: number, payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.put(`/school-admin/academic-years/${id}`, payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function deleteSchoolAdminAcademicYear(id: number): Promise<any> {
  try {
    const res = await axiosInstance.delete(`/school-admin/academic-years/${id}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function setActiveSchoolAdminAcademicYear(id: number): Promise<any> {
  try {
    const res = await axiosInstance.post(`/school-admin/academic-years/${id}/set-active`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminCalendar(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/calendar');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminSubjects(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/subjects');
    return res.data;
  } catch (error) { throw error; }
}

export async function createSchoolAdminSubject(payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.post('/school-admin/subjects', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function updateSchoolAdminSubject(id: number, payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.put(`/school-admin/subjects/${id}`, payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function deleteSchoolAdminSubject(id: number): Promise<any> {
  try {
    const res = await axiosInstance.delete(`/school-admin/subjects/${id}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminSchedules(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/schedules');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminEnrollment(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/enrollment');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminAttendance(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/attendance');
    return res.data;
  } catch (error) { throw error; }
}

export async function correctSchoolAdminAttendance(payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.post('/school-admin/attendance/correct', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminLearningMonitoring(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/learning-monitoring');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminAcademicMonitoring(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/academic-monitoring');
    return res.data;
  } catch (error) { throw error; }
}

export async function toggleSchoolAdminGradeLock(id: number): Promise<any> {
  try {
    const res = await axiosInstance.post(`/school-admin/grades/${id}/toggle-lock`);
    return res.data;
  } catch (error) { throw error; }
}

export async function generateSchoolAdminReportCards(): Promise<any> {
  try {
    const res = await axiosInstance.post('/school-admin/report-cards/generate');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminStudentAffairs(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/student-affairs');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminCommunication(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/communication');
    return res.data;
  } catch (error) { throw error; }
}

export async function createSchoolAdminAnnouncement(payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.post('/school-admin/announcements', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminDocuments(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/documents');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminImportExport(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/import-export');
    return res.data;
  } catch (error) { throw error; }
}

export async function executeSchoolAdminSimulatedImport(category: string): Promise<any> {
  try {
    const res = await axiosInstance.post('/school-admin/import/execute', { category });
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminReports(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/reports');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminDataQuality(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/data-quality');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminRoleAndAudit(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/roles-and-audit');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminArchives(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/archives');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminSetupWizard(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/setup-wizard');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSchoolAdminHealthSubscription(): Promise<any> {
  try {
    const res = await axiosInstance.get('/school-admin/health-subscription');
    return res.data;
  } catch (error) { throw error; }
}

// ==========================================
// PRINCIPAL / KEPALA SEKOLAH SUITE (33 FITUR)
// ==========================================
export async function fetchPrincipalDashboard(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/dashboard');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalProfile(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/profile');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalStudents(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/students');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalTeachers(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/teachers');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalClasses(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/classes');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalAcademic(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/academic');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalSubjects(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/subjects');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalAttendance(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/attendance');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalLearning(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/learning-monitoring');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalAssessments(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/assessments');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalGrades(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/grades');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalReportCards(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/report-cards');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalApprovalCenter(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/approval-center');
    return res.data;
  } catch (error) { throw error; }
}

export async function processPrincipalApproval(id: string, action: string, notes: string): Promise<any> {
  try {
    const res = await axiosInstance.post('/principal/approvals/process', { id, action, notes });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchPrincipalClassPromotion(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/class-promotion');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalGraduation(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/graduation');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalCounseling(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/counseling');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalDiscipline(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/discipline');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalAchievements(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/achievements');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalExtracurriculars(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/extracurriculars');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalCalendar(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/calendar');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalAnnouncements(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/announcements');
    return res.data;
  } catch (error) { throw error; }
}

export async function storePrincipalAnnouncement(payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.post('/principal/announcements', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalCommunication(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/communication');
    return res.data;
  } catch (error) { throw error; }
}

export async function sendPrincipalBroadcast(payload: Record<string, any>): Promise<any> {
  try {
    const res = await axiosInstance.post('/principal/broadcast', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalReports(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/reports');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalAnalytics(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/analytics');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalEarlyWarning(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/early-warning');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalPeriodComparison(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/period-comparison');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalPerformanceProfile(timeframe = 'today'): Promise<any> {
  try {
    const res = await axiosInstance.get(`/principal/performance-profile?timeframe=${timeframe}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalDocuments(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/documents');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalAuditTrail(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/audit-trail');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalSearch(q: string): Promise<any> {
  try {
    const res = await axiosInstance.get(`/principal/search?q=${encodeURIComponent(q)}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchPrincipalNotifications(): Promise<any> {
  try {
    const res = await axiosInstance.get('/principal/notifications');
    return res.data;
  } catch (error) { throw error; }
}

// ==========================================
// TATA USAHA (TU) ADMINISTRATIVE MASTER SUITE
// ==========================================

export async function fetchTuDashboard(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/dashboard');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchTuStudents(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/students');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchTuStaff(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/staff');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchTuLetters(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/letters');
    return res.data;
  } catch (error) { throw error; }
}

let lastLetterSequence = 86;

export async function generateTuLetterNumber(kategori: string = 'keterangan', tanggalSurat?: string): Promise<any> {
  try {
    const res = await axiosInstance.post('/tu/letters/generate-number', { kategori, tanggal_surat: tanggalSurat });
    if (res.data?.next_sequence) {
      lastLetterSequence = Math.max(lastLetterSequence, res.data.next_sequence);
    }
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchTuServiceRequests(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/service-requests');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchTuMutations(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/mutations');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchTuGraduationAlumni(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/graduation-alumni');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchTuAttendance(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/attendance');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchTuLeaves(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/leaves');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchTuInventory(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/inventory');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchTuMeetings(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/meetings');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchTuDataQuality(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/data-quality');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchTuAuditLog(): Promise<any> {
  try {
    const res = await axiosInstance.get('/tu/audit-log');
    return res.data;
  } catch (error) { throw error; }
}

// -------------------------------------------------------------
// Homeroom (Wali Kelas) Master Suite API Client (42 Features)
// -------------------------------------------------------------
export async function fetchHomeroomDashboard(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/dashboard');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomClassProfile(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/class-profile');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomStudents(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/students');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomStudent360(id: number | string): Promise<any> {
  try {
    const res = await axiosInstance.get(`/homeroom/students/${id}/360`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomAttendance(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/attendance');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomAttendanceCorrection(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/attendance/correct', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomAcademic(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/academic');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomGrades(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/grades');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomMastery(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/mastery');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomAssignments(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/assignments');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomLearningMonitoring(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/learning-monitoring');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomSubjectTeachers(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/subject-teachers');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomNotes(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/notes');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomNote(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/notes', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomDiscipline(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/discipline');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomCoaching(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/coaching');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomCoaching(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/coaching', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomBkReferrals(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/bk-referrals');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomBkReferral(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/bk-referrals', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomParentCommunication(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/parent-communication');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomParentHistory(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/parent-communication/history');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomParentHistory(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/parent-communication', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomAnnouncements(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/announcements');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomAnnouncement(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/announcements', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomCalendar(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/calendar');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomSchedule(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/schedule');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomOrganization(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/organization');
    return res.data;
  } catch (error) { throw error; }
}

export async function updateHomeroomOrganization(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/organization', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomActivities(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/activities');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomActivity(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/activities', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomAchievements(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/achievements');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomAchievement(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/achievements', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomExtracurriculars(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/extracurriculars');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomReportCards(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/report-cards');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomReportCardNotes(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/report-cards/notes', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function finalizeHomeroomReportCard(): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/report-cards/finalize');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomClassPromotion(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/class-promotion');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomPromotionRecommendation(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/class-promotion/recommend', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomGraduation(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/graduation');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomDocuments(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/documents');
    return res.data;
  } catch (error) { throw error; }
}

export async function requestTuDocument(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/documents/request-tu', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomAnalytics(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/analytics');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomEarlyWarning(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/early-warning');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomComparison(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/comparison');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomParentMeetings(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/parent-meetings');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomParentMeeting(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/parent-meetings', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomPrivateNotes(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/homeroom-notes-private');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveHomeroomPrivateNote(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/homeroom/homeroom-notes-private', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomNotifications(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/notifications');
    return res.data;
  } catch (error) { throw error; }
}

export async function searchHomeroomClass(q: string): Promise<any> {
  try {
    const res = await axiosInstance.get(`/homeroom/search?q=${encodeURIComponent(q)}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomProfile(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/profile');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchHomeroomHelp(): Promise<any> {
  try {
    const res = await axiosInstance.get('/homeroom/help');
    return res.data;
  } catch (error) { throw error; }
}

// ==========================================
// PORTAL KONSELOR BK (46 FITUR MASTER SUITE)
// ==========================================

export async function fetchBkDashboard(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/dashboard');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkStudents(search = '', classFilter = 'all'): Promise<any> {
  try {
    const res = await axiosInstance.get(`/bk/students?search=${encodeURIComponent(search)}&class=${encodeURIComponent(classFilter)}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkStudentProfile(id: number | string): Promise<any> {
  try {
    const res = await axiosInstance.get(`/bk/students/${id}/profile`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkCases(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/cases');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveBkCase(data: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/bk/cases', data);
    return res.data;
  } catch (error) { throw error; }
}

export async function updateBkCase(id: number | string, data: any): Promise<any> {
  try {
    const res = await axiosInstance.put(`/bk/cases/${id}`, data);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkReferrals(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/referrals');
    return res.data;
  } catch (error) { throw error; }
}

export async function actionBkReferral(id: string, action: string, reason = ''): Promise<any> {
  try {
    const res = await axiosInstance.post(`/bk/referrals/${id}/action`, { action, reason });
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkIndividualSessions(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/sessions/individual');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveBkIndividualSession(data: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/bk/sessions/individual', data);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkGroupSessions(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/sessions/group');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveBkGroupSession(data: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/bk/sessions/group', data);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkSchedule(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/schedule');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkBookings(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/bookings');
    return res.data;
  } catch (error) { throw error; }
}

export async function actionBkBooking(id: string, action: string): Promise<any> {
  try {
    const res = await axiosInstance.post(`/bk/bookings/${id}/action`, { action });
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkAssessments(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/assessments');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkSelfAssessments(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/self-assessments');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkInterventions(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/interventions');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveBkIntervention(data: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/bk/interventions', data);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkFollowUps(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/follow-ups');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveBkFollowUp(data: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/bk/follow-ups', data);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkStudentProgress(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/student-progress');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkObservations(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/observations');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveBkObservation(data: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/bk/observations', data);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkStudentCommunications(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/communications/students');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkParentCommunications(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/communications/parents');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkHomeroomCoordination(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/homeroom-coordination');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkTeacherCoordination(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/teacher-coordination');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkStudentSupportPlans(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/student-support-plans');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkEarlyWarning(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/early-warning');
    return res.data;
  } catch (error) { throw error; }
}

export async function verifyBkEarlyWarning(id: string, data: any): Promise<any> {
  try {
    const res = await axiosInstance.post(`/bk/early-warning/${id}/verify`, data);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkCareerAndTalents(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/career-and-talents');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkPrograms(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/programs');
    return res.data;
  } catch (error) { throw error; }
}

export async function saveBkProgram(data: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/bk/programs', data);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkBullyingCases(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/bullying-cases');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkDisciplineReferrals(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/discipline-referrals');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkDocumentsAndConsents(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/documents-and-consents');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkPrivacyAndAudit(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/privacy-and-audit');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkReportsAndAnalytics(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/reports-and-analytics');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkExternalReferrals(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/external-referrals');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkEmergencyCases(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/emergency-cases');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkNotifications(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/notifications');
    return res.data;
  } catch (error) { throw error; }
}

export async function searchBk(q: string): Promise<any> {
  try {
    const res = await axiosInstance.get(`/bk/search?q=${encodeURIComponent(q)}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkProfile(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/profile');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchBkHelp(): Promise<any> {
  try {
    const res = await axiosInstance.get('/bk/help');
    return res.data;
  } catch (error) { throw error; }
}

// ==========================================
// PARENT / ORANG TUA MASTER SUITE API (36 FITUR)
// ==========================================

export async function fetchParentDashboard(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/dashboard${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentProfile(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/profile${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentChildren(): Promise<any> {
  try {
    const res = await axiosInstance.get('/parent/children');
    return res.data;
  } catch (error) { throw error; }
}

export async function switchParentChild(childId: number): Promise<any> {
  try {
    const res = await axiosInstance.post('/parent/switch-child', { child_id: childId });
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentSchedule(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/schedule${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentAttendance(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/attendance${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentLeaveRequests(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/leave-requests${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function submitParentLeave(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/parent/submit-leave', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentAcademic(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/academic${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentGrades(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/grades${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentProgress(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/progress${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentAssignments(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/assignments${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentExams(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/exams${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentMaterials(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/materials${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentReportCards(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/report-cards${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentHomeroom(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/homeroom${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentCommunication(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/communication${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function sendParentMessage(channelId: string, message: string): Promise<any> {
  try {
    const res = await axiosInstance.post('/parent/send-message', { channel_id: channelId, message });
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentCounseling(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/counseling${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentDevelopment(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/development${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentAchievements(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/achievements${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentExtracurriculars(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/extracurriculars${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function registerParentExtracurricular(childId: number, clubId: number): Promise<any> {
  try {
    const res = await axiosInstance.post('/parent/extracurriculars/register', { child_id: childId, club_id: clubId });
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentCalendar(): Promise<any> {
  try {
    const res = await axiosInstance.get('/parent/calendar');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentAnnouncements(): Promise<any> {
  try {
    const res = await axiosInstance.get('/parent/announcements');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentNotifications(): Promise<any> {
  try {
    const res = await axiosInstance.get('/parent/notifications');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentAdministration(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/administration${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentDocuments(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/documents${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentServices(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/services${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function submitParentServiceRequest(payload: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/parent/services/request', payload);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentMeetings(): Promise<any> {
  try {
    const res = await axiosInstance.get('/parent/parent-meetings');
    return res.data;
  } catch (error) { throw error; }
}

export async function confirmParentMeeting(meetingId: number, rsvpStatus: string): Promise<any> {
  try {
    const res = await axiosInstance.post('/parent/parent-meetings/confirm', { meeting_id: meetingId, rsvp_status: rsvpStatus });
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentSchoolEvents(): Promise<any> {
  try {
    const res = await axiosInstance.get('/parent/school-events');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentLearningMonitoring(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/learning-monitoring${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentProgressOverview(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/progress-overview${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentEarlyWarning(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/early-warning${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentReports(childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/reports${childId ? `?child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function searchParent(q: string, childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/parent/search?q=${encodeURIComponent(q)}${childId ? `&child_id=${childId}` : ''}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentNotificationPreferences(): Promise<any> {
  try {
    const res = await axiosInstance.get('/parent/notification-preferences');
    return res.data;
  } catch (error) { throw error; }
}

export async function updateParentNotificationPreferences(preferences: any): Promise<any> {
  try {
    const res = await axiosInstance.post('/parent/notification-preferences', preferences);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentAccountSecurity(): Promise<any> {
  try {
    const res = await axiosInstance.get('/parent/account-security');
    return res.data;
  } catch (error) { throw error; }
}

export async function reportParentRelationIssue(childId: number, issueDescription: string): Promise<any> {
  try {
    const res = await axiosInstance.post('/parent/account/report-relation', { child_id: childId, issue_description: issueDescription });
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchParentHelp(): Promise<any> {
  try {
    const res = await axiosInstance.get('/parent/help');
    return res.data;
  } catch (error) { throw error; }
}

export async function chatParentAi(prompt: string, childId?: number): Promise<any> {
  try {
    const res = await axiosInstance.post('/parent/ai-chat', { prompt, child_id: childId });
    return res.data;
  } catch (error) { throw error; }
}

// ==========================================
// 👑 SUPER ADMIN (PLATFORM OWNER) API SUITE
// ==========================================

export async function fetchSuperAdminDashboard(): Promise<any> {
  try {
    const res = await axiosInstance.get('/super-admin/dashboard');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSuperAdminSchools(status?: string, search?: string): Promise<any> {
  try {
    const res = await axiosInstance.get('/super-admin/schools', { params: { status, search } });
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSuperAdminSchool360(id: number): Promise<any> {
  try {
    const res = await axiosInstance.get(`/super-admin/schools/${id}`);
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSuperAdminRegistrations(): Promise<any> {
  try {
    const res = await axiosInstance.get('/super-admin/registrations');
    return res.data;
  } catch (error) { throw error; }
}

export async function impersonateSuperAdminUser(targetUserId: number, reason: string): Promise<any> {
  try {
    const res = await axiosInstance.post('/super-admin/impersonate', { target_user_id: targetUserId, reason });
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSuperAdminSubscriptions(): Promise<any> {
  try {
    const res = await axiosInstance.get('/super-admin/subscriptions');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSuperAdminFeatureFlags(): Promise<any> {
  try {
    const res = await axiosInstance.get('/super-admin/feature-flags');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSuperAdminSystemHealth(): Promise<any> {
  try {
    const res = await axiosInstance.get('/super-admin/system-health');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSuperAdminAuditLogs(): Promise<any> {
  try {
    const res = await axiosInstance.get('/super-admin/audit-logs');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSuperAdminAiManagement(): Promise<any> {
  try {
    const res = await axiosInstance.get('/super-admin/ai-management');
    return res.data;
  } catch (error) { throw error; }
}

export async function executeSuperAdminEmergency(actionType: string, reason: string, confirmationCode: string): Promise<any> {
  try {
    const res = await axiosInstance.post('/super-admin/emergency-action', {
      action_type: actionType,
      reason,
      confirmation_code: confirmationCode,
    });
    return res.data;
  } catch (error) { throw error; }
}

export async function triggerSuperAdminBackup(): Promise<any> {
  try {
    const res = await axiosInstance.post('/super-admin/backup-now');
    return res.data;
  } catch (error) { throw error; }
}

export async function fetchSuperAdminUsers(): Promise<any> {
  try {
    const res = await axiosInstance.get('/super-admin/users');
    return res.data;
  } catch (error) { throw error; }
}

// ==========================================
// ARSIP BELAJAR AI (SMART STUDY ARCHIVE STUDIO)
// ==========================================

export async function fetchArsipNotes(folderId?: number | null, search?: string, sortBy?: string): Promise<{ success: boolean; notes: any[]; folders: any[] }> {
  try {
    const params: any = {};
    if (folderId) params.folder_id = folderId;
    if (search) params.search = search;
    if (sortBy) params.sort_by = sortBy;
    const res = await axiosInstance.get('/arsip-belajar/notes', { params });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createArsipFolder(name: string): Promise<any> {
  try {
    const res = await axiosInstance.post('/arsip-belajar/folders', { name });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteArsipFolder(id: number): Promise<any> {
  try {
    const res = await axiosInstance.delete(`/arsip-belajar/folders/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function moveArsipNoteFolder(noteId: number, folderId: number | null): Promise<any> {
  try {
    const res = await axiosInstance.put(`/arsip-belajar/notes/${noteId}/folder`, { folder_id: folderId });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchArsipNote(id: number): Promise<{ success: boolean; note: any }> {
  try {
    const res = await axiosInstance.get(`/arsip-belajar/notes/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function createArsipNote(formData: FormData): Promise<any> {
  try {
    const res = await axiosInstance.post('/arsip-belajar/notes', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function updateArsipNote(id: number, data: any): Promise<any> {
  try {
    const res = await axiosInstance.put(`/arsip-belajar/notes/${id}`, data);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function deleteArsipNote(id: number): Promise<any> {
  try {
    const res = await axiosInstance.delete(`/arsip-belajar/notes/${id}`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function generateArsipSummary(noteId: number): Promise<{ success: boolean; summary: string; ai_warning?: string }> {
  try {
    const res = await axiosInstance.post(`/arsip-belajar/notes/${noteId}/summary`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function generateArsipFlashcards(noteId: number): Promise<{ success: boolean; flashcards: Array<{ q: string; a: string }>; ai_warning?: string }> {
  try {
    const res = await axiosInstance.post(`/arsip-belajar/notes/${noteId}/flashcards`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function generateArsipMindmap(noteId: number): Promise<{ success: boolean; mindmap: any; ai_warning?: string }> {
  try {
    const res = await axiosInstance.post(`/arsip-belajar/notes/${noteId}/mindmap`);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function sendArsipNoteChat(noteId: number, message: string, history: any[]): Promise<{ success: boolean; reply: string; ai_warning?: string }> {
  try {
    const res = await axiosInstance.post(`/arsip-belajar/notes/${noteId}/chat`, { message, history });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function generateArsipQuiz(params: {
  note_id?: number;
  note_ids?: number[];
  count?: number;
  difficulty?: 'mudah' | 'sedang' | 'sulit';
}): Promise<{ success: boolean; topicSummary: string; questions: any[]; difficulty: string; ai_warning?: string }> {
  try {
    const res = await axiosInstance.post('/arsip-belajar/quiz/generate', params);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function saveArsipQuizResult(payload: {
  note_id?: number | null;
  title?: string;
  difficulty?: string;
  questions: any[];
  user_answers: Record<number, string>;
}): Promise<any> {
  try {
    const res = await axiosInstance.post('/arsip-belajar/quiz/save', payload);
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchArsipQuizHistory(): Promise<{ success: boolean; history: any[] }> {
  try {
    const res = await axiosInstance.get('/arsip-belajar/quiz/history');
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function fetchArsipWaStatus(): Promise<{
  success: boolean;
  status: 'unlinked' | 'pending' | 'verified';
  phone?: string | null;
  verify_token?: string | null;
  bot_instructions?: any;
}> {
  try {
    const res = await axiosInstance.get('/arsip-belajar/whatsapp/status');
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function linkArsipWa(phoneNumber: string): Promise<any> {
  try {
    const res = await axiosInstance.post('/arsip-belajar/whatsapp/link', { phone_number: phoneNumber });
    return res.data;
  } catch (error) {
    throw error;
  }
}

export async function unlinkArsipWa(): Promise<any> {
  try {
    const res = await axiosInstance.delete('/arsip-belajar/whatsapp/link');
    return res.data;
  } catch (error) {
    throw error;
  }
}

// =========================================================================
// STUDENT SETTINGS & ACCOUNT SYSTEM API CLIENT
// =========================================================================

export async function fetchStudentSettingsOverview(): Promise<any> {
  try {
    const res = await axiosInstance.get('/student/settings/overview');
    return res.data;
  } catch (error) {
    console.warn('API error fetching settings overview, returning mock fallback:', error);
    return {
      success: true,
      identity: {
        myacademic_id: 'MYACAD-ID-00000008',
        nisn: '0089123456',
        birth_date: '2008-04-12',
        mother_name: 'Siti Rahmawati',
        full_name: 'Ahmad Siswa',
        identity_match_key: '0089123456|2008-04-12',
        is_verified_identity: true,
      },
      account: {
        username: 'ahmad_siswa',
        email: 'ahmad@myacademic.test',
        initial_name_login: 'Ahmad Siswa',
        has_custom_username: true,
        has_password: true,
      },
      security: {
        two_factor_enabled: false,
        last_password_change: '1 minggu yang lalu',
        can_self_recover: true,
      },
      linked_accounts: {
        google: {
          is_linked: false,
          email: null,
          linked_at: null,
        },
        whatsapp: {
          is_linked: true,
          status: 'verified',
          phone_number: '6281234567890',
          verify_token: 'MYACAD-DEMO',
        },
      },
      lifecycle: {
        status: 'active_student',
        status_label: 'Siswa Aktif',
        subscription_type: 'school_sponsored',
        sponsor_name: 'SMK Negeri 2 Digital Nusantara',
        retention_expires_at: null,
        retention_days_left: 90,
        monthly_price: '$1 / bulan',
      },
      education_journey: [
        {
          id: 1,
          school_name: 'SMP Negeri 1 Harapan Bangsa',
          stage: 'SMP',
          grade_level: 'Alumni (Lulus)',
          nis: 'SMP-2021-042',
          status: 'graduated',
          start_year: '2021',
          end_year: '2024',
          is_current: false,
          sponsorship: 'school_sponsored',
        },
        {
          id: 2,
          school_name: 'SMK Negeri 2 Digital Nusantara',
          stage: 'SMK',
          grade_level: 'Kelas 10 (Aktif)',
          nis: 'SMK-2024-108',
          status: 'active',
          start_year: '2024',
          end_year: 'Sekarang',
          is_current: true,
          sponsorship: 'school_sponsored',
        },
      ],
      active_sessions: [
        {
          id: 1,
          device_name: 'PC Desktop (Windows 11)',
          platform: 'Windows 11 Pro',
          browser: 'Google Chrome',
          ip_address: '192.168.1.15',
          approx_location: 'Bandung, Indonesia',
          is_current: true,
          last_active_human: 'Baru saja',
        },
        {
          id: 2,
          device_name: 'iPhone 15 Pro',
          platform: 'iOS 18',
          browser: 'Mobile Safari',
          ip_address: '182.253.12.98',
          approx_location: 'Jakarta Selatan, Indonesia',
          is_current: false,
          last_active_human: '3 jam yang lalu',
        },
      ],
      preferences: {
        theme: 'formal',
        language: 'id',
      },
    };
  }
}

export async function updateStudentUsername(username: string): Promise<any> {
  const res = await axiosInstance.post('/student/settings/update-username', { username });
  return res.data;
}

export async function updateStudentPassword(data: { current_password: string; new_password: string; new_password_confirmation: string }): Promise<any> {
  const res = await axiosInstance.post('/student/settings/update-password', data);
  return res.data;
}

export async function linkGoogleAccount(email: string, google_id?: string): Promise<any> {
  const res = await axiosInstance.post('/student/settings/link-google', { email, google_id });
  return res.data;
}

export async function unlinkGoogleAccount(): Promise<any> {
  const res = await axiosInstance.delete('/student/settings/unlink-google');
  return res.data;
}

export async function linkStudentWhatsapp(phoneNumber: string): Promise<any> {
  const res = await axiosInstance.post('/student/settings/link-whatsapp', { phone_number: phoneNumber });
  return res.data;
}

export async function unlinkStudentWhatsapp(): Promise<any> {
  const res = await axiosInstance.delete('/student/settings/unlink-whatsapp');
  return res.data;
}

export async function subscribePersonalBasic(): Promise<any> {
  const res = await axiosInstance.post('/student/settings/subscribe-personal');
  return res.data;
}

export async function updateStudentPreferences(data: { theme?: string; language?: string }): Promise<any> {
  const res = await axiosInstance.post('/student/settings/preferences', data);
  return res.data;
}

export async function revokeDeviceSession(sessionId?: number, revokeAllOthers: boolean = false): Promise<any> {
  const res = await axiosInstance.post('/student/settings/revoke-session', {
    session_id: sessionId,
    revoke_all_others: revokeAllOthers,
  });
  return res.data;
}

export async function requestStudentPasswordRecovery(identifier: string): Promise<any> {
  const res = await axiosInstance.post('/public/auth/recovery/request', { identifier });
  return res.data;
}

export async function resetPasswordWithToken(data: { email: string; token: string; new_password: string; new_password_confirmation: string }): Promise<any> {
  const res = await axiosInstance.post('/public/auth/recovery/reset', data);
  return res.data;
}

export async function adminVerifyAndResetPassword(studentId: number, data: { nisn: string; birth_date: string; mother_name: string; temp_password: string }): Promise<any> {
  const res = await axiosInstance.post(`/school-admin/students/${studentId}/verify-and-reset-password`, data);
  return res.data;
}




