<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\LessonSchedule;
use App\Models\LessonScheduleSetting;
use App\Models\SchoolClass;
use App\Models\SchoolSubject;
use App\Models\Teacher;
use Carbon\Carbon;
use DB;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class LessonSchedule20262027Seeder extends Seeder
{
    private array $slotData;
    private array $scheduleData;
    private array $additionalSubjects;

    public function __construct()
    {
        $this->slotData = [
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
            ['name' => 'Jam ke-1', 'day' => 'Selasa', 'start_time' => '07:15', 'end_time' => '07:55', 'type' => 'pelajaran', 'sort_order' => 1],
            ['name' => 'Jam ke-2', 'day' => 'Selasa', 'start_time' => '07:55', 'end_time' => '08:35', 'type' => 'pelajaran', 'sort_order' => 2],
            ['name' => 'Jam ke-3', 'day' => 'Selasa', 'start_time' => '08:35', 'end_time' => '09:15', 'type' => 'pelajaran', 'sort_order' => 3],
            ['name' => 'Jam ke-4', 'day' => 'Selasa', 'start_time' => '09:15', 'end_time' => '09:55', 'type' => 'pelajaran', 'sort_order' => 4],
            ['name' => 'Istirahat', 'day' => 'Selasa', 'start_time' => '09:55', 'end_time' => '10:25', 'type' => 'istirahat', 'sort_order' => 5],
            ['name' => 'Jam ke-5', 'day' => 'Selasa', 'start_time' => '10:25', 'end_time' => '11:05', 'type' => 'pelajaran', 'sort_order' => 6],
            ['name' => 'Jam ke-6', 'day' => 'Selasa', 'start_time' => '11:05', 'end_time' => '11:45', 'type' => 'pelajaran', 'sort_order' => 7],
            ['name' => 'Ishoma', 'day' => 'Selasa', 'start_time' => '11:45', 'end_time' => '12:30', 'type' => 'ishoma', 'sort_order' => 8],
            ['name' => 'Jam ke-7', 'day' => 'Selasa', 'start_time' => '12:30', 'end_time' => '13:10', 'type' => 'pelajaran', 'sort_order' => 9],
            ['name' => 'Jam ke-8', 'day' => 'Selasa', 'start_time' => '13:10', 'end_time' => '13:50', 'type' => 'pelajaran', 'sort_order' => 10],
            ['name' => 'Jam ke-9', 'day' => 'Selasa', 'start_time' => '13:50', 'end_time' => '14:30', 'type' => 'pelajaran', 'sort_order' => 11],
            ['name' => 'Jam ke-10', 'day' => 'Selasa', 'start_time' => '14:30', 'end_time' => '15:10', 'type' => 'pelajaran', 'sort_order' => 12],
            ['name' => 'Jam ke-1', 'day' => 'Rabu', 'start_time' => '07:15', 'end_time' => '07:55', 'type' => 'pelajaran', 'sort_order' => 1],
            ['name' => 'Jam ke-2', 'day' => 'Rabu', 'start_time' => '07:55', 'end_time' => '08:35', 'type' => 'pelajaran', 'sort_order' => 2],
            ['name' => 'Jam ke-3', 'day' => 'Rabu', 'start_time' => '08:35', 'end_time' => '09:15', 'type' => 'pelajaran', 'sort_order' => 3],
            ['name' => 'Jam ke-4', 'day' => 'Rabu', 'start_time' => '09:15', 'end_time' => '09:55', 'type' => 'pelajaran', 'sort_order' => 4],
            ['name' => 'Istirahat', 'day' => 'Rabu', 'start_time' => '09:55', 'end_time' => '10:25', 'type' => 'istirahat', 'sort_order' => 5],
            ['name' => 'Jam ke-5', 'day' => 'Rabu', 'start_time' => '10:25', 'end_time' => '11:05', 'type' => 'pelajaran', 'sort_order' => 6],
            ['name' => 'Jam ke-6', 'day' => 'Rabu', 'start_time' => '11:05', 'end_time' => '11:45', 'type' => 'pelajaran', 'sort_order' => 7],
            ['name' => 'Ishoma', 'day' => 'Rabu', 'start_time' => '11:45', 'end_time' => '12:30', 'type' => 'ishoma', 'sort_order' => 8],
            ['name' => 'Jam ke-7', 'day' => 'Rabu', 'start_time' => '12:30', 'end_time' => '13:10', 'type' => 'pelajaran', 'sort_order' => 9],
            ['name' => 'Jam ke-8', 'day' => 'Rabu', 'start_time' => '13:10', 'end_time' => '13:50', 'type' => 'pelajaran', 'sort_order' => 10],
            ['name' => 'Jam ke-9', 'day' => 'Rabu', 'start_time' => '13:50', 'end_time' => '14:30', 'type' => 'pelajaran', 'sort_order' => 11],
            ['name' => 'Jam ke-10', 'day' => 'Rabu', 'start_time' => '14:30', 'end_time' => '15:10', 'type' => 'pelajaran', 'sort_order' => 12],
            ['name' => 'Jam ke-1', 'day' => 'Kamis', 'start_time' => '07:15', 'end_time' => '07:55', 'type' => 'pelajaran', 'sort_order' => 1],
            ['name' => 'Jam ke-2', 'day' => 'Kamis', 'start_time' => '07:55', 'end_time' => '08:35', 'type' => 'pelajaran', 'sort_order' => 2],
            ['name' => 'Jam ke-3', 'day' => 'Kamis', 'start_time' => '08:35', 'end_time' => '09:15', 'type' => 'pelajaran', 'sort_order' => 3],
            ['name' => 'Jam ke-4', 'day' => 'Kamis', 'start_time' => '09:15', 'end_time' => '09:55', 'type' => 'pelajaran', 'sort_order' => 4],
            ['name' => 'Istirahat', 'day' => 'Kamis', 'start_time' => '09:55', 'end_time' => '10:25', 'type' => 'istirahat', 'sort_order' => 5],
            ['name' => 'Jam ke-5', 'day' => 'Kamis', 'start_time' => '10:25', 'end_time' => '11:05', 'type' => 'pelajaran', 'sort_order' => 6],
            ['name' => 'Jam ke-6', 'day' => 'Kamis', 'start_time' => '11:05', 'end_time' => '11:45', 'type' => 'pelajaran', 'sort_order' => 7],
            ['name' => 'Ishoma', 'day' => 'Kamis', 'start_time' => '11:45', 'end_time' => '12:30', 'type' => 'ishoma', 'sort_order' => 8],
            ['name' => 'Jam ke-7', 'day' => 'Kamis', 'start_time' => '12:30', 'end_time' => '13:10', 'type' => 'pelajaran', 'sort_order' => 9],
            ['name' => 'Jam ke-8', 'day' => 'Kamis', 'start_time' => '13:10', 'end_time' => '13:50', 'type' => 'pelajaran', 'sort_order' => 10],
            ['name' => 'Jam ke-9', 'day' => 'Kamis', 'start_time' => '13:50', 'end_time' => '14:30', 'type' => 'pelajaran', 'sort_order' => 11],
            ['name' => 'Jam ke-10', 'day' => 'Kamis', 'start_time' => '14:30', 'end_time' => '15:10', 'type' => 'pelajaran', 'sort_order' => 12],
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
            ['name' => 'Jam ke-1', 'day' => 'Sabtu', 'start_time' => '07:15', 'end_time' => '07:55', 'type' => 'pelajaran', 'sort_order' => 1],
            ['name' => 'Jam ke-2', 'day' => 'Sabtu', 'start_time' => '07:55', 'end_time' => '08:35', 'type' => 'pelajaran', 'sort_order' => 2],
            ['name' => 'Jam ke-3', 'day' => 'Sabtu', 'start_time' => '08:35', 'end_time' => '09:15', 'type' => 'pelajaran', 'sort_order' => 3],
            ['name' => 'Kegiatan Khusus 1', 'day' => 'Sabtu', 'start_time' => '09:15', 'end_time' => '09:55', 'type' => 'kegiatan_khusus', 'sort_order' => 4],
            ['name' => 'Kegiatan Khusus 2', 'day' => 'Sabtu', 'start_time' => '09:55', 'end_time' => '10:35', 'type' => 'kegiatan_khusus', 'sort_order' => 5],
        ];

        $this->additionalSubjects = [
            'Pendidikan Agama dan Budi Pekerti',
            'Geografi',
            'Seni Budaya dan Prakarya',
            'Koding dan Kecerdasan Artifisial',
            'Mulok',
            'Tafsir',
            'Tahsin Tahfidz',
            'Hadits',
            'Syariah',
            'Aqidah',
            'Akhlak',
            'Tarikh Islam',
            'Bahasa Arab',
            'Kepersisan',
            'Pramuka',
        ];

        $this->scheduleData = [
            // Senin (10)
            ['day' => 'Senin', 'slot_name' => 'Jam ke-1', 'subject' => 'Pendidikan Pancasila', 'teacher' => 'Safitri, S.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Senin', 'slot_name' => 'Jam ke-2', 'subject' => 'Pendidikan Pancasila', 'teacher' => 'Safitri, S.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Senin', 'slot_name' => 'Jam ke-3', 'subject' => 'Bahasa Indonesia', 'teacher' => 'Iqbal Fuadi, M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Senin', 'slot_name' => 'Jam ke-4', 'subject' => 'Bahasa Indonesia', 'teacher' => 'Iqbal Fuadi, M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Senin', 'slot_name' => 'Jam ke-5', 'subject' => 'Bahasa Indonesia', 'teacher' => 'Iqbal Fuadi, M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Senin', 'slot_name' => 'Jam ke-6', 'subject' => 'Syariah', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Senin', 'slot_name' => 'Jam ke-7', 'subject' => 'Syariah', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Senin', 'slot_name' => 'Jam ke-8', 'subject' => 'Matematika', 'teacher' => 'Alvia Qurotunnisa Ayunnisa Sholihah, M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Senin', 'slot_name' => 'Jam ke-9', 'subject' => 'Matematika', 'teacher' => 'Alvia Qurotunnisa Ayunnisa Sholihah, M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Senin', 'slot_name' => 'Jam ke-10', 'subject' => 'Matematika', 'teacher' => 'Alvia Qurotunnisa Ayunnisa Sholihah, M.Pd.', 'room' => null, 'notes' => null],
            // Selasa (10)
            ['day' => 'Selasa', 'slot_name' => 'Jam ke-1', 'subject' => 'Biologi', 'teacher' => 'Diana Nurazis, S.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Selasa', 'slot_name' => 'Jam ke-2', 'subject' => 'Biologi', 'teacher' => 'Diana Nurazis, S.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Selasa', 'slot_name' => 'Jam ke-3', 'subject' => 'Tafsir', 'teacher' => 'Rizky Jurnaliska, S.Sos., M.Si.', 'room' => null, 'notes' => null],
            ['day' => 'Selasa', 'slot_name' => 'Jam ke-4', 'subject' => 'Tafsir', 'teacher' => 'Rizky Jurnaliska, S.Sos., M.Si.', 'room' => null, 'notes' => null],
            ['day' => 'Selasa', 'slot_name' => 'Jam ke-5', 'subject' => 'Geografi', 'teacher' => 'Dr. Atang Soeryana, M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Selasa', 'slot_name' => 'Jam ke-6', 'subject' => 'Geografi', 'teacher' => 'Dr. Atang Soeryana, M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Selasa', 'slot_name' => 'Jam ke-7', 'subject' => 'Informatika', 'teacher' => 'Ahmad Sayuti, S.Kom', 'room' => null, 'notes' => null],
            ['day' => 'Selasa', 'slot_name' => 'Jam ke-8', 'subject' => 'Informatika', 'teacher' => 'Ahmad Sayuti, S.Kom', 'room' => null, 'notes' => null],
            ['day' => 'Selasa', 'slot_name' => 'Jam ke-9', 'subject' => 'Hadits', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Selasa', 'slot_name' => 'Jam ke-10', 'subject' => 'Hadits', 'teacher' => null, 'room' => null, 'notes' => null],
            // Rabu (10)
            ['day' => 'Rabu', 'slot_name' => 'Jam ke-1', 'subject' => 'Pendidikan Agama dan Budi Pekerti', 'teacher' => 'M. Rafly Majid, Lc', 'room' => null, 'notes' => null],
            ['day' => 'Rabu', 'slot_name' => 'Jam ke-2', 'subject' => 'Pendidikan Agama dan Budi Pekerti', 'teacher' => 'M. Rafly Majid, Lc', 'room' => null, 'notes' => null],
            ['day' => 'Rabu', 'slot_name' => 'Jam ke-3', 'subject' => 'Kimia', 'teacher' => 'Fina Sabrina', 'room' => null, 'notes' => null],
            ['day' => 'Rabu', 'slot_name' => 'Jam ke-4', 'subject' => 'Kimia', 'teacher' => 'Fina Sabrina', 'room' => null, 'notes' => null],
            ['day' => 'Rabu', 'slot_name' => 'Jam ke-5', 'subject' => 'Sejarah', 'teacher' => 'Dr. Juariah, M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Rabu', 'slot_name' => 'Jam ke-6', 'subject' => 'Sejarah', 'teacher' => 'Dr. Juariah, M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Rabu', 'slot_name' => 'Jam ke-7', 'subject' => 'Ekonomi', 'teacher' => 'Hayatuddin Fikri, S.E.', 'room' => null, 'notes' => null],
            ['day' => 'Rabu', 'slot_name' => 'Jam ke-8', 'subject' => 'Ekonomi', 'teacher' => 'Hayatuddin Fikri, S.E.', 'room' => null, 'notes' => null],
            ['day' => 'Rabu', 'slot_name' => 'Jam ke-9', 'subject' => 'Tarikh Islam', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Rabu', 'slot_name' => 'Jam ke-10', 'subject' => 'Tarikh Islam', 'teacher' => null, 'room' => null, 'notes' => null],
            // Kamis (10)
            ['day' => 'Kamis', 'slot_name' => 'Jam ke-1', 'subject' => 'Bahasa Inggris', 'teacher' => 'Rizdki Elang Gumelar, M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Kamis', 'slot_name' => 'Jam ke-2', 'subject' => 'Bahasa Inggris', 'teacher' => 'Rizdki Elang Gumelar, M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Kamis', 'slot_name' => 'Jam ke-3', 'subject' => 'Fisika', 'teacher' => 'Widda Taslimah Alfani, S.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Kamis', 'slot_name' => 'Jam ke-4', 'subject' => 'Fisika', 'teacher' => 'Widda Taslimah Alfani, S.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Kamis', 'slot_name' => 'Jam ke-5', 'subject' => 'Koding dan Kecerdasan Artifisial', 'teacher' => 'Ahmad Sayuti, S.Kom', 'room' => null, 'notes' => null],
            ['day' => 'Kamis', 'slot_name' => 'Jam ke-6', 'subject' => 'Koding dan Kecerdasan Artifisial', 'teacher' => 'Ahmad Sayuti, S.Kom', 'room' => null, 'notes' => null],
            ['day' => 'Kamis', 'slot_name' => 'Jam ke-7', 'subject' => 'Aqidah', 'teacher' => 'Safrudin, S.Pd.I.,M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Kamis', 'slot_name' => 'Jam ke-8', 'subject' => 'Akhlak', 'teacher' => 'Safrudin, S.Pd.I.,M.Pd.', 'room' => null, 'notes' => null],
            ['day' => 'Kamis', 'slot_name' => 'Jam ke-9', 'subject' => 'PJOK', 'teacher' => 'Aip Saipul Mikdar', 'room' => null, 'notes' => null],
            ['day' => 'Kamis', 'slot_name' => 'Jam ke-10', 'subject' => 'PJOK', 'teacher' => 'Aip Saipul Mikdar', 'room' => null, 'notes' => null],
            // Jumat (10)
            ['day' => 'Jumat', 'slot_name' => 'Jam ke-1', 'subject' => 'Bahasa Arab', 'teacher' => 'M. Rafly Majid, Lc', 'room' => null, 'notes' => null],
            ['day' => 'Jumat', 'slot_name' => 'Jam ke-2', 'subject' => 'Bahasa Arab', 'teacher' => 'M. Rafly Majid, Lc', 'room' => null, 'notes' => null],
            ['day' => 'Jumat', 'slot_name' => 'Jam ke-3', 'subject' => 'Kepersisan', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Jumat', 'slot_name' => 'Jam ke-4', 'subject' => 'Kepersisan', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Jumat', 'slot_name' => 'Jam ke-5', 'subject' => 'Sosiologi', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Jumat', 'slot_name' => 'Jam ke-6', 'subject' => 'Sosiologi', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Jumat', 'slot_name' => 'Jam ke-7', 'subject' => 'Seni Budaya dan Prakarya', 'teacher' => 'Mahfudin, S.Sn.', 'room' => null, 'notes' => null],
            ['day' => 'Jumat', 'slot_name' => 'Jam ke-8', 'subject' => 'Seni Budaya dan Prakarya', 'teacher' => 'Mahfudin, S.Sn.', 'room' => null, 'notes' => null],
            ['day' => 'Jumat', 'slot_name' => 'Jam ke-9', 'subject' => 'Mulok', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Jumat', 'slot_name' => 'Jam ke-10', 'subject' => 'Mulok', 'teacher' => null, 'room' => null, 'notes' => null],
            // Sabtu (5)
            ['day' => 'Sabtu', 'slot_name' => 'Jam ke-1', 'subject' => 'Tahsin Tahfidz', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Sabtu', 'slot_name' => 'Jam ke-2', 'subject' => 'Tahsin Tahfidz', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Sabtu', 'slot_name' => 'Jam ke-3', 'subject' => 'Tahsin Tahfidz', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Sabtu', 'slot_name' => 'Kegiatan Khusus 1', 'subject' => 'Pramuka', 'teacher' => null, 'room' => null, 'notes' => null],
            ['day' => 'Sabtu', 'slot_name' => 'Kegiatan Khusus 2', 'subject' => 'Pramuka', 'teacher' => null, 'room' => null, 'notes' => null],
        ];
    }

    public function run(): void
    {
        DB::transaction(function () {
            // A. Academic Year
            $academicYear = AcademicYear::where('academic_year', '2026/2027')->first();
            if (!$academicYear) {
                $academicYear = AcademicYear::create([
                    'name' => '2026/2027',
                    'academic_year' => '2026/2027',
                    'start_date' => '2026-07-01',
                    'end_date' => '2027-06-30',
                    'odd_semester_start_date' => '2026-07-01',
                    'odd_semester_end_date' => '2026-12-31',
                    'even_semester_start_date' => '2027-01-01',
                    'even_semester_end_date' => '2027-06-30',
                    'is_current' => true,
                    'description' => 'Tahun Ajaran 2026/2027',
                ]);
            } else {
                $academicYear->update(['is_current' => true]);
            }

            // B. School Class
            $class = SchoolClass::where('name', 'Kelas X')->first();
            if (!$class) {
                $class = SchoolClass::create([
                    'name' => 'Kelas X',
                    'grade_level' => 10,
                    'group' => null,
                    'sort_order' => 1,
                    'is_active' => true,
                ]);
            }

            // C. Lesson Schedule Settings (65 slots)
            foreach ($this->slotData as $slot) {
                LessonScheduleSetting::updateOrCreate(
                    [
                        'day' => $slot['day'],
                        'start_time' => $slot['start_time'],
                        'end_time' => $slot['end_time'],
                    ],
                    [
                        'name' => $slot['name'],
                        'type' => $slot['type'],
                        'sort_order' => $slot['sort_order'],
                        'is_active' => true,
                    ]
                );
            }

            // D. Additional Subjects (only if not exist, with normalization)
            $existingSubjects = SchoolSubject::all();
            foreach ($this->additionalSubjects as $subjectName) {
                $normalized = $this->normalizeSubjectName($subjectName);
                $found = $existingSubjects->first(function ($subj) use ($normalized) {
                    return $this->normalizeSubjectName($subj->name) === $normalized;
                });
                if (!$found) {
                    $created = SchoolSubject::create([
                        'name' => $subjectName,
                        'category' => $this->inferSubjectCategory($subjectName),
                        'is_active' => true,
                    ]);
                    $existingSubjects->push($created);
                }
            }

            // Refresh subject lookup
            $subjectLookup = [];
            foreach (SchoolSubject::all() as $subj) {
                $subjectLookup[$this->normalizeSubjectName($subj->name)] = $subj;
            }

            // E. Teacher matching
            $allTeachers = Teacher::all();
            $teacherCache = [];
            $problematicTeachers = [];

            foreach ($this->scheduleData as $sched) {
                $teacherName = $sched['teacher'];
                if ($teacherName === null) {
                    continue;
                }
                if (isset($teacherCache[$teacherName])) {
                    continue;
                }

                $matched = $this->findTeacher($teacherName, $allTeachers);
                if ($matched === null) {
                    $problematicTeachers[] = $teacherName;
                } else {
                    $teacherCache[$teacherName] = $matched;
                }
            }

            if (!empty($problematicTeachers)) {
                throw new \RuntimeException(
                    "Guru berikut tidak ditemukan atau ambigu:\n" .
                    implode("\n", array_unique($problematicTeachers)) . "\n\n" .
                    "Seeder dihentikan. Tambahkan guru yang diperlukan ke database terlebih dahulu."
                );
            }

            // F. Lesson Schedules (55)
            foreach ($this->scheduleData as $sched) {
                $setting = LessonScheduleSetting::where('day', $sched['day'])
                    ->where('start_time', $this->getSlotTime($sched['day'], $sched['slot_name'], 'start'))
                    ->where('end_time', $this->getSlotTime($sched['day'], $sched['slot_name'], 'end'))
                    ->first();

                $subjectNorm = $this->normalizeSubjectName($sched['subject']);
                $subject = $subjectLookup[$subjectNorm] ?? null;

                $teacherId = null;
                if ($sched['teacher'] !== null && isset($teacherCache[$sched['teacher']])) {
                    $teacherId = $teacherCache[$sched['teacher']]->id;
                }

                if (!$setting) {
                    throw new \RuntimeException(
                        "Slot jadwal tidak ditemukan: {$sched['day']} - {$sched['slot_name']}. " .
                        "Periksa data lesson_schedule_settings."
                    );
                }

                if (!$subject) {
                    throw new \RuntimeException(
                        "Mata pelajaran tidak ditemukan: {$sched['subject']}. " .
                        "Seeder dihentikan."
                    );
                }

                LessonSchedule::updateOrCreate(
                    [
                        'academic_year_id' => $academicYear->id,
                        'semester' => 'ganjil',
                        'school_class_id' => $class->id,
                        'day' => $sched['day'],
                        'lesson_schedule_setting_id' => $setting->id,
                    ],
                    [
                        'school_subject_id' => $subject->id,
                        'teacher_id' => $teacherId,
                        'room' => $sched['room'],
                        'notes' => $sched['notes'],
                    ]
                );
            }

            // H. Verification
            $this->verify($academicYear, $class);
        });
    }

    private function verify(AcademicYear $academicYear, SchoolClass $class): void
    {
        $ayCount = AcademicYear::where('academic_year', '2026/2027')->count();
        $classCount = SchoolClass::where('name', 'Kelas X')->count();
        $slotsCount = LessonScheduleSetting::where('is_active', true)->count();
        $jadwalTotal = LessonSchedule::where('academic_year_id', $academicYear->id)
            ->where('semester', 'ganjil')
            ->where('school_class_id', $class->id)
            ->count();

        $jadwalByDay = LessonSchedule::where('academic_year_id', $academicYear->id)
            ->where('semester', 'ganjil')
            ->where('school_class_id', $class->id)
            ->selectRaw('day, count(*) as cnt')
            ->groupBy('day')
            ->pluck('cnt', 'day');

        $withTeacher = LessonSchedule::where('academic_year_id', $academicYear->id)
            ->where('semester', 'ganjil')
            ->where('school_class_id', $class->id)
            ->whereNotNull('teacher_id')
            ->count();

        $withoutTeacher = LessonSchedule::where('academic_year_id', $academicYear->id)
            ->where('semester', 'ganjil')
            ->where('school_class_id', $class->id)
            ->whereNull('teacher_id')
            ->count();

        $pramukaCount = LessonSchedule::where('academic_year_id', $academicYear->id)
            ->where('semester', 'ganjil')
            ->where('school_class_id', $class->id)
            ->whereHas('schoolSubject', function ($q) {
                $q->where('name', 'Pramuka');
            })->count();

        $dupCheck = LessonSchedule::where('academic_year_id', $academicYear->id)
            ->where('semester', 'ganjil')
            ->where('school_class_id', $class->id)
            ->selectRaw('count(*) - count(distinct concat(academic_year_id, semester, school_class_id, day, lesson_schedule_setting_id)) as duplikat')
            ->first();

        $duplicates = (int) ($dupCheck->duplikat ?? 0);

        $expected = [
            'Tahun Ajaran 2026/2027' => [1, $ayCount],
            'Kelas X' => [1, $classCount],
            'slot jam aktif' => [65, $slotsCount],
            'jadwal total' => [55, $jadwalTotal],
            'Senin' => [10, (int) ($jadwalByDay['Senin'] ?? 0)],
            'Selasa' => [10, (int) ($jadwalByDay['Selasa'] ?? 0)],
            'Rabu' => [10, (int) ($jadwalByDay['Rabu'] ?? 0)],
            'Kamis' => [10, (int) ($jadwalByDay['Kamis'] ?? 0)],
            'Jumat' => [10, (int) ($jadwalByDay['Jumat'] ?? 0)],
            'Sabtu' => [5, (int) ($jadwalByDay['Sabtu'] ?? 0)],
            'dengan guru' => [38, $withTeacher],
            'tanpa guru' => [17, $withoutTeacher],
            'Pramuka' => [2, $pramukaCount],
            'duplikat slot jadwal' => [0, $duplicates],
        ];

        $errors = [];
        foreach ($expected as $label => [$expectedVal, $actualVal]) {
            if ($expectedVal !== $actualVal) {
                $errors[] = "{$label}: expected {$expectedVal}, got {$actualVal}";
            }
        }

        if (!empty($errors)) {
            throw new \RuntimeException(
                "Verifikasi gagal:\n" . implode("\n", $errors)
            );
        }

        $this->command?->info('✅ Verifikasi berhasil: Semua jumlah sesuai.');
    }

    private function findTeacher(string $name, $allTeachers): ?Teacher
    {
        // 1. Exact match
        $exact = $allTeachers->firstWhere('name', $name);
        if ($exact) {
            return $exact;
        }

        // 2. Normalized match (remove titles, normalize punctuation/spaces)
        $normalized = $this->normalizeTeacherName($name);
        foreach ($allTeachers as $teacher) {
            $teacherNorm = $this->normalizeTeacherName($teacher->name);
            if ($teacherNorm === $normalized) {
                return $teacher;
            }
        }

        return null;
    }

    private function normalizeTeacherName(string $name): string
    {
        // Remove common titles
        $name = preg_replace('/^(Dr\.|Drs\.|H\.|Hj\.|Ust\.|Ustadz|Ustadzah)\s+/i', '', $name);
        $name = preg_replace('/,\s*(S\.\w+|S\.\w+\.\w+|Lc|M\.\w+|M\.\w+\.\w+|SH|S\.Sos|S\.Sn|S\.Kom|S\.Pd|S\.Pd\.I|S\.Pd\.I\.)/i', '', $name);
        // Remove remaining commas, normalize whitespace
        $name = str_replace([',', '.'], ' ', $name);
        $name = preg_replace('/\s+/', ' ', $name);
        $name = trim($name);
        return mb_strtolower($name);
    }

    private function normalizeSubjectName(string $name): string
    {
        $name = preg_replace('/[\'\\x{2019}\\x{02BB}\\x{02BC}\\x{02BE}]/u', '', $name);
        $name = preg_replace('/[^\p{L}\p{N}\s\-]/u', '', $name);
        $name = preg_replace('/\s+/', ' ', $name);
        return mb_strtolower(trim($name));
    }

    private function inferSubjectCategory(string $name): string
    {
        $keislaman = [
            'Pendidikan Agama dan Budi Pekerti', 'Tafsir', 'Tahsin Tahfidz', 'Hadits',
            'Syariah', 'Aqidah', 'Akhlak', 'Tarikh Islam', 'Bahasa Arab',
        ];
        $teknologi = ['Koding dan Kecerdasan Artifisial'];
        $boarding = ['Kepersisan', 'Pramuka', 'Mulok'];

        if (in_array($name, $keislaman)) {
            return 'keislaman';
        }
        if (in_array($name, $teknologi)) {
            return 'teknologi';
        }
        if (in_array($name, $boarding)) {
            return 'boarding';
        }
        return 'nasional';
    }

    private function getSlotTime(string $day, string $slotName, string $part): string
    {
        foreach ($this->slotData as $slot) {
            if ($slot['day'] === $day && $slot['name'] === $slotName) {
                return $slot[$part === 'start' ? 'start_time' : 'end_time'];
            }
        }
        throw new \RuntimeException("Slot not found: {$day} - {$slotName}");
    }
}
