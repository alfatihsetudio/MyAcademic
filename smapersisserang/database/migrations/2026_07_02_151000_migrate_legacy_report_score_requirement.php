<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $ids = DB::table('student_requirement_files as srf_old')
            ->select('srf_old.id')
            ->where('srf_old.requirement_key', 'report_score_semester_1_5')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('student_requirement_files as srf_new')
                    ->whereColumn('srf_new.student_application_id', 'srf_old.student_application_id')
                    ->where('srf_new.requirement_key', 'report_score_semester_1');
            })
            ->pluck('id');

        if ($ids->isNotEmpty()) {
            DB::table('student_requirement_files')
                ->whereIn('id', $ids)
                ->update([
                    'requirement_key' => 'report_score_semester_1',
                    'requirement_label' => 'Nilai Rapor Semester 1',
                ]);
        }
    }

    public function down(): void
    {
        DB::table('student_requirement_files')
            ->where('requirement_key', 'report_score_semester_1')
            ->where('requirement_label', 'Nilai Rapor Semester 1')
            ->update(['requirement_key' => 'report_score_semester_1_5', 'requirement_label' => 'Nilai Rapor Semester 1–5']);
    }
};
