<?php

namespace Tests\Feature\Admin;

use App\Models\Faq;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FaqTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create();
    }

    public function test_guest_can_view_public_faq_page(): void
    {
        $response = $this->get(route('public.faq'));
        $response->assertStatus(200);
    }

    public function test_faq_page_shows_active_faqs(): void
    {
        Faq::create([
            'question' => 'Apa itu SPMB?',
            'answer' => 'SPMB adalah Sistem Penerimaan Murid Baru.',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $response = $this->get(route('public.faq'));
        $response->assertSee('Apa itu SPMB?');
        $response->assertSee('SPMB adalah Sistem Penerimaan Murid Baru.');
    }

    public function test_faq_page_hides_inactive_faqs(): void
    {
        Faq::create([
            'question' => 'FAQ Nonaktif',
            'answer' => 'Tidak muncul.',
            'is_active' => false,
            'sort_order' => 1,
        ]);

        $response = $this->get(route('public.faq'));
        $response->assertDontSee('FAQ Nonaktif');
    }

    public function test_faq_empty_state(): void
    {
        $response = $this->get(route('public.faq'));
        $response->assertSee('FAQ belum tersedia.');
    }

    public function test_guest_cannot_access_admin_faq(): void
    {
        $this->get(route('admin.website.faq.index'))
            ->assertRedirect(route('login'));
    }

    public function test_admin_can_access_faq_index(): void
    {
        $this->actingAs($this->admin)
            ->get(route('admin.website.faq.index'))
            ->assertStatus(200);
    }

    public function test_admin_can_create_faq(): void
    {
        $this->actingAs($this->admin)
            ->post(route('admin.website.faq.store'), [
                'question' => 'Test FAQ?',
                'answer' => 'Ini jawaban test.',
                'category' => 'ppdb',
                'sort_order' => 1,
            ]);

        $this->assertDatabaseHas('faqs', [
            'question' => 'Test FAQ?',
            'answer' => 'Ini jawaban test.',
            'is_active' => true,
        ]);
    }

    public function test_admin_can_update_faq(): void
    {
        $faq = Faq::create([
            'question' => 'Pertanyaan Lama',
            'answer' => 'Jawaban Lama',
            'sort_order' => 1,
        ]);

        $this->actingAs($this->admin)
            ->put(route('admin.website.faq.update', $faq), [
                'question' => 'Pertanyaan Baru',
                'answer' => 'Jawaban Baru',
                'sort_order' => 2,
            ]);

        $faq->refresh();
        $this->assertEquals('Pertanyaan Baru', $faq->question);
        $this->assertEquals('Jawaban Baru', $faq->answer);
        $this->assertEquals(2, $faq->sort_order);
    }

    public function test_admin_can_toggle_faq(): void
    {
        $faq = Faq::create([
            'question' => 'Toggle FAQ?',
            'answer' => 'Jawaban.',
            'is_active' => true,
        ]);

        $this->actingAs($this->admin)
            ->patch(route('admin.website.faq.toggle', $faq));

        $faq->refresh();
        $this->assertFalse($faq->is_active);
    }

    public function test_admin_can_delete_faq(): void
    {
        $faq = Faq::create([
            'question' => 'Hapus FAQ?',
            'answer' => 'Jawaban.',
        ]);

        $this->actingAs($this->admin)
            ->delete(route('admin.website.faq.destroy', $faq));

        $this->assertDatabaseMissing('faqs', ['id' => $faq->id]);
    }
}
