export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'guru' | 'murid' | string;
  username?: string | null;
  nisn?: string | null;
  birth_date?: string | null;
  mother_name?: string | null;
  google_id?: string | null;
  google_email?: string | null;
  whatsapp_number?: string | null;
  wa_status?: string | null;
  lifecycle_status?: 'active_student' | 'graduated' | 'retention_period' | 'alumni' | string;
  subscription_type?: 'school_sponsored' | 'personal_basic' | 'expired' | string;
  retention_expires_at?: string | null;
  preferred_theme?: 'formal' | 'glass' | 'midnight' | string;
  preferred_language?: 'id' | 'en' | 'zh' | 'ja' | 'ar' | string;
  school_id?: number | null;
  class_id?: number | null;
  primary_class?: AcademicClass | null;
}

export interface AcademicClass {
  id: number;
  nama_kelas: string;
  level?: string;
  jurusan?: string;
  wali_kelas?: {
    id: number;
    name: string;
  };
  nama_km?: string;
  no_telpon_km?: string;
}

export interface MemberAvatar {
  id: number;
  name: string;
  role: string;
  badge: number;
  color: string;
  avatarUrl?: string;
}

export interface WorkflowItem {
  id: number | string;
  title: string;
  subtitle?: string;
  date?: string;
  status?: 'completed' | 'active' | 'pending';
  icon?: string;
  active?: boolean;
}

export interface WorkflowStage {
  id: string;
  title: string;
  items: WorkflowItem[];
}

export interface KnowledgeItem {
  id: number;
  subject: string;
  nama_mapel: string;
  status: 'Executed' | 'Scheduled' | 'Active';
  start_date: string;
  end_date: string;
  assigned_user: string;
}

export interface DashboardStats {
  executed_count: number;
  active_count: number;
  attendance_rate: number;
  total_classes: number;
  total_subjects: number;
  total_materials: number;
  total_assignments: number;
}

export interface DashboardResponse {
  success: boolean;
  primary_class: AcademicClass | null;
  members: MemberAvatar[];
  workflow_stages: WorkflowStage[];
  knowledge_items: KnowledgeItem[];
  stats: DashboardStats;
  upcoming_assignments: any[];
  recent_materials: any[];
}
