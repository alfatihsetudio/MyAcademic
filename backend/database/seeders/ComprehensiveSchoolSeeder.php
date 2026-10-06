<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;
use App\Models\StudentIdentity;

class ComprehensiveSchoolSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();
        $schoolId = 1;

        // 1. Ensure School Info
        DB::table('schools')->updateOrInsert(['id' => $schoolId], [
            'id' => $schoolId,
            'name' => 'SMK TI myAcademic Unggulan',
            'alamat' => 'Jl. Pendidikan Karakter No. 10, Bandung',
            'telepon' => '022-7890123',
            'email' => 'info@myacademic.sch.id',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 2. Core Users & Additional Students
        $defaultPassword = Hash::make('admin123');

        $users = [
            ['id' => 1, 'school_id' => 1, 'name' => 'Super Admin Platform', 'nama' => 'Super Admin Platform', 'email' => 'superadmin@gmail.com', 'role' => 'superadmin'],
            ['id' => 2, 'school_id' => 1, 'name' => 'Administrator', 'nama' => 'Administrator', 'email' => 'admin@gmail.com', 'role' => 'admin'],
            ['id' => 3, 'school_id' => 1, 'name' => 'Dr. H. Sulaiman, M.Si', 'nama' => 'Dr. H. Sulaiman, M.Si', 'email' => 'kepsek@gmail.com', 'role' => 'kepsek'],
            ['id' => 4, 'school_id' => 1, 'name' => 'Ustadz Ahmad, S.Pd.I', 'nama' => 'Ustadz Ahmad, S.Pd.I', 'email' => 'guru@gmail.com', 'role' => 'guru'],
            ['id' => 5, 'school_id' => 1, 'name' => 'Siti Aminah, M.Pd', 'nama' => 'Siti Aminah, M.Pd', 'email' => 'walikelas@gmail.com', 'role' => 'walikelas'],
            ['id' => 6, 'school_id' => 1, 'name' => 'Nurul Hidayah, S.Psi', 'nama' => 'Nurul Hidayah, S.Psi', 'email' => 'bk@gmail.com', 'role' => 'bk'],
            ['id' => 7, 'school_id' => 1, 'name' => 'Hendra Pratama, S.AP', 'nama' => 'Hendra Pratama, S.AP', 'email' => 'tu@gmail.com', 'role' => 'tu'],
            ['id' => 8, 'school_id' => 1, 'name' => 'Fatih Muhammad', 'nama' => 'Fatih Muhammad', 'email' => 'murid@gmail.com', 'role' => 'murid', 'class_id' => 1, 'jenjang' => '12', 'jurusan' => 'RPL'],
            ['id' => 9, 'school_id' => 1, 'name' => 'Bambang Trianto', 'nama' => 'Bambang Trianto', 'email' => 'parent@gmail.com', 'role' => 'parent'],
            // Additional students in class 12 RPL
            ['id' => 10, 'school_id' => 1, 'name' => 'Ahmad Fauzi', 'nama' => 'Ahmad Fauzi', 'email' => 'fauzi@gmail.com', 'role' => 'murid', 'class_id' => 1, 'jenjang' => '12', 'jurusan' => 'RPL'],
            ['id' => 11, 'school_id' => 1, 'name' => 'Nadia Syahrini', 'nama' => 'Nadia Syahrini', 'email' => 'nadia@gmail.com', 'role' => 'murid', 'class_id' => 1, 'jenjang' => '12', 'jurusan' => 'RPL'],
            ['id' => 12, 'school_id' => 1, 'name' => 'Rian Hidayat', 'nama' => 'Rian Hidayat', 'email' => 'rian@gmail.com', 'role' => 'murid', 'class_id' => 1, 'jenjang' => '12', 'jurusan' => 'RPL'],
            ['id' => 13, 'school_id' => 1, 'name' => 'Citra Lestari', 'nama' => 'Citra Lestari', 'email' => 'citra@gmail.com', 'role' => 'murid', 'class_id' => 1, 'jenjang' => '12', 'jurusan' => 'RPL'],
            ['id' => 14, 'school_id' => 1, 'name' => 'Dimas Arya', 'nama' => 'Dimas Arya', 'email' => 'dimas@gmail.com', 'role' => 'murid', 'class_id' => 1, 'jenjang' => '12', 'jurusan' => 'RPL'],
        ];

        foreach ($users as $u) {
            $u['password'] = $defaultPassword;
            $u['created_at'] = $now;
            $u['updated_at'] = $now;
            DB::table('users')->updateOrInsert(['id' => $u['id']], $u);
        }

        // 3. Spatie Roles & Permissions (roles, permissions, model_has_roles, role_has_permissions, model_has_permissions)
        $roles = [
            ['id' => 1, 'name' => 'superadmin', 'guard_name' => 'web'],
            ['id' => 2, 'name' => 'admin', 'guard_name' => 'web'],
            ['id' => 3, 'name' => 'kepsek', 'guard_name' => 'web'],
            ['id' => 4, 'name' => 'guru', 'guard_name' => 'web'],
            ['id' => 5, 'name' => 'walikelas', 'guard_name' => 'web'],
            ['id' => 6, 'name' => 'bk', 'guard_name' => 'web'],
            ['id' => 7, 'name' => 'tu', 'guard_name' => 'web'],
            ['id' => 8, 'name' => 'murid', 'guard_name' => 'web'],
            ['id' => 9, 'name' => 'parent', 'guard_name' => 'web'],
        ];
        foreach ($roles as $r) {
            $r['created_at'] = $now;
            $r['updated_at'] = $now;
            DB::table('roles')->updateOrInsert(['id' => $r['id']], $r);
        }

        $permissions = [
            ['id' => 1, 'name' => 'view_dashboard', 'guard_name' => 'web'],
            ['id' => 2, 'name' => 'manage_students', 'guard_name' => 'web'],
            ['id' => 3, 'name' => 'manage_grades', 'guard_name' => 'web'],
            ['id' => 4, 'name' => 'manage_attendance', 'guard_name' => 'web'],
            ['id' => 5, 'name' => 'view_counseling', 'guard_name' => 'web'],
            ['id' => 6, 'name' => 'manage_counseling', 'guard_name' => 'web'],
            ['id' => 7, 'name' => 'view_reports', 'guard_name' => 'web'],
            ['id' => 8, 'name' => 'manage_school', 'guard_name' => 'web'],
        ];
        foreach ($permissions as $p) {
            $p['created_at'] = $now;
            $p['updated_at'] = $now;
            DB::table('permissions')->updateOrInsert(['id' => $p['id']], $p);
        }

        // Map roles to permissions
        DB::table('role_has_permissions')->truncate();
        for ($pId = 1; $pId <= 8; $pId++) {
            DB::table('role_has_permissions')->insert(['permission_id' => $pId, 'role_id' => 1]);
            DB::table('role_has_permissions')->insert(['permission_id' => $pId, 'role_id' => 2]);
        }
        // Teacher / Homeroom
        DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => 1, 'role_id' => 4]);
        DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => 3, 'role_id' => 4]);
        DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => 4, 'role_id' => 4]);
        DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => 1, 'role_id' => 5]);
        DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => 2, 'role_id' => 5]);
        DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => 3, 'role_id' => 5]);
        DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => 4, 'role_id' => 5]);
        DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => 7, 'role_id' => 5]);
        // BK
        DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => 1, 'role_id' => 6]);
        DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => 5, 'role_id' => 6]);
        DB::table('role_has_permissions')->insertOrIgnore(['permission_id' => 6, 'role_id' => 6]);

        // model_has_roles
        DB::table('model_has_roles')->truncate();
        $userRoleMap = [
            1 => 1, // superadmin
            2 => 2, // admin
            3 => 3, // kepsek
            4 => 4, // guru
            5 => 5, // walikelas
            6 => 6, // bk
            7 => 7, // tu
            8 => 8, // murid
            9 => 9, // parent
            10 => 8,
            11 => 8,
            12 => 8,
            13 => 8,
            14 => 8,
        ];
        foreach ($userRoleMap as $uId => $rId) {
            DB::table('model_has_roles')->insertOrIgnore([
                'role_id' => $rId,
                'model_type' => 'App\\Models\\User',
                'model_id' => $uId,
            ]);
        }

        // model_has_permissions
        DB::table('model_has_permissions')->truncate();
        DB::table('model_has_permissions')->insert([
            'permission_id' => 1,
            'model_type' => 'App\\Models\\User',
            'model_id' => 1,
        ]);
        DB::table('model_has_permissions')->insert([
            'permission_id' => 2,
            'model_type' => 'App\\Models\\User',
            'model_id' => 2,
        ]);

        // 4. Academic Years & Semesters (academic_years, semesters)
        DB::table('academic_years')->updateOrInsert(['id' => 1], [
            'id' => 1,
            'name' => '2026/2027 Ganjil',
            'is_active' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        DB::table('academic_years')->updateOrInsert(['id' => 2], [
            'id' => 2,
            'name' => '2025/2026 Genap',
            'is_active' => 0,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('semesters')->updateOrInsert(['id' => 1], [
            'id' => 1,
            'name' => 'Semester Ganjil',
            'is_active' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        DB::table('semesters')->updateOrInsert(['id' => 2], [
            'id' => 2,
            'name' => 'Semester Genap',
            'is_active' => 0,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 5. Classes (classes) & Pivot (class_user)
        DB::table('classes')->updateOrInsert(['id' => 1], [
            'id' => 1,
            'school_id' => 1,
            'nama_kelas' => '12 RPL',
            'level' => '12',
            'jurusan' => 'RPL',
            'deskripsi' => 'Kelas XII Rekayasa Perangkat Lunak',
            'guru_id' => 5, // Wali Kelas: Siti Aminah, M.Pd
            'walimurid' => 'Siti Aminah, M.Pd',
            'no_telpon_wali' => '081234567891',
            'nama_km' => 'Fatih Muhammad',
            'no_telpon_km' => '081234567892',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('classes')->updateOrInsert(['id' => 2], [
            'id' => 2,
            'school_id' => 1,
            'nama_kelas' => '11 RPL',
            'level' => '11',
            'jurusan' => 'RPL',
            'deskripsi' => 'Kelas XI Rekayasa Perangkat Lunak',
            'guru_id' => 4, // Wali Kelas: Ustadz Ahmad
            'walimurid' => 'Ustadz Ahmad, S.Pd.I',
            'no_telpon_wali' => '081234567893',
            'nama_km' => 'Irfan Hakim',
            'no_telpon_km' => '081234567894',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // Enroll students into class 1 (12 RPL)
        $studentIds = [8, 10, 11, 12, 13, 14];
        foreach ($studentIds as $sId) {
            DB::table('class_user')->updateOrInsert(
                ['class_id' => 1, 'user_id' => $sId],
                ['enrolled_at' => $now]
            );
        }

        // 6. Subjects (subjects)
        $subjects = [
            ['id' => 1, 'school_id' => 1, 'class_id' => 1, 'nama_mapel' => 'Bahasa Arab', 'guru_id' => 4, 'class_level' => '12', 'jurusan' => 'RPL', 'deskripsi' => 'Pelajaran Bahasa Arab & Mufrodat'],
            ['id' => 2, 'school_id' => 1, 'class_id' => 1, 'nama_mapel' => 'Matematika Terapan', 'guru_id' => 5, 'class_level' => '12', 'jurusan' => 'RPL', 'deskripsi' => 'Kalkulus, Matriks & Statistika Data'],
            ['id' => 3, 'school_id' => 1, 'class_id' => 1, 'nama_mapel' => 'Rekayasa Perangkat Lunak', 'guru_id' => 4, 'class_level' => '12', 'jurusan' => 'RPL', 'deskripsi' => 'Arsitektur Web Modern, Laravel, & Database'],
            ['id' => 4, 'school_id' => 1, 'class_id' => 1, 'nama_mapel' => 'Pendidikan Agama Islam', 'guru_id' => 4, 'class_level' => '12', 'jurusan' => 'RPL', 'deskripsi' => 'Akidah Akhlak dan Fiqih Muamalah'],
            ['id' => 5, 'school_id' => 1, 'class_id' => 1, 'nama_mapel' => 'Bahasa Indonesia', 'guru_id' => 5, 'class_level' => '12', 'jurusan' => 'RPL', 'deskripsi' => 'Literasi Ilmiah & Komunikasi Formal'],
        ];
        foreach ($subjects as $sb) {
            $sb['created_at'] = $now;
            $sb['updated_at'] = $now;
            DB::table('subjects')->updateOrInsert(['id' => $sb['id']], $sb);
        }

        // 7. Teaching Assignments (teaching_assignments)
        $teachingAssignments = [
            ['id' => 1, 'school_id' => 1, 'teacher_id' => 4, 'subject_id' => 1, 'class_id' => 1, 'academic_year_id' => 1, 'semester_id' => 1],
            ['id' => 2, 'school_id' => 1, 'teacher_id' => 5, 'subject_id' => 2, 'class_id' => 1, 'academic_year_id' => 1, 'semester_id' => 1],
            ['id' => 3, 'school_id' => 1, 'teacher_id' => 4, 'subject_id' => 3, 'class_id' => 1, 'academic_year_id' => 1, 'semester_id' => 1],
            ['id' => 4, 'school_id' => 1, 'teacher_id' => 4, 'subject_id' => 4, 'class_id' => 1, 'academic_year_id' => 1, 'semester_id' => 1],
            ['id' => 5, 'school_id' => 1, 'teacher_id' => 5, 'subject_id' => 5, 'class_id' => 1, 'academic_year_id' => 1, 'semester_id' => 1],
        ];
        foreach ($teachingAssignments as $ta) {
            $ta['created_at'] = $now;
            $ta['updated_at'] = $now;
            DB::table('teaching_assignments')->updateOrInsert(['id' => $ta['id']], $ta);
        }

        // 8. Teaching Schedule (teaching_schedule)
        $schedules = [
            ['id' => 1, 'school_id' => 1, 'guru_id' => 4, 'class_id' => 1, 'subject_id' => 1, 'hari' => 'Senin', 'jam_mulai' => '07:30:00', 'jam_selesai' => '09:00:00'],
            ['id' => 2, 'school_id' => 1, 'guru_id' => 5, 'class_id' => 1, 'subject_id' => 2, 'hari' => 'Senin', 'jam_mulai' => '09:15:00', 'jam_selesai' => '10:45:00'],
            ['id' => 3, 'school_id' => 1, 'guru_id' => 4, 'class_id' => 1, 'subject_id' => 3, 'hari' => 'Selasa', 'jam_mulai' => '08:00:00', 'jam_selesai' => '10:00:00'],
            ['id' => 4, 'school_id' => 1, 'guru_id' => 5, 'class_id' => 1, 'subject_id' => 5, 'hari' => 'Rabu', 'jam_mulai' => '07:30:00', 'jam_selesai' => '09:00:00'],
            ['id' => 5, 'school_id' => 1, 'guru_id' => 4, 'class_id' => 1, 'subject_id' => 4, 'hari' => 'Kamis', 'jam_mulai' => '09:00:00', 'jam_selesai' => '11:00:00'],
        ];
        foreach ($schedules as $sc) {
            $sc['created_at'] = $now;
            $sc['updated_at'] = $now;
            DB::table('teaching_schedule')->updateOrInsert(['id' => $sc['id']], $sc);
        }

        // 9. Teaching Journals (teaching_journals) & Teaching Logs (teaching_logs)
        $journals = [
            ['id' => 1, 'school_id' => 1, 'teaching_assignment_id' => 1, 'date' => '2026-10-05', 'content' => 'Pertemuan 1: Pengantar Nahwu Shorof dan Mufrodat Keseharian di Lingkungan Sekolah.'],
            ['id' => 2, 'school_id' => 1, 'teaching_assignment_id' => 2, 'date' => '2026-10-05', 'content' => 'Pertemuan 2: Pembahasan Matriks Invers dan Determinan Ordo 3x3 beserta Aplikasi Statistika.'],
            ['id' => 3, 'school_id' => 1, 'teaching_assignment_id' => 3, 'date' => '2026-10-06', 'content' => 'Pertemuan 1: Konfigurasi Arsitektur Database MySQL, Migrasi Laravel, dan Relasi Eloquent.'],
        ];
        foreach ($journals as $j) {
            $j['created_at'] = $now;
            $j['updated_at'] = $now;
            DB::table('teaching_journals')->updateOrInsert(['id' => $j['id']], $j);
        }

        $teachingLogs = [
            ['id' => 1, 'school_id' => 1, 'guru_id' => 4, 'class_id' => 1, 'subject_id' => 1, 'tanggal' => '2026-10-05', 'materi' => 'Tarkib & Percakapan Bahasa Arab', 'catatan' => 'Siswa sangat antusias dalam praktik dialog berpasangan.'],
            ['id' => 2, 'school_id' => 1, 'guru_id' => 5, 'class_id' => 1, 'subject_id' => 2, 'tanggal' => '2026-10-05', 'materi' => 'Matriks & Transformasi', 'catatan' => 'Sebagian besar siswa tuntas mengerjakan latihan soal terbimbing.'],
            ['id' => 3, 'school_id' => 1, 'guru_id' => 4, 'class_id' => 1, 'subject_id' => 3, 'tanggal' => '2026-10-06', 'materi' => 'Eloquent Model & REST API', 'catatan' => 'Praktikum lab berjalan lancar, seluruh komputer terhubung ke local database.'],
        ];
        foreach ($teachingLogs as $tl) {
            $tl['created_at'] = $now;
            $tl['updated_at'] = $now;
            DB::table('teaching_logs')->updateOrInsert(['id' => $tl['id']], $tl);
        }

        // 10. Teacher Attendances (teacher_attendances) & Teacher Histories (teacher_histories)
        $teacherAttendances = [
            ['id' => 1, 'school_id' => 1, 'teacher_id' => 4, 'date' => '2026-10-05', 'status' => 'Hadir'],
            ['id' => 2, 'school_id' => 1, 'teacher_id' => 5, 'date' => '2026-10-05', 'status' => 'Hadir'],
            ['id' => 3, 'school_id' => 1, 'teacher_id' => 4, 'date' => '2026-10-06', 'status' => 'Hadir'],
            ['id' => 4, 'school_id' => 1, 'teacher_id' => 5, 'date' => '2026-10-06', 'status' => 'Hadir'],
            ['id' => 5, 'school_id' => 1, 'teacher_id' => 6, 'date' => '2026-10-06', 'status' => 'Hadir'],
        ];
        foreach ($teacherAttendances as $taRow) {
            $taRow['created_at'] = $now;
            $taRow['updated_at'] = $now;
            DB::table('teacher_attendances')->updateOrInsert(['id' => $taRow['id']], $taRow);
        }

        $teacherHistories = [
            ['id' => 1, 'school_id' => 1, 'teacher_id' => 4, 'history_details' => 'Memulai tugas pengajar di sekolah sejak 2018. Meraih sertifikasi Pendidik Profesional dan Pembina Ekstrakurikuler Tahfidz.'],
            ['id' => 2, 'school_id' => 1, 'teacher_id' => 5, 'history_details' => 'Mengabdi sejak 2015 sebagai Guru Matematika. Ditunjuk sebagai Koordinator Kurikulum Merdeka dan Wali Kelas Unggulan.'],
            ['id' => 3, 'school_id' => 1, 'teacher_id' => 6, 'history_details' => 'Konselor BK berlisensi Himpsi sejak 2019. Memimpin program Anti-Bullying dan Bimbingan Karir Masuk PTN.'],
        ];
        foreach ($teacherHistories as $th) {
            $th['created_at'] = $now;
            $th['updated_at'] = $now;
            DB::table('teacher_histories')->updateOrInsert(['id' => $th['id']], $th);
        }

        // 11. Attendance Rules (attendance_rules)
        DB::table('attendance_rules')->updateOrInsert(['id' => 1], [
            'id' => 1,
            'school_id' => 1,
            'check_in_time' => '07:00:00',
            'check_out_time' => '15:30:00',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        // 12. Student Identities (student_identities)
        // Using Eloquent model because nik, nisn, parents_name, address use encrypted casts
        $studentIdentitiesData = [
            ['user_id' => 8, 'name' => 'Fatih Muhammad', 'class' => '12 RPL', 'nik' => '3273011405080001', 'nisn' => '0089234120', 'date_of_birth' => '2008-05-14', 'parents_name' => 'Bambang Trianto', 'address' => 'Jl. Merdeka No. 45, Bandung'],
            ['user_id' => 10, 'name' => 'Ahmad Fauzi', 'class' => '12 RPL', 'nik' => '3273011204080002', 'nisn' => '0078192031', 'date_of_birth' => '2008-04-12', 'parents_name' => 'Fauzi Hidayat, S.E.', 'address' => 'Jl. Diponegoro No. 45, Bandung'],
            ['user_id' => 11, 'name' => 'Nadia Syahrini', 'class' => '12 RPL', 'nik' => '3273012506080003', 'nisn' => '0078192032', 'date_of_birth' => '2008-06-25', 'parents_name' => 'Ir. Syahrini Mulyadi', 'address' => 'Komplek Permata Hijau Blok C-12, Bandung'],
            ['user_id' => 12, 'name' => 'Rian Hidayat', 'class' => '12 RPL', 'nik' => '3273011801080004', 'nisn' => '0078192033', 'date_of_birth' => '2008-01-18', 'parents_name' => 'Hidayat Sutisna', 'address' => 'Jl. Cibabat No. 89, Cimahi'],
            ['user_id' => 13, 'name' => 'Citra Lestari', 'class' => '12 RPL', 'nik' => '3273011408080005', 'nisn' => '0078192034', 'date_of_birth' => '2008-08-14', 'parents_name' => 'Dra. Lestari Handayani', 'address' => 'Jl. Buah Batu No. 102, Bandung'],
            ['user_id' => 14, 'name' => 'Dimas Arya', 'class' => '12 RPL', 'nik' => '3273010209080006', 'nisn' => '0078192035', 'date_of_birth' => '2008-09-02', 'parents_name' => 'Arya Gunawan', 'address' => 'Jl. Cikutra Barat No. 15, Bandung'],
        ];
        foreach ($studentIdentitiesData as $sid) {
            StudentIdentity::updateOrCreate(['user_id' => $sid['user_id']], $sid);
        }

        // 13. Student Families (student_families)
        $studentFamilies = [
            ['id' => 1, 'school_id' => 1, 'student_id' => 8, 'father_name' => 'Bambang Trianto', 'mother_name' => 'Siti Rahmawati', 'guardian_name' => 'Bambang Trianto'],
            ['id' => 2, 'school_id' => 1, 'student_id' => 10, 'father_name' => 'Fauzi Hidayat, S.E.', 'mother_name' => 'Rina Kartika', 'guardian_name' => 'Fauzi Hidayat, S.E.'],
            ['id' => 3, 'school_id' => 1, 'student_id' => 11, 'father_name' => 'H. Mulyadi Saputra', 'mother_name' => 'Ir. Syahrini Mulyadi', 'guardian_name' => 'Ir. Syahrini Mulyadi'],
            ['id' => 4, 'school_id' => 1, 'student_id' => 12, 'father_name' => 'Hidayat Sutisna', 'mother_name' => 'Eni Sumarni', 'guardian_name' => 'Hidayat Sutisna'],
            ['id' => 5, 'school_id' => 1, 'student_id' => 13, 'father_name' => 'Drs. Agus Budiman', 'mother_name' => 'Dra. Lestari Handayani', 'guardian_name' => 'Dra. Lestari Handayani'],
            ['id' => 6, 'school_id' => 1, 'student_id' => 14, 'father_name' => 'Arya Gunawan', 'mother_name' => 'Sri Wahyuni', 'guardian_name' => 'Arya Gunawan'],
        ];
        foreach ($studentFamilies as $sf) {
            $sf['created_at'] = $now;
            $sf['updated_at'] = $now;
            DB::table('student_families')->updateOrInsert(['id' => $sf['id']], $sf);
        }

        // 14. Student Histories (student_histories)
        $studentHistories = [
            ['id' => 1, 'school_id' => 1, 'student_id' => 8, 'history_details' => 'Diterima di SMK myAcademic jalur prestasi akademik dengan nilai rata-rata 92.5. Terpilih sebagai Ketua Kelas 12 RPL.'],
            ['id' => 2, 'school_id' => 1, 'student_id' => 10, 'history_details' => 'Juara 1 Lomba Cerdas Cermat Sains Tingkat Kota Bandung dan Ketua Tim Robotik Sekolah.'],
            ['id' => 3, 'school_id' => 1, 'student_id' => 11, 'history_details' => 'Sekretaris 1 Organisasi Siswa dan Juara 2 Debat Bahasa Inggris Tingkat Provinsi Jawa Barat.'],
            ['id' => 4, 'school_id' => 1, 'student_id' => 12, 'history_details' => 'Anggota tim futsal inti sekolah, dalam bimbingan regulasi disiplin kehadiran.'],
        ];
        foreach ($studentHistories as $sh) {
            $sh['created_at'] = $now;
            $sh['updated_at'] = $now;
            DB::table('student_histories')->updateOrInsert(['id' => $sh['id']], $sh);
        }

        // 15. Student Achievements (student_achievements)
        $achievements = [
            ['id' => 1, 'school_id' => 1, 'student_id' => 8, 'title' => 'Juara 1 Lomba Web Design & Fullstack Development', 'description' => 'Kompetisi Inovasi Teknologi Pelajar Tingkat Jawa Barat 2026'],
            ['id' => 2, 'school_id' => 1, 'student_id' => 8, 'title' => 'Sertifikasi Internasional Cloud Practitioner', 'description' => 'Berhasil lulus sertifikasi dengan skor kelulusan 890/1000'],
            ['id' => 3, 'school_id' => 1, 'student_id' => 10, 'title' => 'Juara 1 Olimpiade Robotik & IoT Pelajar Nasional', 'description' => 'Membangun prototype sistem smart farming berbasis ESP32 dan AI'],
            ['id' => 4, 'school_id' => 1, 'student_id' => 11, 'title' => 'Juara 2 English Debate Championship 2026', 'description' => 'Mewakili kontingen sekolah pada ajang debat antar-SMA se-Jawa Barat'],
        ];
        foreach ($achievements as $ach) {
            $ach['created_at'] = $now;
            $ach['updated_at'] = $now;
            DB::table('student_achievements')->updateOrInsert(['id' => $ach['id']], $ach);
        }

        // 16. Student Violations (student_violations)
        $violations = [
            ['id' => 1, 'school_id' => 1, 'student_id' => 12, 'violation_type' => 'Terlambat masuk sekolah lebih dari 15 menit (Poin: 5)'],
            ['id' => 2, 'school_id' => 1, 'student_id' => 12, 'violation_type' => 'Atribut seragam tidak lengkap saat upacara bendera (Poin: 5)'],
            ['id' => 3, 'school_id' => 1, 'student_id' => 14, 'violation_type' => 'Tidak mengumpulkan tugas matematika tepat waktu (Poin: 5)'],
            ['id' => 4, 'school_id' => 1, 'student_id' => 8, 'violation_type' => 'Terlambat masuk kelas setelah jam istirahat kedua (Catatan pembinaan lisan)'],
        ];
        foreach ($violations as $v) {
            $v['created_at'] = $now;
            $v['updated_at'] = $now;
            DB::table('student_violations')->updateOrInsert(['id' => $v['id']], $v);
        }

        // 17. Extracurriculars (extracurriculars) & Members (extracurricular_members)
        $extracurriculars = [
            ['id' => 1, 'school_id' => 1, 'name' => 'Robotik & Artificial Intelligence'],
            ['id' => 2, 'school_id' => 1, 'name' => 'Tahfidz Al-Qur\'an & Tilawah'],
            ['id' => 3, 'school_id' => 1, 'name' => 'English Club & Public Speaking'],
            ['id' => 4, 'school_id' => 1, 'name' => 'Futsal & Olahraga Prestasi'],
            ['id' => 5, 'school_id' => 1, 'name' => 'Pramuka Inti & Pasukan Pengibar Bendera'],
        ];
        foreach ($extracurriculars as $ex) {
            $ex['created_at'] = $now;
            $ex['updated_at'] = $now;
            DB::table('extracurriculars')->updateOrInsert(['id' => $ex['id']], $ex);
        }

        $exMembers = [
            ['id' => 1, 'school_id' => 1, 'extracurricular_id' => 1, 'student_id' => 8],
            ['id' => 2, 'school_id' => 1, 'extracurricular_id' => 2, 'student_id' => 8],
            ['id' => 3, 'school_id' => 1, 'extracurricular_id' => 1, 'student_id' => 10],
            ['id' => 4, 'school_id' => 1, 'extracurricular_id' => 3, 'student_id' => 11],
            ['id' => 5, 'school_id' => 1, 'extracurricular_id' => 4, 'student_id' => 12],
            ['id' => 6, 'school_id' => 1, 'extracurricular_id' => 5, 'student_id' => 13],
        ];
        foreach ($exMembers as $xm) {
            $xm['created_at'] = $now;
            $xm['updated_at'] = $now;
            DB::table('extracurricular_members')->updateOrInsert(['id' => $xm['id']], $xm);
        }

        // 18. Counseling Cases (counseling_cases)
        $cases = [
            [
                'id' => 1,
                'school_id' => 1,
                'student_id' => 8,
                'details' => json_encode([
                    'case_number' => 'CASE-2026-0042',
                    'topic' => 'Konsultasi Pilihan Jurusan Perguruan Tinggi & Karir Software Engineer',
                    'category' => 'Bimbingan Karir & Studi Lanjut',
                    'priority' => 'Normal',
                    'status' => 'Ongoing',
                    'counselor' => 'Nurul Hidayah, S.Psi',
                    'counselor_id' => 6,
                    'notes' => 'Siswa berencana melanjutkan ke Teknik Informatika ITB/UI. Perlu pemantauan nilai matematika terapan dan portofolio coding.',
                    'follow_up' => 'Simulasi SNBT dan konsultasi pemilihan jalur beasiswa prestasi.',
                    'date' => '2026-10-02',
                ]),
            ],
            [
                'id' => 2,
                'school_id' => 1,
                'student_id' => 12,
                'details' => json_encode([
                    'case_number' => 'CASE-2026-0040',
                    'topic' => 'Pembinaan Kedisiplinan Kehadiran dan Manajemen Waktu',
                    'category' => 'Kedisiplinan & Presensi',
                    'priority' => 'Urgent',
                    'status' => 'Intervention',
                    'counselor' => 'Nurul Hidayah, S.Psi',
                    'counselor_id' => 6,
                    'notes' => 'Tercatat 3x terlambat berulang. Dilakukan kontrak perilaku positif bersama wali kelas dan orang tua.',
                    'follow_up' => 'Pemantauan presensi harian di gerbang sekolah.',
                    'date' => '2026-09-28',
                ]),
            ],
            [
                'id' => 3,
                'school_id' => 1,
                'student_id' => 10,
                'details' => json_encode([
                    'case_number' => 'CASE-2026-0038',
                    'topic' => 'Manajemen Stres Persiapan Kompetisi Sains & Keseimbangan Belajar',
                    'category' => 'Regulasi Diri & Akademik',
                    'priority' => 'Monitoring',
                    'status' => 'Resolved',
                    'counselor' => 'Nurul Hidayah, S.Psi',
                    'counselor_id' => 6,
                    'notes' => 'Siswa merasa lelah jadwal padat latihan robotik. Diberikan teknik time-blocking dan relaksasi.',
                    'follow_up' => 'Evaluasi kesehatan kognitif pasca lomba.',
                    'date' => '2026-09-15',
                ]),
            ],
        ];
        foreach ($cases as $c) {
            $c['created_at'] = $now;
            $c['updated_at'] = $now;
            DB::table('counseling_cases')->updateOrInsert(['id' => $c['id']], $c);
        }

        // 19. Materials (materials) & Learning Materials (learning_materials)
        $materials = [
            ['id' => 1, 'school_id' => 1, 'subject_id' => 1, 'judul' => 'Modul Nahwu & Shorof Praktis', 'konten' => 'Ringkasan kaidah pembentukan kata kerja (fi\'il) dan isim dalam bahasa Arab beserta contoh kalimat harian.', 'file_id' => null, 'file_path' => '/materials/modul_nahwu.pdf', 'video_link' => 'https://youtube.com/watch?v=sample1', 'created_by' => 4],
            ['id' => 2, 'school_id' => 1, 'subject_id' => 2, 'judul' => 'Kalkulus Terapan & Matriks Invers', 'konten' => 'Konsep dasar operasi matriks, eliminasi Gauss-Jordan, dan aplikasinya pada grafika komputer.', 'file_id' => null, 'file_path' => '/materials/modul_matriks.pdf', 'video_link' => 'https://youtube.com/watch?v=sample2', 'created_by' => 5],
            ['id' => 3, 'school_id' => 1, 'subject_id' => 3, 'judul' => 'Arsitektur RESTful API dengan Laravel 11', 'konten' => 'Panduan membangun backend clean architecture, middleware auth Sanctum, dan ORM Eloquent.', 'file_id' => null, 'file_path' => '/materials/modul_laravel_api.pdf', 'video_link' => 'https://youtube.com/watch?v=sample3', 'created_by' => 4],
        ];
        foreach ($materials as $m) {
            $m['created_at'] = $now;
            $m['updated_at'] = $now;
            DB::table('materials')->updateOrInsert(['id' => $m['id']], $m);
        }

        $learningMaterials = [
            ['id' => 1, 'school_id' => 1, 'teaching_assignment_id' => 1, 'title' => 'Slide Presentasi: Mufradat & Percakapan Arab', 'description' => 'Materi tayang pertemuan 1-3', 'file_path' => '/learning/slide_arab_bab1.pptx'],
            ['id' => 2, 'school_id' => 1, 'teaching_assignment_id' => 2, 'title' => 'Lembar Kerja Siswa: Matriks Ordo 3x3', 'description' => 'Latihan mandiri terbimbing pertemuan ke-2', 'file_path' => '/learning/lks_matriks.pdf'],
            ['id' => 3, 'school_id' => 1, 'teaching_assignment_id' => 3, 'title' => 'Cheatsheet Database Schema & Foreign Key Rules', 'description' => 'Panduan cepat pemodelan basis data terelasi', 'file_path' => '/learning/cheatsheet_sql.pdf'],
        ];
        foreach ($learningMaterials as $lm) {
            $lm['created_at'] = $now;
            $lm['updated_at'] = $now;
            DB::table('learning_materials')->updateOrInsert(['id' => $lm['id']], $lm);
        }

        // 20. File Uploads (file_uploads)
        $fileUploads = [
            ['id' => 1, 'original_name' => 'modul_nahwu.pdf', 'stored_name' => 'f1_modul_nahwu.pdf', 'file_path' => 'uploads/materials/f1_modul_nahwu.pdf', 'mime_type' => 'application/pdf', 'file_size' => 2048500, 'size' => 2048500, 'uploader_id' => 4, 'uploaded_at' => $now],
            ['id' => 2, 'original_name' => 'modul_matriks.pdf', 'stored_name' => 'f2_modul_matriks.pdf', 'file_path' => 'uploads/materials/f2_modul_matriks.pdf', 'mime_type' => 'application/pdf', 'file_size' => 1845100, 'size' => 1845100, 'uploader_id' => 5, 'uploaded_at' => $now],
            ['id' => 3, 'original_name' => 'tugas_fatih_nahwu.pdf', 'stored_name' => 'f3_tugas_fatih.pdf', 'file_path' => 'uploads/submissions/f3_tugas_fatih.pdf', 'mime_type' => 'application/pdf', 'file_size' => 524100, 'size' => 524100, 'uploader_id' => 8, 'uploaded_at' => $now],
        ];
        foreach ($fileUploads as $fu) {
            $fu['created_at'] = $now;
            $fu['updated_at'] = $now;
            DB::table('file_uploads')->updateOrInsert(['id' => $fu['id']], $fu);
        }

        // 21. Study Files (study_files) in Space Belajar
        $studyFiles = [
            ['id' => 1, 'user_id' => 8, 'folder_id' => 1, 'title' => 'Catatan Bab 1 Nahwu & Shorof', 'original_name' => 'catatan_bab1.pdf', 'stored_name' => 'st_fatih_1.pdf', 'mime_type' => 'application/pdf', 'size_bytes' => 312000, 'description' => 'Catatan pribadi materi tarkib bahasa arab'],
            ['id' => 2, 'user_id' => 8, 'folder_id' => 1, 'title' => 'Rangkuman Rumus Matriks & Determinan', 'original_name' => 'rumus_matriks.pdf', 'stored_name' => 'st_fatih_2.pdf', 'mime_type' => 'application/pdf', 'size_bytes' => 420000, 'description' => 'Cheat sheet persiapan PTS Matematika'],
            ['id' => 3, 'user_id' => 8, 'folder_id' => 2, 'title' => 'Diagram Arsitektur Web myAcademic', 'original_name' => 'diagram_arsitektur.png', 'stored_name' => 'st_fatih_3.png', 'mime_type' => 'image/png', 'size_bytes' => 650000, 'description' => 'Desain ERD dan flow API sistem sekolah'],
        ];
        foreach ($studyFiles as $sfItem) {
            $sfItem['created_at'] = $now;
            $sfItem['updated_at'] = $now;
            DB::table('study_files')->updateOrInsert(['id' => $sfItem['id']], $sfItem);
        }

        // 22. Study Goal Logs (study_goal_logs)
        $goalLogs = [
            ['id' => 1, 'goal_id' => 1, 'log_date' => '2026-10-05', 'notes' => 'Selesai membaca Bab 1 dan menghafal 20 mufrodat baru dengan sangat lancar.'],
            ['id' => 2, 'goal_id' => 1, 'log_date' => '2026-10-06', 'notes' => 'Latihan percakapan dengan teman sekelas selama 30 menit.'],
            ['id' => 3, 'goal_id' => 2, 'log_date' => '2026-10-05', 'notes' => 'Mengerjakan 10 soal latihan i\'rab fi\'il madhi dan mudhari.'],
        ];
        foreach ($goalLogs as $gl) {
            $gl['created_at'] = $now;
            $gl['updated_at'] = $now;
            DB::table('study_goal_logs')->updateOrInsert(['id' => $gl['id']], $gl);
        }

        // 23. Assignments (assignments) & Assignment Files (assignment_files)
        $assignments = [
            ['id' => 1, 'school_id' => 1, 'subject_id' => 1, 'target_class_id' => 1, 'judul' => 'Tugas 1: Terjemahan Teks Arab Kontemporer', 'deskripsi' => 'Terjemahkan artikel bacaan pada halaman 35-37 ke dalam bahasa Indonesia dengan kaidah tata bahasa yang runtut.', 'file_id' => 1, 'deadline' => $now->copy()->addDays(5)->toDateTimeString(), 'session_info' => 'Pertemuan 1', 'video_link' => null, 'created_by' => 4],
            ['id' => 2, 'school_id' => 1, 'subject_id' => 2, 'target_class_id' => 1, 'judul' => 'Tugas 2: Latihan Operasi Matriks & Invers', 'deskripsi' => 'Selesaikan 5 soal studi kasus matriks pada modul PDF bab 2.', 'file_id' => 2, 'deadline' => $now->copy()->addDays(7)->toDateTimeString(), 'session_info' => 'Pertemuan 2', 'video_link' => null, 'created_by' => 5],
            ['id' => 3, 'school_id' => 1, 'subject_id' => 3, 'target_class_id' => 1, 'judul' => 'Tugas 3: Implementasi Controller & Endpoint REST API', 'deskripsi' => 'Buat route dan controller backend lengkap dengan database migration.', 'file_id' => null, 'deadline' => $now->copy()->addDays(10)->toDateTimeString(), 'session_info' => 'Pertemuan 3', 'video_link' => null, 'created_by' => 4],
        ];
        foreach ($assignments as $a) {
            $a['created_at'] = $now;
            $a['updated_at'] = $now;
            DB::table('assignments')->updateOrInsert(['id' => $a['id']], $a);
        }

        $assignmentFiles = [
            ['id' => 1, 'assignment_id' => 1, 'file_id' => 1, 'file_type' => 'document'],
            ['id' => 2, 'assignment_id' => 2, 'file_id' => 2, 'file_type' => 'document'],
        ];
        foreach ($assignmentFiles as $af) {
            $af['created_at'] = $now;
            $af['updated_at'] = $now;
            DB::table('assignment_files')->updateOrInsert(['id' => $af['id']], $af);
        }

        // 24. Gradebooks (gradebooks) & Grades (grades)
        DB::table('gradebooks')->updateOrInsert(['id' => 1], [
            'id' => 1,
            'school_id' => 1,
            'name' => 'Buku Nilai Utama Kelas 12 RPL - Semester Ganjil 2026/2027',
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $grades = [
            ['id' => 1, 'school_id' => 1, 'gradebook_id' => 1, 'student_id' => 8, 'score' => 92.50, 'is_locked' => 0, 'type' => 'Tugas', 'related_id' => 1],
            ['id' => 2, 'school_id' => 1, 'gradebook_id' => 1, 'student_id' => 8, 'score' => 95.00, 'is_locked' => 0, 'type' => 'UTS', 'related_id' => 2],
            ['id' => 3, 'school_id' => 1, 'gradebook_id' => 1, 'student_id' => 8, 'score' => 94.00, 'is_locked' => 0, 'type' => 'Praktik', 'related_id' => 3],
            ['id' => 4, 'school_id' => 1, 'gradebook_id' => 1, 'student_id' => 10, 'score' => 89.50, 'is_locked' => 0, 'type' => 'Tugas', 'related_id' => 1],
            ['id' => 5, 'school_id' => 1, 'gradebook_id' => 1, 'student_id' => 11, 'score' => 91.00, 'is_locked' => 0, 'type' => 'Tugas', 'related_id' => 1],
            ['id' => 6, 'school_id' => 1, 'gradebook_id' => 1, 'student_id' => 12, 'score' => 74.00, 'is_locked' => 0, 'type' => 'Tugas', 'related_id' => 1],
            ['id' => 7, 'school_id' => 1, 'gradebook_id' => 1, 'student_id' => 13, 'score' => 85.00, 'is_locked' => 0, 'type' => 'Tugas', 'related_id' => 1],
            ['id' => 8, 'school_id' => 1, 'gradebook_id' => 1, 'student_id' => 14, 'score' => 82.50, 'is_locked' => 0, 'type' => 'Tugas', 'related_id' => 1],
        ];
        foreach ($grades as $gr) {
            $gr['created_at'] = $now;
            $gr['updated_at'] = $now;
            DB::table('grades')->updateOrInsert(['id' => $gr['id']], $gr);
        }

        // 25. Report Cards (report_cards)
        $reportCards = [
            ['id' => 1, 'school_id' => 1, 'student_id' => 8, 'comments' => 'Ananda Fatih menunjukkan komitmen dan prestasi akademik yang sangat tinggi. Pertahankan dedikasi kepemimpinan di kelas 12 RPL.'],
            ['id' => 2, 'school_id' => 1, 'student_id' => 10, 'comments' => 'Ahmad Fauzi memiliki kemampuan pemecahan masalah dan logika matematika yang sangat kuat. Selamat atas prestasi robotik.'],
            ['id' => 3, 'school_id' => 1, 'student_id' => 11, 'comments' => 'Nadia menunjukkan kemampuan komunikasi dan literasi bahasa yang luar biasa. Sangat aktif berkontribusi dalam kegiatan kelas.'],
            ['id' => 4, 'school_id' => 1, 'student_id' => 12, 'comments' => 'Rian perlu meningkatkan konsistensi kehadiran dan disiplin waktu agar potensi belajarnya dapat berkembang maksimal.'],
        ];
        foreach ($reportCards as $rc) {
            $rc['created_at'] = $now;
            $rc['updated_at'] = $now;
            DB::table('report_cards')->updateOrInsert(['id' => $rc['id']], $rc);
        }

        // 26. Exams (exams), Questions (questions), Attempts (exam_attempts), Answers (exam_answers)
        DB::table('exams')->updateOrInsert(['id' => 1], [
            'id' => 1,
            'school_id' => 1,
            'title' => 'Penilaian Tengah Semester (PTS) Bahasa Arab & Kaidah Nahwu',
            'gradebook_id' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);
        DB::table('exams')->updateOrInsert(['id' => 2], [
            'id' => 2,
            'school_id' => 1,
            'title' => 'Kuis Harian 1: Pemrograman Web & Arsitektur API',
            'gradebook_id' => 1,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        $questions = [
            ['id' => 1, 'school_id' => 1, 'exam_id' => 1, 'question_text' => 'Apakah arti dari kalimat mufrodat "مكتبة المدرسة" dalam bahasa Indonesia?', 'correct_answer' => 'Perpustakaan Sekolah', 'points' => 25.00],
            ['id' => 2, 'school_id' => 1, 'exam_id' => 1, 'question_text' => 'Tentukan tanda i\'rab rafa\' pada isim mufrod!', 'correct_answer' => 'Dhommah', 'points' => 25.00],
            ['id' => 3, 'school_id' => 1, 'exam_id' => 2, 'question_text' => 'Perintah artisan apa yang digunakan untuk mengeksekusi migration basis data di Laravel?', 'correct_answer' => 'php artisan migrate', 'points' => 50.00],
        ];
        foreach ($questions as $q) {
            $q['created_at'] = $now;
            $q['updated_at'] = $now;
            DB::table('questions')->updateOrInsert(['id' => $q['id']], $q);
        }

        $attempts = [
            ['id' => 1, 'school_id' => 1, 'exam_id' => 1, 'student_id' => 8],
            ['id' => 2, 'school_id' => 1, 'exam_id' => 2, 'student_id' => 8],
            ['id' => 3, 'school_id' => 1, 'exam_id' => 1, 'student_id' => 10],
        ];
        foreach ($attempts as $at) {
            $at['created_at'] = $now;
            $at['updated_at'] = $now;
            DB::table('exam_attempts')->updateOrInsert(['id' => $at['id']], $at);
        }

        $examAnswers = [
            ['id' => 1, 'school_id' => 1, 'exam_attempt_id' => 1, 'question_id' => 1, 'answer_text' => 'Perpustakaan Sekolah', 'is_correct' => 1, 'points_awarded' => 25.00],
            ['id' => 2, 'school_id' => 1, 'exam_attempt_id' => 1, 'question_id' => 2, 'answer_text' => 'Dhommah', 'is_correct' => 1, 'points_awarded' => 25.00],
            ['id' => 3, 'school_id' => 1, 'exam_attempt_id' => 2, 'question_id' => 3, 'answer_text' => 'php artisan migrate', 'is_correct' => 1, 'points_awarded' => 50.00],
        ];
        foreach ($examAnswers as $ea) {
            $ea['created_at'] = $now;
            $ea['updated_at'] = $now;
            DB::table('exam_answers')->updateOrInsert(['id' => $ea['id']], $ea);
        }

        // 27. Offline Tasks (tabel_offline_tasks) & Scores (tabel_offline_scores)
        $offlineTasks = [
            ['id' => 1, 'school_id' => 1, 'owner_id' => 4, 'class_id' => 1, 'subject_id' => 1, 'title' => 'Praktik Percakapan Bahasa Arab Berpasangan', 'nama_tugas' => 'Praktik Muhadatsah', 'description' => 'Penilaian kelancaran makhraj dan intonasi', 'content' => 'Siswa mendemonstrasikan percakapan topik di perpustakaan', 'photo' => null, 'video_url' => null, 'other_url' => null, 'tanggal' => '2026-10-05'],
            ['id' => 2, 'school_id' => 1, 'owner_id' => 5, 'class_id' => 1, 'subject_id' => 2, 'title' => 'Kuis Matriks Terbimbing di Papan Tulis', 'nama_tugas' => 'Kuis Matriks', 'description' => 'Penyelesaian sistem persamaan linier tiga variabel', 'content' => 'Langkah eliminasi dan substitusi matriks', 'photo' => null, 'video_url' => null, 'other_url' => null, 'tanggal' => '2026-10-05'],
        ];
        foreach ($offlineTasks as $ot) {
            $ot['created_at'] = $now;
            $ot['updated_at'] = $now;
            DB::table('tabel_offline_tasks')->updateOrInsert(['id' => $ot['id']], $ot);
        }

        $offlineScores = [
            ['id' => 1, 'task_id' => 1, 'student_id' => 8, 'score' => 95.00, 'nilai' => 95.00, 'note' => 'Pelafalan sangat fasih dan intonasi tepat.', 'catatan' => 'Sangat memuaskan'],
            ['id' => 2, 'task_id' => 1, 'student_id' => 10, 'score' => 90.00, 'nilai' => 90.00, 'note' => 'Bagus dan lancar.', 'catatan' => 'Tuntas'],
            ['id' => 3, 'task_id' => 1, 'student_id' => 11, 'score' => 92.00, 'nilai' => 92.00, 'note' => 'Ekspresif dan mufrodat kaya.', 'catatan' => 'Tuntas'],
            ['id' => 4, 'task_id' => 2, 'student_id' => 8, 'score' => 92.00, 'nilai' => 92.00, 'note' => 'Perhitungan determinan teliti.', 'catatan' => 'Tuntas'],
        ];
        foreach ($offlineScores as $os) {
            $os['created_at'] = $now;
            $os['updated_at'] = $now;
            DB::table('tabel_offline_scores')->updateOrInsert(['id' => $os['id']], $os);
        }

        // 28. Table Templates (table_templates) & Documents (table_documents)
        $templates = [
            [
                'id' => 1,
                'school_id' => 1,
                'owner_id' => 2,
                'name' => 'Format Penilaian Harian Kurikulum Merdeka',
                'description' => 'Template standar guru untuk rekap nilai TP (Tujuan Pembelajaran)',
                'visibility' => 'public',
                'columns_json' => json_encode(['NIS', 'Nama', 'TP1', 'TP2', 'TP3', 'Rata-rata', 'Ketercapaian']),
                'is_active' => 1,
            ],
            [
                'id' => 2,
                'school_id' => 1,
                'owner_id' => 5,
                'name' => 'Rekap Presensi & Keaktifan Ekstrakurikuler',
                'description' => 'Form kehadiran mingguan anggota ekskul',
                'visibility' => 'public',
                'columns_json' => json_encode(['Nama Ekskul', 'Tanggal', 'Jumlah Hadir', 'Materi Kegiatan']),
                'is_active' => 1,
            ],
        ];
        foreach ($templates as $tmpl) {
            $tmpl['created_at'] = $now;
            $tmpl['updated_at'] = $now;
            DB::table('table_templates')->updateOrInsert(['id' => $tmpl['id']], $tmpl);
        }

        $documents = [
            [
                'id' => 1,
                'school_id' => 1,
                'template_id' => 1,
                'owner_id' => 4,
                'name' => 'Rekap Nilai Harian Bahasa Arab 12 RPL',
                'description' => 'Rekap nilai asesmen formatif bulan Oktober 2026',
                'data_json' => json_encode([
                    ['NIS' => 'NIS-8', 'Nama' => 'Fatih Muhammad', 'TP1' => 95, 'TP2' => 92, 'TP3' => 94, 'Rata-rata' => 93.6, 'Ketercapaian' => 'Tuntas Optimal'],
                    ['NIS' => 'NIS-10', 'Nama' => 'Ahmad Fauzi', 'TP1' => 90, 'TP2' => 88, 'TP3' => 91, 'Rata-rata' => 89.6, 'Ketercapaian' => 'Tuntas Optimal'],
                ]),
            ],
        ];
        foreach ($documents as $doc) {
            $doc['created_at'] = $now;
            $doc['updated_at'] = $now;
            DB::table('table_documents')->updateOrInsert(['id' => $doc['id']], $doc);
        }

        // 29. School Settings (school_settings)
        $settings = [
            ['id' => 1, 'school_id' => 1, 'setting_key' => 'school_brand_name', 'setting_value' => 'myAcademic Smart School Platform'],
            ['id' => 2, 'school_id' => 1, 'setting_key' => 'active_academic_year', 'setting_value' => '2026/2027 Ganjil'],
            ['id' => 3, 'school_id' => 1, 'setting_key' => 'active_curriculum', 'setting_value' => 'Kurikulum Merdeka Mandiri Berbagi'],
            ['id' => 4, 'school_id' => 1, 'setting_key' => 'attendance_radius_meters', 'setting_value' => '100'],
            ['id' => 5, 'school_id' => 1, 'setting_key' => 'official_contact_whatsapp', 'setting_value' => '+6281234567890'],
        ];
        foreach ($settings as $st) {
            $st['created_at'] = $now;
            $st['updated_at'] = $now;
            DB::table('school_settings')->updateOrInsert(['id' => $st['id']], $st);
        }

        // 30. School Events (school_events) & Calendar Events (calendar_events)
        $schoolEvents = [
            ['id' => 1, 'school_id' => 1, 'title' => 'Upacara Peringatan Hari Pendidikan & Bulan Bahasa', 'event_date' => '2026-10-28 07:00:00'],
            ['id' => 2, 'school_id' => 1, 'title' => 'Pekan Olahraga & Seni Antar Kelas (Class Meeting)', 'event_date' => '2026-11-10 08:00:00'],
            ['id' => 3, 'school_id' => 1, 'title' => 'Pelaksanaan Penilaian Akhir Semester (PAS) Ganjil', 'event_date' => '2026-12-01 07:30:00'],
        ];
        foreach ($schoolEvents as $se) {
            $se['created_at'] = $now;
            $se['updated_at'] = $now;
            DB::table('school_events')->updateOrInsert(['id' => $se['id']], $se);
        }

        $calendarEvents = [
            ['id' => 1, 'user_id' => 8, 'event_date' => '2026-10-12', 'type' => 'special', 'title' => 'Mulai Penilaian Tengah Semester (PTS)', 'note' => 'Siapkan kartu peserta ujian dan ringkasan materi.'],
            ['id' => 2, 'user_id' => 8, 'event_date' => '2026-10-15', 'type' => 'warning', 'title' => 'Deadline Tugas Proyek Bahasa Arab', 'note' => 'Submit file PDF terjemahan sebelum pukul 23:59 WIB.'],
            ['id' => 3, 'user_id' => 8, 'event_date' => '2026-10-28', 'type' => 'holiday', 'title' => 'Peringatan Hari Sumpah Pemuda', 'note' => 'Kegiatan upacara bendera dan lomba pidato 3 bahasa.'],
        ];
        foreach ($calendarEvents as $ce) {
            $ce['created_at'] = $now;
            $ce['updated_at'] = $now;
            DB::table('calendar_events')->updateOrInsert(['id' => $ce['id']], $ce);
        }

        // 31. Announcements (announcements)
        $announcements = [
            [
                'id' => 1,
                'school_id' => 1,
                'title' => 'Jadwal Resmi Pelaksanaan Penilaian Tengah Semester (PTS) Ganjil 2026',
                'content' => 'Diberitahukan kepada seluruh siswa kelas X, XI, dan XII bahwa PTS Ganjil akan dimulai pada hari Senin, 12 Oktober 2026. Mohon menyelesaikan seluruh administrasi dan tugas harian sebelum tanggal tersebut.',
                'created_by' => 2,
            ],
            [
                'id' => 2,
                'school_id' => 1,
                'title' => 'Pendaftaran Ekstrakurikuler Robotik & AI Telah Dibuka',
                'content' => 'Bagi siswa yang berminat mengembangkan teknologi mikrokontroler, IoT, dan aplikasi AI, pendaftaran dibuka hingga hari Jumat pekan ini di Ruang Laboratorium Komputer 1.',
                'created_by' => 4,
            ],
            [
                'id' => 3,
                'school_id' => 1,
                'title' => 'Pertemuan Wali Murid & Pemaparan Program Semester Ganjil',
                'content' => 'Kami mengundang bapak/ibu orang tua siswa kelas 12 untuk menghadiri musyawarah koordinasi persiapan kelulusan dan karir kampus pada hari Sabtu, 17 Oktober 2026.',
                'created_by' => 5,
            ],
        ];
        foreach ($announcements as $an) {
            $an['created_at'] = $now;
            $an['updated_at'] = $now;
            DB::table('announcements')->updateOrInsert(['id' => $an['id']], $an);
        }

        // 32. Audit Logs (audit_logs)
        $auditLogs = [
            [
                'id' => 1,
                'user_id' => 2,
                'school_id' => 1,
                'action' => 'UPDATE_SCHOOL_SETTINGS',
                'model_type' => 'App\\Models\\SchoolSetting',
                'model_id' => 1,
                'old_values' => json_encode(['setting_value' => 'Old Title']),
                'new_values' => json_encode(['setting_value' => 'myAcademic Smart School Platform']),
                'ip_address' => '127.0.0.1',
            ],
            [
                'id' => 2,
                'user_id' => 5,
                'school_id' => 1,
                'action' => 'FINALIZE_HOMEROOM_GRADES',
                'model_type' => 'App\\Models\\AcademicClass',
                'model_id' => 1,
                'old_values' => json_encode(['status' => 'draft']),
                'new_values' => json_encode(['status' => 'reviewed']),
                'ip_address' => '127.0.0.1',
            ],
            [
                'id' => 3,
                'user_id' => 8,
                'school_id' => 1,
                'action' => 'SUBMIT_ASSIGNMENT',
                'model_type' => 'App\\Models\\Submission',
                'model_id' => 1,
                'old_values' => json_encode([]),
                'new_values' => json_encode(['assignment_id' => 1, 'student_id' => 8]),
                'ip_address' => '127.0.0.1',
            ],
        ];
        foreach ($auditLogs as $al) {
            $al['created_at'] = $now;
            $al['updated_at'] = $now;
            DB::table('audit_logs')->updateOrInsert(['id' => $al['id']], $al);
        }

        // 33. Framework & Authentication Tables (sessions, password_reset_tokens, password_reset_verifications, jobs, job_batches, failed_jobs, cache_locks)
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => 'murid@gmail.com'],
            ['token' => Hash::make('SampleResetToken123'), 'created_at' => $now]
        );

        DB::table('password_reset_verifications')->updateOrInsert(['id' => 1], [
            'id' => 1,
            'user_id' => 8,
            'method' => 'admin_assisted',
            'token' => 'VRF-' . Str::upper(Str::random(8)),
            'verified_by_admin_id' => '2',
            'verification_notes' => 'Verifikasi langsung identitas murid oleh Administrator Sekolah',
            'is_used' => 0,
            'expires_at' => $now->copy()->addDays(2),
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        DB::table('sessions')->updateOrInsert(['id' => 'session_fatih_initial_001'], [
            'id' => 'session_fatih_initial_001',
            'user_id' => 8,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/129.0.0.0',
            'payload' => base64_encode(serialize(['user_id' => 8, 'login_time' => $now->timestamp])),
            'last_activity' => $now->timestamp,
        ]);

        DB::table('cache_locks')->updateOrInsert(['key' => 'school_schedule_calc_lock'], [
            'key' => 'school_schedule_calc_lock',
            'owner' => 'system_seeder_daemon',
            'expiration' => $now->timestamp + 3600,
        ]);

        DB::table('jobs')->updateOrInsert(['id' => 1], [
            'id' => 1,
            'queue' => 'default',
            'payload' => json_encode(['displayName' => 'App\\Jobs\\SendAttendanceNotificationJob', 'job' => 'Illuminate\\Queue\\CallQueuedHandler@call']),
            'attempts' => 0,
            'reserved_at' => null,
            'available_at' => $now->timestamp + 60,
            'created_at' => $now->timestamp,
        ]);

        DB::table('job_batches')->updateOrInsert(['id' => 'batch-001-init'], [
            'id' => 'batch-001-init',
            'name' => 'Batch Rekapitulasi Rapor Siswa Semester Ganjil',
            'total_jobs' => 1,
            'pending_jobs' => 0,
            'failed_jobs' => 0,
            'failed_job_ids' => '[]',
            'options' => json_encode([]),
            'cancelled_at' => null,
            'created_at' => $now->timestamp,
            'finished_at' => $now->timestamp + 5,
        ]);

        DB::table('failed_jobs')->updateOrInsert(['id' => 1], [
            'id' => 1,
            'uuid' => (string) Str::uuid(),
            'connection' => 'database',
            'queue' => 'notifications',
            'payload' => json_encode(['job' => 'App\\Jobs\\SendSmsAlert']),
            'exception' => 'SMS Gateway Provider Connection Timeout (Sample resolved log)',
            'failed_at' => $now,
        ]);
    }
}
