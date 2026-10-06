<?php

namespace Tests\Feature\Admin;

use App\Models\SchoolSubject;
use App\Models\Teacher;
use App\Models\User;
use Database\Seeders\SchoolSubjectSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\HasAdminUser;
use Tests\TestCase;

class SchoolSubjectTest extends TestCase
{
    use RefreshDatabase, HasAdminUser;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->createAdminUser();
    }

    public function test_seeder_creates_default_subjects_and_teacher_relations(): void
    {
        $this->seed(SchoolSubjectSeeder::class);

        $this->assertDatabaseHas('school_subjects', [
            'name' => 'Pendidikan Pancasila',
            'category' => 'nasional',
            'is_active' => true,
        ]);
        $this->assertDatabaseHas('school_subjects', [
            'name' => 'Maharotul Qiroah',
            'category' => 'keislaman',
        ]);
        $this->assertDatabaseHas('school_subjects', [
            'name' => 'Keislaman dan Kejam’iyyahan',
            'category' => 'keislaman',
        ]);
        $this->assertDatabaseMissing('school_subjects', ['category' => 'kepersisan']);
        $this->assertDatabaseHas('teachers', [
            'name' => 'Safitri, S.Pd.',
        ]);

        $subject = SchoolSubject::where('name', 'Pendidikan Pancasila')->first();
        $this->assertTrue($subject->teachers()->where('name', 'Safitri, S.Pd.')->exists());
    }

    public function test_program_page_shows_subject_section_and_default_subjects(): void
    {
        $this->seed(SchoolSubjectSeeder::class);

        $response = $this->get(route('public.program'));

        $response->assertStatus(200);
        $response->assertSee('Kurikulum &amp; Mata Pelajaran', false);
        $response->assertSee('Mata Pelajaran Nasional');
        $response->assertSee('Keislaman &amp; Al-Qur’an', false);
        $response->assertSee('Pendidikan Pancasila');
        $response->assertSee('Maharotul Qiroah');
        $response->assertSee('Ulumul Qur’an');
        $response->assertSee('Keislaman dan Kejam’iyyahan');
        $response->assertSee('Safitri, S.Pd.');
        $response->assertSee('Rizky Jurnaliska, S.Sos., M.Si.');
        $response->assertDontSee('Kepersisan');
    }

    public function test_program_page_hides_inactive_subjects(): void
    {
        SchoolSubject::create([
            'name' => 'Mapel Nonaktif',
            'category' => 'nasional',
            'description' => 'Tidak tampil.',
            'is_active' => false,
        ]);

        $this->get(route('public.program'))
            ->assertStatus(200)
            ->assertDontSee('Mapel Nonaktif');
    }

    public function test_guest_cannot_access_admin_subjects_index(): void
    {
        $this->get(route('admin.website.subjects.index'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_access_subjects_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.website.subjects.index'))
            ->assertStatus(200)
            ->assertSee('Mata Pelajaran');
    }

    public function test_admin_can_create_subject_with_teacher_relation(): void
    {
        $teacher = Teacher::create(['name' => 'Guru Mapel']);

        $this->actingAs($this->admin)
            ->post(route('admin.website.subjects.store'), [
                'name' => 'Geografi',
                'category' => 'nasional',
                'description' => 'Deskripsi geografi.',
                'sort_order' => 20,
                'is_active' => true,
                'teacher_ids' => [$teacher->id],
            ]);

        $this->assertDatabaseHas('school_subjects', [
            'name' => 'Geografi',
            'category' => 'nasional',
            'is_active' => true,
        ]);

        $subject = SchoolSubject::where('name', 'Geografi')->first();
        $this->assertTrue($subject->teachers()->whereKey($teacher->id)->exists());
    }

    public function test_admin_can_create_keislaman_subject(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.website.subjects.store'), [
                'name' => 'Tahsin',
                'category' => 'keislaman',
                'description' => 'Pembinaan bacaan Al-Qur’an.',
                'sort_order' => 21,
                'is_active' => true,
            ]);

        $this->assertDatabaseHas('school_subjects', [
            'name' => 'Tahsin',
            'category' => 'keislaman',
        ]);
    }

    public function test_admin_can_update_subject_and_teacher_relation(): void
    {
        $oldTeacher = Teacher::create(['name' => 'Guru Lama']);
        $newTeacher = Teacher::create(['name' => 'Guru Baru']);
        $subject = SchoolSubject::create([
            'name' => 'Mapel Lama',
            'category' => 'nasional',
            'sort_order' => 1,
        ]);
        $subject->teachers()->attach($oldTeacher);

        $this->actingAs($this->admin)
            ->put(route('admin.website.subjects.update', $subject), [
                'name' => 'Mapel Baru',
                'category' => 'teknologi',
                'description' => 'Deskripsi baru.',
                'sort_order' => 2,
                'is_active' => true,
                'teacher_ids' => [$newTeacher->id],
            ]);

        $subject->refresh();
        $this->assertEquals('Mapel Baru', $subject->name);
        $this->assertEquals('teknologi', $subject->category);
        $this->assertTrue($subject->teachers()->whereKey($newTeacher->id)->exists());
        $this->assertFalse($subject->teachers()->whereKey($oldTeacher->id)->exists());
    }

    public function test_admin_can_toggle_subject(): void
    {
        $subject = SchoolSubject::create([
            'name' => 'Mapel Toggle',
            'category' => 'boarding',
            'is_active' => false,
        ]);

        $this->actingAs($this->admin)
            ->patch(route('admin.website.subjects.toggle', $subject));

        $this->assertTrue($subject->fresh()->is_active);
    }

    public function test_admin_can_delete_subject(): void
    {
        $subject = SchoolSubject::create([
            'name' => 'Mapel Hapus',
            'category' => 'nasional',
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.website.subjects.destroy', $subject));

        $this->assertDatabaseMissing('school_subjects', ['id' => $subject->id]);
    }

    public function test_admin_sidebar_has_subjects_link(): void
    {
        $this->actingAs($this->admin)
            ->get(route('dashboard'))
            ->assertStatus(200)
            ->assertSee('Mata Pelajaran')
            ->assertSee(route('admin.website.subjects.index'));
    }
}
