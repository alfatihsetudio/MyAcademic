<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create audit_logs table
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->index()->constrained('users')->cascadeOnDelete();
            $table->foreignId('school_id')->nullable()->index()->constrained('schools')->cascadeOnDelete();
            $table->string('action'); // create, update, delete
            $table->string('model_type');
            $table->unsignedBigInteger('model_id');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamps();
        });

        // 2. Normalize schools table columns (if they are using legacy names)
        if (Schema::hasColumn('schools', 'nama_sekolah')) {
            Schema::table('schools', function (Blueprint $table) {
                $table->renameColumn('nama_sekolah', 'name');
            });
        }
        
        // 3. Normalize users table
        if (Schema::hasColumn('users', 'nama') && Schema::hasColumn('users', 'name')) {
            // Copy data from nama to name if name is empty
            DB::table('users')->whereNull('name')->orWhere('name', '')->update(['name' => DB::raw('nama')]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        
        if (Schema::hasColumn('schools', 'name')) {
            Schema::table('schools', function (Blueprint $table) {
                $table->renameColumn('name', 'nama_sekolah');
            });
        }
    }
};
