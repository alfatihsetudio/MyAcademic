<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_applications', function (Blueprint $table) {
            // Data Siswa tambahan
            $table->string('nama_panggilan', 100)->nullable()->after('student_name');
            $table->string('nomor_induk_asal', 50)->nullable()->after('nama_panggilan');
            $table->string('nisn', 20)->nullable()->after('nomor_induk_asal');
            $table->string('agama', 20)->nullable()->after('nisn');
            $table->integer('anak_ke')->nullable()->after('agama');
            $table->string('status_anak_dalam_keluarga', 50)->nullable()->after('anak_ke');
            $table->text('alamat_sekolah_asal')->nullable()->after('previous_school');
            $table->string('telepon_siswa', 20)->nullable()->after('address');
            $table->string('diterima_di_kelas', 50)->nullable()->after('telepon_siswa');
            $table->date('tanggal_diterima')->nullable()->after('diterima_di_kelas');
            $table->string('foto_3x4')->nullable()->after('motivation');

            // Data Orang Tua tambahan
            $table->text('alamat_ayah')->nullable()->after('mother_name');
            $table->text('alamat_ibu')->nullable()->after('alamat_ayah');
            $table->string('pekerjaan_ayah', 100)->nullable()->after('parent_job');
            $table->string('pekerjaan_ibu', 100)->nullable()->after('pekerjaan_ayah');
            $table->string('pendidikan_ayah', 100)->nullable()->after('pekerjaan_ibu');
            $table->string('pendidikan_ibu', 100)->nullable()->after('pendidikan_ayah');
            $table->string('penghasilan_ayah', 50)->nullable()->after('pendidikan_ibu');
            $table->string('penghasilan_ibu', 50)->nullable()->after('penghasilan_ayah');

            // Data Wali
            $table->string('nama_ayah_wali', 255)->nullable()->after('penghasilan_ibu');
            $table->string('nama_ibu_wali', 255)->nullable()->after('nama_ayah_wali');
            $table->text('alamat_ayah_wali')->nullable()->after('nama_ibu_wali');
            $table->text('alamat_ibu_wali')->nullable()->after('alamat_ayah_wali');
            $table->string('telepon_wali', 20)->nullable()->after('alamat_ibu_wali');
            $table->string('pekerjaan_ayah_wali', 100)->nullable()->after('telepon_wali');
            $table->string('pekerjaan_ibu_wali', 100)->nullable()->after('pekerjaan_ayah_wali');
            $table->string('pendidikan_ayah_wali', 100)->nullable()->after('pekerjaan_ibu_wali');
            $table->string('pendidikan_ibu_wali', 100)->nullable()->after('pendidikan_ayah_wali');
            $table->string('penghasilan_ayah_wali', 50)->nullable()->after('pendidikan_ibu_wali');
            $table->string('penghasilan_ibu_wali', 50)->nullable()->after('penghasilan_ayah_wali');

            // Status data & token
            $table->enum('status_data', ['belum_lengkap', 'sudah_lengkap', 'perlu_perbaikan'])->default('belum_lengkap')->after('follow_up_by');
            $table->string('update_token', 64)->nullable()->unique()->after('status_data');
            $table->timestamp('updated_by_parent_at')->nullable()->after('update_token');
        });
    }

    public function down(): void
    {
        Schema::table('student_applications', function (Blueprint $table) {
            $table->dropColumn([
                'nama_panggilan', 'nomor_induk_asal', 'nisn', 'agama', 'anak_ke',
                'status_anak_dalam_keluarga', 'alamat_sekolah_asal', 'telepon_siswa',
                'diterima_di_kelas', 'tanggal_diterima', 'foto_3x4',
                'alamat_ayah', 'alamat_ibu', 'pekerjaan_ayah', 'pekerjaan_ibu',
                'pendidikan_ayah', 'pendidikan_ibu', 'penghasilan_ayah', 'penghasilan_ibu',
                'nama_ayah_wali', 'nama_ibu_wali', 'alamat_ayah_wali', 'alamat_ibu_wali',
                'telepon_wali', 'pekerjaan_ayah_wali', 'pekerjaan_ibu_wali',
                'pendidikan_ayah_wali', 'pendidikan_ibu_wali', 'penghasilan_ayah_wali', 'penghasilan_ibu_wali',
                'status_data', 'update_token', 'updated_by_parent_at',
            ]);
        });
    }
};
