<?php

namespace Tests\Feature\Admin;

use App\Models\SchoolSubject;
use App\Models\Teacher;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\Concerns\HasAdminUser;
use Tests\TestCase;

class TeacherTest extends TestCase
{
    use RefreshDatabase, HasAdminUser;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = $this->createAdminUser();
    }

    public function test_guest_can_view_public_teachers_page(): void
    {
        $this->get(route('public.teachers'))
            ->assertStatus(200)
            ->assertSee('Data guru belum tersedia.');
    }

    public function test_teachers_page_shows_hero_section(): void
    {
        $this->get(route('public.teachers'))
            ->assertStatus(200)
            ->assertSee('TENAGA PENDIDIK')
            ->assertSee('Profil Guru')
            ->assertSee('Tenaga pendidik profesional yang berdedikasi tinggi');
    }

    public function test_teachers_page_shows_subject_teacher_and_description(): void
    {
        $teacher = Teacher::create([
            'name' => 'Safitri, S.Pd.',
            'position' => 'Guru Pengampu',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $subject = SchoolSubject::create([
            'name' => 'Pendidikan Pancasila',
            'category' => 'nasional',
            'description' => 'Pembinaan wawasan kebangsaan, tanggung jawab, dan karakter warga negara.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $teacher->subjects()->attach($subject);

        $response = $this->get(route('public.teachers'));

        $response->assertStatus(200);
        $response->assertSee('Guru Berdasarkan Mata Pelajaran');
        $response->assertSee('Pendidikan Pancasila');
        $response->assertSee('Pembinaan wawasan kebangsaan, tanggung jawab, dan karakter warga negara.');
        $response->assertSee('Safitri, S.Pd.');
    }

    public function test_teachers_page_shows_category_as_section_heading_not_inside_card(): void
    {
        $teacher = Teacher::create([
            'name' => 'Safitri, S.Pd.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $subject = SchoolSubject::create([
            'name' => 'Pendidikan Pancasila',
            'category' => 'nasional',
            'description' => 'Pembinaan wawasan kebangsaan.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $teacher->subjects()->attach($subject);

        $content = $this->get(route('public.teachers'))
            ->assertStatus(200)
            ->getContent();

        $this->assertSame(1, substr_count($content, 'Mata Pelajaran Nasional'));
        $this->assertStringContainsString('Mata Pelajaran Nasional', $content);
    }

    public function test_teachers_page_shows_headmaster_as_first_teacher_card(): void
    {
        Teacher::create([
            'name' => 'Guru Urutan Pertama',
            'position' => 'Guru Pengampu',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        Teacher::create([
            'name' => 'Kepala Sekolah Test',
            'position' => 'Kepala Sekolah',
            'is_active' => true,
            'sort_order' => 99,
        ]);

        $content = $this->get(route('public.teachers'))
            ->assertStatus(200)
            ->assertSee('KEPALA SEKOLAH')
            ->assertSee('GURU PENGAMPU')
            ->getContent();

        $this->assertLessThan(
            strpos($content, 'Guru Urutan Pertama'),
            strpos($content, 'Kepala Sekolah Test')
        );
        $this->assertLessThan(
            strpos($content, 'GURU PENGAMPU'),
            strpos($content, 'KEPALA SEKOLAH')
        );
    }

    public function test_teachers_page_shows_teacher_photo_when_available(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Foto',
            'photo_path' => 'school/teachers/guru-foto.jpg',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $subject = SchoolSubject::create([
            'name' => 'Bahasa Indonesia',
            'category' => 'nasional',
            'description' => 'Pembelajaran bahasa dan literasi.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $teacher->subjects()->attach($subject);

        $this->get(route('public.teachers'))
            ->assertStatus(200)
            ->assertSee('/storage/school/teachers/guru-foto.jpg', false)
            ->assertSee('Guru Foto');
    }

    public function test_teachers_page_shows_teacher_name_without_photo_placeholder(): void
    {
        $teacher = Teacher::create([
            'name' => 'Ahmad Fauzi',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $subject = SchoolSubject::create([
            'name' => 'Matematika',
            'category' => 'nasional',
            'description' => 'Melatih logika dan pemecahan masalah.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $teacher->subjects()->attach($subject);

        $response = $this->get(route('public.teachers'));

        $response->assertStatus(200);
        $response->assertSee('Ahmad Fauzi');
        $response->assertSee('Matematika');
        $response->assertDontSee('src="/storage/', false);
    }

    public function test_teachers_page_shows_keislaman_subject(): void
    {
        $teacher = Teacher::create([
            'name' => 'Rizky Jurnaliska, S.Sos., M.Si.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $subject = SchoolSubject::create([
            'name' => 'Maharotul Qiroah',
            'category' => 'keislaman',
            'description' => 'Pembinaan kemampuan membaca dan memahami teks keislaman.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $teacher->subjects()->attach($subject);

        $response = $this->get(route('public.teachers'));

        $response->assertSee('Maharotul Qiroah');
        $response->assertSee('Rizky Jurnaliska, S.Sos., M.Si.');
        $response->assertDontSee('Kepersisan');
    }

    public function test_teachers_page_hides_inactive_subjects(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Aktif',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $subject = SchoolSubject::create([
            'name' => 'Mapel Nonaktif',
            'category' => 'nasional',
            'description' => 'Deskripsi nonaktif.',
            'is_active' => false,
            'sort_order' => 1,
        ]);
        $teacher->subjects()->attach($subject);

        $response = $this->get(route('public.teachers'));

        $response->assertDontSee('Mapel Nonaktif');
        $response->assertDontSee('Deskripsi nonaktif.');
        $response->assertSee('Guru Aktif');
        $response->assertSee('Mapel belum diatur');
    }

    public function test_teachers_page_hides_inactive_teachers_from_subject_teacher_list(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Nonaktif',
            'is_active' => false,
            'sort_order' => 1,
        ]);
        $subject = SchoolSubject::create([
            'name' => 'Biologi',
            'category' => 'nasional',
            'description' => 'Memahami makhluk hidup.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $teacher->subjects()->attach($subject);

        $response = $this->get(route('public.teachers'));

        $response->assertDontSee('Guru Nonaktif');
        $response->assertDontSee('Biologi');
        $response->assertSee('Data guru belum tersedia.');
    }

    public function test_teachers_page_shows_teacher_empty_state(): void
    {
        $this->get(route('public.teachers'))
            ->assertSee('Data guru belum tersedia.');
    }

    public function test_guest_cannot_access_admin_teachers(): void
    {
        $this->get(route('admin.website.teachers.index'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_access_teachers_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.website.teachers.index'))
            ->assertStatus(200);
    }

    public function test_admin_can_create_teacher(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.website.teachers.store'), [
                'name' => 'Drs. H. Ujang',
                'subject' => 'Bahasa Indonesia',
                'position' => 'Wali Kelas XII',
                'description' => 'Guru senior.',
                'sort_order' => 1,
            ]);

        $this->assertDatabaseHas('teachers', [
            'name' => 'Drs. H. Ujang',
            'subject' => 'Bahasa Indonesia',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_update_teacher(): void
    {
        $teacher = Teacher::create([
            'name' => 'Nama Lama',
            'subject' => 'Mapel Lama',
            'sort_order' => 1,
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.teachers.update', $teacher), [
                'name' => 'Nama Baru',
                'subject' => 'Mapel Baru',
                'sort_order' => 2,
            ]);

        $teacher->refresh();
        $this->assertEquals('Nama Baru', $teacher->name);
        $this->assertEquals('Mapel Baru', $teacher->subject);
        $this->assertEquals(2, $teacher->sort_order);
    }

    public function test_admin_can_toggle_teacher(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Toggle',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)
            ->patch(route('admin.website.teachers.toggle', $teacher));

        $teacher->refresh();
        $this->assertFalse($teacher->is_active);
    }

    public function test_admin_can_delete_teacher(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Hapus',
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.website.teachers.destroy', $teacher));

        $this->assertDatabaseMissing('teachers', ['id' => $teacher->id]);
    }

    public function test_admin_can_upload_teacher_photo(): void
    {
        Storage::fake('public');

        $file = UploadedFile::fake()->image('teacher.jpg', 400, 400);

        $this->actingAs($this->admin)
            ->post(route('admin.website.teachers.store'), [
                'name' => 'Guru Foto',
                'subject' => 'Olahraga',
                'photo' => $file,
            ]);

        $teacher = Teacher::where('name', 'Guru Foto')->first();
        $this->assertNotNull($teacher);
        $this->assertNotNull($teacher->photo_path);
        $this->assertStringStartsWith('teachers/', $teacher->photo_path);
        Storage::disk('public')->assertExists($teacher->photo_path);
    }

    public function test_admin_can_store_teacher_quote(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.website.teachers.store'), [
                'name' => 'Guru Dengan Quote',
                'teacher_quote' => 'Moto pendidikan yang menginspirasi.',
            ]);

        $this->assertDatabaseHas('teachers', [
            'name' => 'Guru Dengan Quote',
            'teacher_quote' => 'Moto pendidikan yang menginspirasi.',
        ]);
    }

    public function test_admin_can_update_teacher_quote(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Quote',
            'teacher_quote' => 'Moto lama.',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.teachers.update', $teacher), [
                'name' => 'Guru Quote',
                'teacher_quote' => 'Moto baru yang lebih baik.',
            ]);

        $teacher->refresh();
        $this->assertEquals('Moto baru yang lebih baik.', $teacher->teacher_quote);
    }

    public function test_teachers_page_shows_teacher_quote_from_database(): void
    {
        $teacher = Teacher::create([
            'name' => 'Ust. Rahmat Jaelani',
            'teacher_quote' => 'Moto pendidikan yang menginspirasi.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $subject = SchoolSubject::create([
            'name' => 'Ulumul Hadits',
            'category' => 'keislaman',
            'description' => 'Pengenalan ilmu hadits.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $teacher->subjects()->attach($subject);

        $response = $this->get(route('public.teachers'));

        $response->assertStatus(200);
        $response->assertSee('Moto pendidikan yang menginspirasi.');
        $response->assertSee('Ust. Rahmat Jaelani');
    }

    public function test_teachers_page_hides_quote_section_when_teacher_quote_empty(): void
    {
        $teacher = Teacher::create([
            'name' => 'Ahmad Fauzi',
            'teacher_quote' => null,
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $subject = SchoolSubject::create([
            'name' => 'Matematika',
            'category' => 'nasional',
            'description' => 'Melatih logika.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $teacher->subjects()->attach($subject);

        $response = $this->get(route('public.teachers'));

        $response->assertStatus(200);
        $response->assertSee('Ahmad Fauzi');
        $response->assertDontSee('Pendidikan adalah jalan terbaik untuk menyiapkan masa depan yang berakar pada nilai dan akhlak.');
    }

    public function test_teachers_page_shows_quote_from_first_teacher_with_quote(): void
    {
        $teacher1 = Teacher::create([
            'name' => 'Guru Tanpa Quote',
            'teacher_quote' => null,
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $teacher2 = Teacher::create([
            'name' => 'Guru Dengan Quote',
            'teacher_quote' => 'Belajar adalah investasi masa depan.',
            'is_active' => true,
            'sort_order' => 2,
        ]);
        $subject = SchoolSubject::create([
            'name' => 'Biologi',
            'category' => 'nasional',
            'description' => 'Memahami makhluk hidup.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $teacher1->subjects()->attach($subject);
        $teacher2->subjects()->attach($subject);

        $response = $this->get(route('public.teachers'));

        $response->assertStatus(200);
        $response->assertSee('Belajar adalah investasi masa depan.');
        $response->assertSee('Guru Dengan Quote');
    }

    public function test_admin_can_store_whatsapp_when_creating_teacher(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.website.teachers.store'), [
                'name' => 'Guru Kontak',
                'whatsapp_number' => '081234567891',
            ]);

        $this->assertDatabaseHas('teachers', [
            'name' => 'Guru Kontak',
            'whatsapp_number' => '081234567891',
        ]);
    }

    public function test_admin_can_update_whatsapp(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Update Kontak',
            'whatsapp_number' => '081111111112',
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.teachers.update', $teacher), [
                'name' => 'Guru Update Kontak',
                'whatsapp_number' => '082222222223',
            ]);

        $teacher->refresh();
        $this->assertEquals('082222222223', $teacher->whatsapp_number);
    }

    public function test_admin_create_form_does_not_show_nomor_hp(): void
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.website.teachers.create'));

        $response->assertOk();
        $response->assertDontSee('Nomor HP');
        $response->assertSee('Nomor WhatsApp');
    }

    public function test_admin_edit_form_does_not_show_nomor_hp(): void
    {
        $teacher = Teacher::create(['name' => 'Guru Test']);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.website.teachers.edit', $teacher));

        $response->assertOk();
        $response->assertDontSee('Nomor HP');
        $response->assertSee('Nomor WhatsApp');
    }

    public function test_public_edit_form_does_not_show_nomor_hp(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Publik',
            'public_edit_token' => 'pub-token-12345678901234567890123456789012345678901234567890123456',
            'token_generated_at' => now(),
        ]);

        $response = $this->get(route('public.teachers.edit-token', $teacher->public_edit_token));

        $response->assertOk();
        $response->assertDontSee('Nomor HP');
        $response->assertSee('Nomor WhatsApp');
    }

    public function test_admin_can_generate_public_edit_token(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Token',
        ]);

        $this->actingAs($this->admin)
            ->post(route('admin.website.teachers.generate-token', $teacher));

        $teacher->refresh();
        $this->assertNotNull($teacher->public_edit_token);
        $this->assertNotNull($teacher->token_generated_at);
    }

    public function test_public_edit_token_is_unique_and_not_empty(): void
    {
        $teacher1 = Teacher::create(['name' => 'Guru Satu']);
        $teacher2 = Teacher::create(['name' => 'Guru Dua']);

        $this->actingAs($this->admin)->post(route('admin.website.teachers.generate-token', $teacher1));
        $this->actingAs($this->admin)->post(route('admin.website.teachers.generate-token', $teacher2));

        $teacher1->refresh();
        $teacher2->refresh();

        $this->assertNotNull($teacher1->public_edit_token);
        $this->assertNotNull($teacher2->public_edit_token);
        $this->assertNotEquals($teacher1->public_edit_token, $teacher2->public_edit_token);
        $this->assertEquals(64, strlen($teacher1->public_edit_token));
    }

    public function test_public_edit_token_link_can_be_opened(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Edit',
            'public_edit_token' => 'test-token-123456789012345678901234567890123456789012345678901234567890',
            'token_generated_at' => now(),
        ]);

        $response = $this->get(route('public.teachers.edit-token', $teacher->public_edit_token));

        $response->assertOk();
        $response->assertSee('Edit Data Guru');
        $response->assertSee('Guru Edit');
    }

    public function test_public_edit_token_returns_404_for_invalid_token(): void
    {
        $response = $this->get(route('public.teachers.edit-token', 'invalid-token-123'));

        $response->assertNotFound();
    }

    public function test_teacher_can_update_own_profile_via_token(): void
    {
        $teacher = Teacher::create([
            'name' => 'Nama Lama',
            'description' => 'Deskripsi lama.',
            'teacher_quote' => 'Moto lama.',
            'public_edit_token' => 'token-edit-12345678901234567890123456789012345678901234567890123456',
            'token_generated_at' => now(),
        ]);

        $response = $this->put(route('public.teachers.update-token', $teacher->public_edit_token), [
            'name' => 'Nama Baru',
            'whatsapp_number' => '081234567891',
            'description' => 'Deskripsi baru.',
            'teacher_quote' => 'Moto baru.',
        ]);

        $response->assertSessionHas('success');
        $teacher->refresh();
        $this->assertEquals('Nama Baru', $teacher->name);
        $this->assertEquals('081234567891', $teacher->whatsapp_number);
        $this->assertEquals('Deskripsi baru.', $teacher->description);
        $this->assertEquals('Moto baru.', $teacher->teacher_quote);
    }

    public function test_teacher_cannot_change_is_active_via_public_token(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Aktif',
            'is_active' => false,
            'public_edit_token' => 'token-active-1234567890123456789012345678901234567890123456789012345',
            'token_generated_at' => now(),
        ]);

        $this->put(route('public.teachers.update-token', $teacher->public_edit_token), [
            'name' => 'Guru Aktif',
        ]);

        $teacher->refresh();
        $this->assertFalse($teacher->is_active);
    }

    public function test_public_teachers_page_does_not_show_whatsapp_number(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru WA Test',
            'whatsapp_number' => '081234567890',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $subject = SchoolSubject::create([
            'name' => 'Matematika',
            'category' => 'nasional',
            'description' => 'Mapel tes.',
            'is_active' => true,
            'sort_order' => 1,
        ]);
        $teacher->subjects()->attach($subject);

        $response = $this->get(route('public.teachers'));

        $response->assertOk();
        $response->assertDontSee('081234567890');
    }

    public function test_admin_edit_page_shows_whatsapp_button_when_number_and_token_exist(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru WA Kirim',
            'whatsapp_number' => '081234567890',
            'public_edit_token' => 'wa-token-1234567890123456789012345678901234567890123456789012345678',
            'token_generated_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.website.teachers.edit', $teacher));

        $response->assertOk();
        $response->assertSee('Kirim via WhatsApp');
        $response->assertSee('081234567890', false);
    }

    public function test_edit_page_shows_disabled_wa_when_number_empty(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru No WA',
            'whatsapp_number' => null,
            'public_edit_token' => 'nowa-token-1234567890123456789012345678901234567890123456789012345678',
            'token_generated_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.website.teachers.edit', $teacher));

        $response->assertOk();
        $response->assertSee('Kirim via WhatsApp');
        $response->assertSee('cursor-not-allowed');
    }

    public function test_edit_page_shows_reset_token_button(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Reset',
            'public_edit_token' => 'reset-token-123456789012345678901234567890123456789012345678901234567',
            'token_generated_at' => now(),
        ]);

        $response = $this->actingAs($this->admin)
            ->get(route('admin.website.teachers.edit', $teacher));

        $response->assertOk();
        $response->assertSee('Reset Token');
    }

    public function test_admin_can_reset_token(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Reset Token',
            'public_edit_token' => 'old-token-1234567890123456789012345678901234567890123456789012345678',
            'token_generated_at' => now()->subDay(),
        ]);
        $oldToken = $teacher->public_edit_token;
        $oldTimestamp = $teacher->token_generated_at;

        $this->actingAs($this->admin)
            ->post(route('admin.website.teachers.reset-token', $teacher));

        $teacher->refresh();
        $this->assertNotNull($teacher->public_edit_token);
        $this->assertNotEquals($oldToken, $teacher->public_edit_token);
        $this->assertEquals(64, strlen($teacher->public_edit_token));
        $this->assertNotEquals($oldTimestamp->timestamp, $teacher->token_generated_at->timestamp);
    }

    public function test_reset_token_requires_auth(): void
    {
        $teacher = Teacher::create([
            'name' => 'Guru Reset Auth',
            'public_edit_token' => 'auth-token-1234567890123456789012345678901234567890123456789012345678',
            'token_generated_at' => now(),
        ]);

        $this->post(route('admin.website.teachers.reset-token', $teacher))
            ->assertRedirect(route('login'));
    }
}
