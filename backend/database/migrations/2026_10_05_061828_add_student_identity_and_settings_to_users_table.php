<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Tambahkan kolom pendukung MyAcademic Identity & Lifecycle ke tabel users
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'username')) {
                $table->string('username')->nullable()->unique()->after('name');
            }
            if (!Schema::hasColumn('users', 'nisn')) {
                $table->string('nisn', 20)->nullable()->index()->after('username');
            }
            if (!Schema::hasColumn('users', 'birth_date')) {
                $table->date('birth_date')->nullable()->index()->after('nisn');
            }
            if (!Schema::hasColumn('users', 'mother_name')) {
                $table->string('mother_name')->nullable()->after('birth_date');
            }
            if (!Schema::hasColumn('users', 'google_id')) {
                $table->string('google_id')->nullable()->index()->after('email');
            }
            if (!Schema::hasColumn('users', 'google_email')) {
                $table->string('google_email')->nullable()->after('google_id');
            }
            if (!Schema::hasColumn('users', 'lifecycle_status')) {
                // Status: active_student, graduated, alumni, retention_period, archived
                $table->string('lifecycle_status', 30)->default('active_student')->after('role');
            }
            if (!Schema::hasColumn('users', 'subscription_type')) {
                // Subscription: school_sponsored, personal_basic, expired
                $table->string('subscription_type', 30)->default('school_sponsored')->after('lifecycle_status');
            }
            if (!Schema::hasColumn('users', 'retention_expires_at')) {
                $table->timestamp('retention_expires_at')->nullable()->after('subscription_type');
            }
            if (!Schema::hasColumn('users', 'preferred_theme')) {
                // Theme: formal, glass, midnight
                $table->string('preferred_theme', 20)->default('formal')->after('retention_expires_at');
            }
            if (!Schema::hasColumn('users', 'preferred_language')) {
                // Language: id, en, zh, ja, ar
                $table->string('preferred_language', 10)->default('id')->after('preferred_theme');
            }
        });

        // 2. Buat tabel school_memberships untuk riwayat perjalanan pendidikan: SMP -> SMA/SMK -> Kuliah -> Alumni
        if (!Schema::hasTable('school_memberships')) {
            Schema::create('school_memberships', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->foreignId('school_id')->nullable()->constrained('schools')->nullOnDelete();
                $table->string('school_name')->nullable();
                $table->string('stage', 30)->default('smp'); // smp, sma, smk, kuliah, alumni
                $table->string('grade_level', 20)->nullable(); // e.g. Kelas 9, Kelas 12
                $table->string('nis', 30)->nullable();
                $table->string('status', 30)->default('active'); // active, graduated, transferred
                $table->date('start_date')->nullable();
                $table->date('end_date')->nullable();
                $table->string('sponsorship_status', 30)->default('school_sponsored'); // school_sponsored, self_paid
                $table->timestamps();
            });
        }

        // 3. Buat tabel user_sessions untuk Login Session Management
        if (!Schema::hasTable('user_login_sessions')) {
            Schema::create('user_login_sessions', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('session_token', 80)->unique();
                $table->string('device_name')->default('Desktop PC');
                $table->string('platform')->default('Windows 11');
                $table->string('browser')->default('Chrome');
                $table->string('ip_address', 45)->nullable();
                $table->string('approx_location')->nullable()->default('Indonesia');
                $table->boolean('is_current')->default(false);
                $table->timestamp('last_active_at')->nullable();
                $table->timestamps();
            });
        }

        // 4. Buat tabel password_reset_verifications untuk reset email / verifikasi admin
        if (!Schema::hasTable('password_reset_verifications')) {
            Schema::create('password_reset_verifications', function (Blueprint $table) {
                $table->id();
                $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
                $table->string('method', 20); // email, admin_assisted
                $table->string('token', 64)->nullable()->index();
                $table->string('verified_by_admin_id')->nullable();
                $table->text('verification_notes')->nullable();
                $table->boolean('is_used')->default(false);
                $table->timestamp('expires_at')->nullable();
                $table->timestamps();
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_reset_verifications');
        Schema::dropIfExists('user_login_sessions');
        Schema::dropIfExists('school_memberships');

        Schema::table('users', function (Blueprint $table) {
            $cols = [
                'username', 'nisn', 'birth_date', 'mother_name',
                'google_id', 'google_email', 'lifecycle_status',
                'subscription_type', 'retention_expires_at',
                'preferred_theme', 'preferred_language'
            ];
            foreach ($cols as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
