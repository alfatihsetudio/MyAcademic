<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Default School
        DB::table('schools')->updateOrInsert(['id' => 1], [
            'id' => 1,
            'name' => 'Sekolah Markaz Lugoh',
            'alamat' => 'Jl. Markaz Lugoh No. 1',
            'telepon' => '081234567890',
            'email' => 'info@markazlugoh.sch.id',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        $schoolId = 1;

        // 2. Default Users
        $defaultPassword = Hash::make('admin123');

        $users = [
            [
                'school_id' => 1,
                'name' => 'Super Admin Platform',
                'nama' => 'Super Admin Platform',
                'email' => 'superadmin@gmail.com',
                'password' => $defaultPassword,
                'role' => 'superadmin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 1,
                'name' => 'Administrator',
                'nama' => 'Administrator',
                'email' => 'admin@gmail.com',
                'password' => $defaultPassword,
                'role' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 1,
                'name' => 'Dr. H. Sulaiman, M.Si (Kepala Sekolah)',
                'nama' => 'Dr. H. Sulaiman, M.Si (Kepala Sekolah)',
                'email' => 'kepsek@gmail.com',
                'password' => $defaultPassword,
                'role' => 'kepsek',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 1,
                'name' => 'Ustadz Ahmad (Guru)',
                'nama' => 'Ustadz Ahmad (Guru)',
                'email' => 'guru@gmail.com',
                'password' => $defaultPassword,
                'role' => 'guru',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 1,
                'name' => 'Siti Aminah, M.Pd (Wali Kelas)',
                'nama' => 'Siti Aminah, M.Pd (Wali Kelas)',
                'email' => 'walikelas@gmail.com',
                'password' => $defaultPassword,
                'role' => 'walikelas',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 1,
                'name' => 'Nurul Hidayah, S.Psi (Konselor BK)',
                'nama' => 'Nurul Hidayah, S.Psi (Konselor BK)',
                'email' => 'bk@gmail.com',
                'password' => $defaultPassword,
                'role' => 'bk',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 1,
                'name' => 'Hendra Pratama (Staff Tata Usaha)',
                'nama' => 'Hendra Pratama (Staff Tata Usaha)',
                'email' => 'tu@gmail.com',
                'password' => $defaultPassword,
                'role' => 'tu',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 1,
                'name' => 'Fatih (Siswa)',
                'nama' => 'Fatih (Siswa)',
                'email' => 'murid@gmail.com',
                'password' => $defaultPassword,
                'role' => 'murid',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'school_id' => 1,
                'name' => 'Bambang Trianto (Orang Tua / Wali)',
                'nama' => 'Bambang Trianto (Orang Tua / Wali)',
                'email' => 'parent@gmail.com',
                'password' => $defaultPassword,
                'role' => 'parent',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($users as $u) {
            DB::table('users')->updateOrInsert(['email' => $u['email']], $u);
        }

        // 3. Try to copy existing classes and subjects from web_markazlugoh if available
        try {
            $oldPdo = new \PDO('mysql:host=127.0.0.1;dbname=web_markazlugoh', 'root', '');
            
            // Copy classes
            $oldClasses = $oldPdo->query("SELECT * FROM classes")->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($oldClasses as $c) {
                unset($c['id']);
                $c['school_id'] = $c['school_id'] ?: 1;
                $c['created_at'] = $c['created_at'] ?: now();
                $c['updated_at'] = $c['updated_at'] ?: now();
                DB::table('classes')->insertOrIgnore($c);
            }

            // Copy subjects
            $oldSubjects = $oldPdo->query("SELECT * FROM subjects")->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($oldSubjects as $s) {
                unset($s['id']);
                $s['school_id'] = $s['school_id'] ?: 1;
                $s['created_at'] = $s['created_at'] ?: now();
                $s['updated_at'] = $s['updated_at'] ?: now();
                DB::table('subjects')->insertOrIgnore($s);
            }

            // Copy assignments
            $oldAssignments = $oldPdo->query("SELECT * FROM assignments")->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($oldAssignments as $a) {
                unset($a['id']);
                $a['school_id'] = $a['school_id'] ?: 1;
                $a['created_at'] = $a['created_at'] ?: now();
                $a['updated_at'] = $a['updated_at'] ?: now();
                DB::table('assignments')->insertOrIgnore($a);
            }

            // Copy materials
            $oldMaterials = $oldPdo->query("SELECT * FROM materials")->fetchAll(\PDO::FETCH_ASSOC);
            foreach ($oldMaterials as $m) {
                unset($m['id']);
                $m['school_id'] = $m['school_id'] ?: 1;
                $m['created_at'] = $m['created_at'] ?: now();
                $m['updated_at'] = $m['updated_at'] ?: now();
                DB::table('materials')->insertOrIgnore($m);
            }
        } catch (\Throwable $e) {
            // Silently ignore if source db is not accessible
        }

        // If no classes exist yet, create a default sample class and enroll murid
        $classCount = DB::table('classes')->count();
        if ($classCount === 0) {
            $guruUser = DB::table('users')->where('email', 'guru@gmail.com')->first();
            $muridUser = DB::table('users')->where('email', 'murid@gmail.com')->first();

            $classId = DB::table('classes')->insertGetId([
                'school_id' => 1,
                'nama_kelas' => '10 RPL',
                'level' => '10',
                'jurusan' => 'RPL',
                'deskripsi' => 'Kelas X Rekayasa Perangkat Lunak',
                'guru_id' => $guruUser ? $guruUser->id : null,
                'walimurid' => 'Wali Kelas 10 RPL',
                'no_telpon_wali' => '081234567891',
                'nama_km' => 'Ketua Murid 10 RPL',
                'no_telpon_km' => '081234567892',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($muridUser) {
                DB::table('class_user')->insertOrIgnore([
                    'class_id' => $classId,
                    'user_id' => $muridUser->id,
                    'enrolled_at' => now(),
                ]);

                DB::table('users')->where('id', $muridUser->id)->update([
                    'class_id' => $classId,
                    'jenjang' => '10',
                    'jurusan' => 'RPL',
                ]);
            }

            DB::table('subjects')->insertOrIgnore([
                'school_id' => 1,
                'class_id' => $classId,
                'nama_mapel' => 'Bahasa Arab',
                'guru_id' => $guruUser ? $guruUser->id : null,
                'class_level' => '10',
                'jurusan' => 'RPL',
                'deskripsi' => 'Mata pelajaran Bahasa Arab',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // Call Comprehensive School Seeder for all 53 tables
        $this->call(ComprehensiveSchoolSeeder::class);
    }
}
