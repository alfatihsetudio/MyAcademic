<?php

namespace Tests\Feature\Admin;

use App\Models\AcademicYear;
use App\Models\LessonSchedule;
use App\Models\LessonScheduleSetting;
use App\Models\Permission;
use App\Models\Role;
use App\Models\SchoolClass;
use App\Models\SchoolSubject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\Concerns\HasAdminUser;
use Tests\TestCase;

class LessonScheduleTest extends TestCase
{
    use RefreshDatabase, HasAdminUser;

    private User $admin;
    private User $nonAdmin;
    private AcademicYear $academicYear;
    private SchoolClass $class;
    private LessonScheduleSetting $pelajaranSlot;
    private LessonScheduleSetting $istirahatSlot;
    private LessonScheduleSetting $kegiatanKhususSlot;
    private SchoolSubject $subject;
    private Teacher $teacher;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->createAdminUser();
        $this->nonAdmin = $this->createNonAdminUser(['role' => 'user']);

        $this->academicYear = AcademicYear::create([
            'name' => '2025/2026',
            'academic_year' => '2025/2026',
            'start_date' => '2025-07-01',
            'end_date' => '2026-06-30',
            'is_current' => true,
        ]);

        $this->class = SchoolClass::create([
            'name' => 'X-A',
            'grade_level' => '10',
            'group' => 'A',
            'is_active' => true,
        ]);

        $this->pelajaranSlot = LessonScheduleSetting::firstOrCreate(
            ['day' => 'Senin', 'start_time' => '07:15', 'end_time' => '07:55'],
            ['name' => 'Jam ke-1', 'type' => 'pelajaran', 'sort_order' => 1, 'is_active' => true]
        );

        $this->istirahatSlot = LessonScheduleSetting::firstOrCreate(
            ['day' => 'Senin', 'start_time' => '09:55', 'end_time' => '10:25'],
            ['name' => 'Istirahat', 'type' => 'istirahat', 'sort_order' => 5, 'is_active' => true]
        );

        $this->kegiatanKhususSlot = LessonScheduleSetting::firstOrCreate(
            ['day' => 'Sabtu', 'start_time' => '09:15', 'end_time' => '09:55'],
            ['name' => 'Kegiatan Khusus 1', 'type' => 'kegiatan_khusus', 'sort_order' => 4, 'is_active' => true]
        );

        $this->subject = SchoolSubject::create([
            'name' => 'Matematika',
            'category' => 'nasional',
            'is_active' => true,
        ]);

        $this->teacher = Teacher::create([
            'name' => 'Budi Guru',
            'is_active' => true,
        ]);
    }

    public function test_guest_cannot_access_index(): void
    {
        $this->get(route('admin.akademik.jadwal-pelajaran.index'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_access_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.akademik.jadwal-pelajaran.index'))
            ->assertStatus(200)
            ->assertSee('Jadwal Pelajaran');
    }

    public function test_non_admin_gets_403_on_create_page(): void
    {
        $this->actingAs($this->nonAdmin)
            ->get(route('admin.akademik.jadwal-pelajaran.create'))
            ->assertStatus(403);
    }

    public function test_non_admin_gets_403_on_store(): void
    {
        $this->actingAs($this->nonAdmin)
            ->post(route('admin.akademik.jadwal-pelajaran.store'), [
                'academic_year_id' => $this->academicYear->id,
                'semester' => 'ganjil',
                'school_class_id' => $this->class->id,
                'day' => 'Senin',
                'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
                'school_subject_id' => $this->subject->id,
                'teacher_id' => $this->teacher->id,
            ])
            ->assertStatus(403);
    }

    public function test_non_admin_gets_403_on_edit_page(): void
    {
        $schedule = LessonSchedule::create([
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Senin',
            'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $this->actingAs($this->nonAdmin)
            ->get(route('admin.akademik.jadwal-pelajaran.edit', $schedule))
            ->assertStatus(403);
    }

    public function test_non_admin_gets_403_on_update(): void
    {
        $schedule = LessonSchedule::create([
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Senin',
            'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $this->actingAs($this->nonAdmin)
            ->put(route('admin.akademik.jadwal-pelajaran.update', $schedule), [
                'academic_year_id' => $this->academicYear->id,
                'semester' => 'genap',
                'school_class_id' => $this->class->id,
                'day' => 'Selasa',
                'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
                'school_subject_id' => $this->subject->id,
                'teacher_id' => $this->teacher->id,
            ])
            ->assertStatus(403);
    }

    public function test_non_admin_gets_403_on_destroy(): void
    {
        $schedule = LessonSchedule::create([
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Senin',
            'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $this->actingAs($this->nonAdmin)
            ->delete(route('admin.akademik.jadwal-pelajaran.destroy', $schedule))
            ->assertStatus(403);
    }

    public function test_admin_can_create_schedule(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.akademik.jadwal-pelajaran.store'), [
                'academic_year_id' => $this->academicYear->id,
                'semester' => 'ganjil',
                'school_class_id' => $this->class->id,
                'day' => 'Senin',
                'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
                'school_subject_id' => $this->subject->id,
                'teacher_id' => $this->teacher->id,
                'room' => 'R. 101',
                'notes' => 'Catatan ujian',
            ]);

        $this->assertDatabaseHas('lesson_schedules', [
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Senin',
            'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
            'room' => 'R. 101',
            'notes' => 'Catatan ujian',
        ]);
    }

    public function test_admin_cannot_create_schedule_on_istirahat_slot(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.akademik.jadwal-pelajaran.store'), [
                'academic_year_id' => $this->academicYear->id,
                'semester' => 'ganjil',
                'school_class_id' => $this->class->id,
                'day' => 'Senin',
                'lesson_schedule_setting_id' => $this->istirahatSlot->id,
                'school_subject_id' => $this->subject->id,
                'teacher_id' => $this->teacher->id,
            ])
            ->assertSessionHasErrors('lesson_schedule_setting_id');

        $this->assertDatabaseMissing('lesson_schedules', [
            'lesson_schedule_setting_id' => $this->istirahatSlot->id,
        ]);
    }

    public function test_admin_can_create_schedule_on_kegiatan_khusus_slot(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.akademik.jadwal-pelajaran.store'), [
                'academic_year_id' => $this->academicYear->id,
                'semester' => 'ganjil',
                'school_class_id' => $this->class->id,
                'day' => 'Sabtu',
                'lesson_schedule_setting_id' => $this->kegiatanKhususSlot->id,
                'school_subject_id' => $this->subject->id,
                'teacher_id' => $this->teacher->id,
                'room' => 'Lapangan',
                'notes' => 'Pramuka',
            ]);

        $this->assertDatabaseHas('lesson_schedules', [
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Sabtu',
            'lesson_schedule_setting_id' => $this->kegiatanKhususSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
            'room' => 'Lapangan',
            'notes' => 'Pramuka',
        ]);
    }

    public function test_collision_detection_same_class_same_slot(): void
    {
        LessonSchedule::create([
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Senin',
            'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $otherSubject = SchoolSubject::create(['name' => 'Fisika', 'category' => 'nasional', 'is_active' => true]);
        $otherTeacher = Teacher::create(['name' => 'Guru Lain', 'is_active' => true]);

        $this->actingAs($this->admin)
            ->post(route('admin.akademik.jadwal-pelajaran.store'), [
                'academic_year_id' => $this->academicYear->id,
                'semester' => 'ganjil',
                'school_class_id' => $this->class->id,
                'day' => 'Senin',
                'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
                'school_subject_id' => $otherSubject->id,
                'teacher_id' => $otherTeacher->id,
            ])
            ->assertSessionHasErrors('collision');
    }

    public function test_admin_can_edit_schedule(): void
    {
        $schedule = LessonSchedule::create([
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Senin',
            'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $this->actingAs($this->admin)
            ->get(route('admin.akademik.jadwal-pelajaran.edit', $schedule))
            ->assertStatus(200)
            ->assertSee('Edit Jadwal');
    }

    public function test_admin_can_update_schedule(): void
    {
        $schedule = LessonSchedule::create([
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Senin',
            'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $otherSubject = SchoolSubject::create(['name' => 'Fisika', 'category' => 'nasional', 'is_active' => true]);

        $this->actingAs($this->admin)
            ->put(route('admin.akademik.jadwal-pelajaran.update', $schedule), [
                'academic_year_id' => $this->academicYear->id,
                'semester' => 'genap',
                'school_class_id' => $this->class->id,
                'day' => 'Selasa',
                'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
                'school_subject_id' => $otherSubject->id,
                'teacher_id' => $this->teacher->id,
                'room' => 'Lab. IPA',
            ]);

        $schedule->refresh();
        $this->assertEquals('genap', $schedule->semester);
        $this->assertEquals('Selasa', $schedule->day);
        $this->assertEquals($otherSubject->id, $schedule->school_subject_id);
        $this->assertEquals('Lab. IPA', $schedule->room);
    }

    public function test_admin_can_delete_schedule(): void
    {
        $schedule = LessonSchedule::create([
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Senin',
            'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.akademik.jadwal-pelajaran.destroy', $schedule));

        $this->assertDatabaseMissing('lesson_schedules', ['id' => $schedule->id]);
    }

    public function test_admin_can_access_create_page(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.akademik.jadwal-pelajaran.create'))
            ->assertStatus(200)
            ->assertSee('Tambah Jadwal');
    }

    public function test_create_page_shows_schedulable_slots(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.akademik.jadwal-pelajaran.create'))
            ->assertStatus(200)
            ->assertSee($this->pelajaranSlot->name)
            ->assertSee($this->kegiatanKhususSlot->name)
            ->assertDontSee($this->istirahatSlot->name);
    }

    public function test_non_admin_can_view_index(): void
    {
        $this->actingAs($this->nonAdmin)
            ->get(route('admin.akademik.jadwal-pelajaran.index'))
            ->assertStatus(403);
    }

    public function test_non_admin_cannot_access_kelas_index(): void
    {
        $this->actingAs($this->nonAdmin)
            ->get(route('admin.akademik.kelas.index'))
            ->assertStatus(403);
    }

    public function test_admin_can_access_kelas_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.akademik.kelas.index'))
            ->assertStatus(200)
            ->assertSee('Kelas');
    }

    public function test_non_admin_cannot_access_jam_pelajaran_index(): void
    {
        $this->actingAs($this->nonAdmin)
            ->get(route('admin.akademik.jam-pelajaran.index'))
            ->assertStatus(403);
    }

    public function test_admin_can_access_jam_pelajaran_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.akademik.jam-pelajaran.index'))
            ->assertStatus(200)
            ->assertSee('Jam Pelajaran');
    }

    private function createRoleWithPermissions(string $roleName, array $permissionNames): User
    {
        $role = Role::firstOrCreate(
            ['name' => $roleName],
            ['display_name' => $roleName, 'is_active' => true, 'is_system' => false]
        );

        foreach ($permissionNames as $permName) {
            $perm = Permission::firstOrCreate(
                ['name' => $permName],
                [
                    'display_name' => $permName,
                    'module' => 'academic',
                    'action' => 'manage',
                    'group_name' => 'AKADEMIK',
                    'is_system' => false,
                    'is_active' => true,
                ]
            );
            $role->permissions()->attach($perm->id);
        }

        $user = User::factory()->create(['role' => 'user']);
        $user->roles()->attach($role->id);
        $user->load('roles.permissions');

        return $user;
    }

    public function test_kurikulum_with_manage_permission_sees_crud_buttons(): void
    {
        $kurikulum = $this->createRoleWithPermissions('kurikulum', [
            'academic.schedule.view',
            'academic.schedule.manage',
        ]);

        LessonSchedule::create([
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Senin',
            'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $response = $this->actingAs($kurikulum)
            ->get(route('admin.akademik.jadwal-pelajaran.index', [
                'academic_year' => $this->academicYear->id,
                'semester' => 'ganjil',
                'class_id' => $this->class->id,
            ]));

        $response->assertOk();
        $html = $response->getContent();
        $this->assertStringContainsString('Tampilkan Jadwal', $html);
        $this->assertStringContainsString('bg-blue-50', $html);
        $this->assertStringContainsString('bg-red-50', $html);
        $this->assertStringContainsString('+ Tambah', $html);
    }

    public function test_view_only_user_does_not_see_crud_buttons(): void
    {
        $viewOnly = $this->createRoleWithPermissions('guru_view', [
            'academic.schedule.view',
        ]);

        $response = $this->actingAs($viewOnly)
            ->get(route('admin.akademik.jadwal-pelajaran.index', [
                'academic_year' => $this->academicYear->id,
                'semester' => 'ganjil',
                'class_id' => $this->class->id,
            ]));

        $response->assertOk();
        $html = $response->getContent();
        $this->assertStringContainsString('Tampilkan Jadwal', $html);
        $this->assertStringNotContainsString('>Edit<', $html);
        $this->assertStringNotContainsString('>Hapus<', $html);
        $this->assertStringNotContainsString('+ Tambah', $html);
    }

    public function test_admin_still_sees_crud_buttons(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.akademik.jadwal-pelajaran.index', [
                'academic_year' => $this->academicYear->id,
                'semester' => 'ganjil',
                'class_id' => $this->class->id,
            ]));

        $response->assertOk();
        $html = $response->getContent();
        $this->assertStringContainsString('Tampilkan Jadwal', $html);
        $this->assertStringContainsString('+ Tambah', $html);
    }

    public function test_view_only_user_gets_403_on_direct_edit_route(): void
    {
        $viewOnly = $this->createRoleWithPermissions('guru_view_direct', [
            'academic.schedule.view',
        ]);

        $schedule = LessonSchedule::create([
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Senin',
            'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $this->actingAs($viewOnly)
            ->get(route('admin.akademik.jadwal-pelajaran.edit', $schedule))
            ->assertStatus(403);
    }

    public function test_kurikulum_with_manage_permission_can_access_edit_route(): void
    {
        $kurikulum = $this->createRoleWithPermissions('kurikulum_edit', [
            'academic.schedule.view',
            'academic.schedule.manage',
        ]);

        $this->assertTrue($kurikulum->hasPermissionTo('academic.schedule.manage'));

        $schedule = LessonSchedule::create([
            'academic_year_id' => $this->academicYear->id,
            'semester' => 'ganjil',
            'school_class_id' => $this->class->id,
            'day' => 'Senin',
            'lesson_schedule_setting_id' => $this->pelajaranSlot->id,
            'school_subject_id' => $this->subject->id,
            'teacher_id' => $this->teacher->id,
        ]);

        $this->actingAs($kurikulum)
            ->get(route('admin.akademik.jadwal-pelajaran.edit', $schedule))
            ->assertStatus(200)
            ->assertSee('Edit Jadwal');
    }
}
