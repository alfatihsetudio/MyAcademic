<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('lesson_schedule_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('day', ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);
            $table->time('start_time');
            $table->time('end_time');
            $table->enum('type', ['pelajaran', 'istirahat', 'ishoma', 'upacara', 'pembiasaan', 'kegiatan_khusus'])->default('pelajaran');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['day', 'start_time', 'end_time']);
        });

        $regular = [
            ['name' => 'Jam ke-1', 'day' => 'Senin', 'start_time' => '07:15', 'end_time' => '07:55', 'type' => 'pelajaran', 'sort_order' => 1],
            ['name' => 'Jam ke-2', 'day' => 'Senin', 'start_time' => '07:55', 'end_time' => '08:35', 'type' => 'pelajaran', 'sort_order' => 2],
            ['name' => 'Jam ke-3', 'day' => 'Senin', 'start_time' => '08:35', 'end_time' => '09:15', 'type' => 'pelajaran', 'sort_order' => 3],
            ['name' => 'Jam ke-4', 'day' => 'Senin', 'start_time' => '09:15', 'end_time' => '09:55', 'type' => 'pelajaran', 'sort_order' => 4],
            ['name' => 'Istirahat', 'day' => 'Senin', 'start_time' => '09:55', 'end_time' => '10:25', 'type' => 'istirahat', 'sort_order' => 5],
            ['name' => 'Jam ke-5', 'day' => 'Senin', 'start_time' => '10:25', 'end_time' => '11:05', 'type' => 'pelajaran', 'sort_order' => 6],
            ['name' => 'Jam ke-6', 'day' => 'Senin', 'start_time' => '11:05', 'end_time' => '11:45', 'type' => 'pelajaran', 'sort_order' => 7],
            ['name' => 'Ishoma', 'day' => 'Senin', 'start_time' => '11:45', 'end_time' => '12:30', 'type' => 'ishoma', 'sort_order' => 8],
            ['name' => 'Jam ke-7', 'day' => 'Senin', 'start_time' => '12:30', 'end_time' => '13:10', 'type' => 'pelajaran', 'sort_order' => 9],
            ['name' => 'Jam ke-8', 'day' => 'Senin', 'start_time' => '13:10', 'end_time' => '13:50', 'type' => 'pelajaran', 'sort_order' => 10],
            ['name' => 'Jam ke-9', 'day' => 'Senin', 'start_time' => '13:50', 'end_time' => '14:30', 'type' => 'pelajaran', 'sort_order' => 11],
            ['name' => 'Jam ke-10', 'day' => 'Senin', 'start_time' => '14:30', 'end_time' => '15:10', 'type' => 'pelajaran', 'sort_order' => 12],
        ];

        foreach ($regular as $r) {
            DB::table('lesson_schedule_settings')->insert($r);
        }

        foreach (['Selasa', 'Rabu', 'Kamis'] as $d) {
            foreach ($regular as $r) {
                $r['day'] = $d;
                DB::table('lesson_schedule_settings')->insert($r);
            }
        }

        $jumat = [
            ['name' => 'Jam ke-1', 'day' => 'Jumat', 'start_time' => '07:15', 'end_time' => '07:55', 'type' => 'pelajaran', 'sort_order' => 1],
            ['name' => 'Jam ke-2', 'day' => 'Jumat', 'start_time' => '07:55', 'end_time' => '08:35', 'type' => 'pelajaran', 'sort_order' => 2],
            ['name' => 'Jam ke-3', 'day' => 'Jumat', 'start_time' => '08:35', 'end_time' => '09:15', 'type' => 'pelajaran', 'sort_order' => 3],
            ['name' => 'Jam ke-4', 'day' => 'Jumat', 'start_time' => '09:15', 'end_time' => '09:55', 'type' => 'pelajaran', 'sort_order' => 4],
            ['name' => 'Istirahat', 'day' => 'Jumat', 'start_time' => '09:55', 'end_time' => '10:15', 'type' => 'istirahat', 'sort_order' => 5],
            ['name' => 'Jam ke-5', 'day' => 'Jumat', 'start_time' => '10:15', 'end_time' => '10:55', 'type' => 'pelajaran', 'sort_order' => 6],
            ['name' => 'Jam ke-6', 'day' => 'Jumat', 'start_time' => '10:55', 'end_time' => '11:35', 'type' => 'pelajaran', 'sort_order' => 7],
            ['name' => 'Ishoma', 'day' => 'Jumat', 'start_time' => '11:35', 'end_time' => '12:40', 'type' => 'ishoma', 'sort_order' => 8],
            ['name' => 'Jam ke-7', 'day' => 'Jumat', 'start_time' => '12:40', 'end_time' => '13:20', 'type' => 'pelajaran', 'sort_order' => 9],
            ['name' => 'Jam ke-8', 'day' => 'Jumat', 'start_time' => '13:20', 'end_time' => '14:00', 'type' => 'pelajaran', 'sort_order' => 10],
            ['name' => 'Jam ke-9', 'day' => 'Jumat', 'start_time' => '14:00', 'end_time' => '14:40', 'type' => 'pelajaran', 'sort_order' => 11],
            ['name' => 'Jam ke-10', 'day' => 'Jumat', 'start_time' => '14:40', 'end_time' => '15:20', 'type' => 'pelajaran', 'sort_order' => 12],
        ];

        foreach ($jumat as $r) {
            DB::table('lesson_schedule_settings')->insert($r);
        }

        $sabtu = [
            ['name' => 'Jam ke-1', 'day' => 'Sabtu', 'start_time' => '07:15', 'end_time' => '07:55', 'type' => 'pelajaran', 'sort_order' => 1],
            ['name' => 'Jam ke-2', 'day' => 'Sabtu', 'start_time' => '07:55', 'end_time' => '08:35', 'type' => 'pelajaran', 'sort_order' => 2],
            ['name' => 'Jam ke-3', 'day' => 'Sabtu', 'start_time' => '08:35', 'end_time' => '09:15', 'type' => 'pelajaran', 'sort_order' => 3],
            ['name' => 'Kegiatan Khusus 1', 'day' => 'Sabtu', 'start_time' => '09:15', 'end_time' => '09:55', 'type' => 'kegiatan_khusus', 'sort_order' => 4],
            ['name' => 'Kegiatan Khusus 2', 'day' => 'Sabtu', 'start_time' => '09:55', 'end_time' => '10:35', 'type' => 'kegiatan_khusus', 'sort_order' => 5],
        ];

        foreach ($sabtu as $r) {
            DB::table('lesson_schedule_settings')->insert($r);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('lesson_schedule_settings');
    }
};
