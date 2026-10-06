<?php

namespace Database\Seeders;

use App\Models\DonationShareTemplate;
use Illuminate\Database\Seeder;

class DonationShareTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $template = DonationShareTemplate::firstOrNew(['title' => 'Default']);

        if (!$template->exists) {
            $template->fill([
                'title' => 'Default',
                'is_active' => true,
                'message_template' => "Assalamu'alaikum warahmatullahi wabarakatuh, {sapaan} {nama_tujuan}.\n\nSaya bersama rekan-rekan di SMA Persis Serang sedang berikhtiar menghadirkan pendidikan gratis, makan, dan asrama bagi para santri.\n\nMelalui pesan ini, saya memohon dukungan {sapaan} untuk ikut membantu perjuangan ini dengan sedekah terbaik, baik berupa beras, telur, sayuran, maupun kebutuhan makan santri lainnya.\n\nInsyaAllah, apabila diperlukan, kami siap menjemput donasi ke tempat {sapaan}.\n\nSemoga setiap bantuan yang diberikan menjadi amal jariyah dan pahala yang terus mengalir hingga akhirat.\n\nSilakan berdonasi melalui link berikut:\n{link_donasi}\n\nJazakumullahu khairan katsiran.\n\nWassalamu'alaikum warahmatullahi wabarakatuh.",
            ])->save();
        }
    }
}
