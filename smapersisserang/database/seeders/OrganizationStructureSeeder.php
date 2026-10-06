<?php

namespace Database\Seeders;

use App\Models\OrganizationStructure;
use Illuminate\Database\Seeder;

class OrganizationStructureSeeder extends Seeder
{
    public function run(): void
    {
        $structures = [
            [
                'structure_key' => 'pembina-persis',
                'label' => 'Pembina / Pimpinan Persis',
                'person_name' => null,
                'description' => 'Dewan Pembina Pondok Pesantren dan Madrasah Persatuan Islam',
                'members' => null,
                'parent_key' => null,
                'sort_order' => 1,
                'level' => 1,
                'card_type' => 'top',
                'is_active' => true,
            ],
            [
                'structure_key' => 'bidang-pendidikan',
                'label' => 'Bidang Pendidikan / Majelis Pendidikan',
                'person_name' => null,
                'description' => 'Majelis Pendidikan Persatuan Islam Cabang Serang',
                'members' => null,
                'parent_key' => null,
                'sort_order' => 2,
                'level' => 1,
                'card_type' => 'top',
                'is_active' => true,
            ],
            [
                'structure_key' => 'kepala-sekolah',
                'label' => 'Kepala SMA Persis Serang',
                'person_name' => null,
                'description' => 'Pimpinan tertinggi sekolah',
                'members' => null,
                'parent_key' => null,
                'sort_order' => 1,
                'level' => 2,
                'card_type' => 'principal',
                'is_active' => true,
            ],
            [
                'structure_key' => 'komite-sekolah',
                'label' => 'Komite Sekolah',
                'person_name' => null,
                'description' => 'Badan mandiri yang mewadahi peran serta masyarakat',
                'members' => null,
                'parent_key' => null,
                'sort_order' => 2,
                'level' => 2,
                'card_type' => 'committee',
                'is_active' => true,
            ],
            [
                'structure_key' => 'waka-kurikulum',
                'label' => 'Wakil Kepala Sekolah Bidang Kurikulum',
                'person_name' => null,
                'description' => null,
                'members' => ['Koordinator Pembelajaran', 'Guru Mata Pelajaran', 'Wali Kelas'],
                'parent_key' => 'kepala-sekolah',
                'sort_order' => 1,
                'level' => 3,
                'card_type' => 'unit',
                'is_active' => true,
            ],
            [
                'structure_key' => 'waka-kesiswaan',
                'label' => 'Wakil Kepala Sekolah Bidang Kesiswaan',
                'person_name' => null,
                'description' => null,
                'members' => ['Pembina OSIS / IPP', 'Pembina Ekstrakurikuler', 'Bimbingan Konseling', 'Tim Kedisiplinan Santri'],
                'parent_key' => 'kepala-sekolah',
                'sort_order' => 2,
                'level' => 3,
                'card_type' => 'unit',
                'is_active' => true,
            ],
            [
                'structure_key' => 'waka-sarpras',
                'label' => 'Wakil Kepala Sekolah Bidang Sarana dan Prasarana',
                'person_name' => null,
                'description' => null,
                'members' => ['Penanggung Jawab Ruang Kelas', 'Penanggung Jawab Laboratorium / Komputer', 'Penanggung Jawab Asrama', 'Penanggung Jawab Inventaris'],
                'parent_key' => 'kepala-sekolah',
                'sort_order' => 3,
                'level' => 3,
                'card_type' => 'unit',
                'is_active' => true,
            ],
            [
                'structure_key' => 'waka-humas',
                'label' => 'Wakil Kepala Sekolah Bidang Humas dan Kerja Sama',
                'person_name' => null,
                'description' => null,
                'members' => ['Hubungan Orang Tua Santri', 'Kerja Sama Lembaga', 'Publikasi dan Media Sekolah', 'SPMB / PPDB'],
                'parent_key' => 'kepala-sekolah',
                'sort_order' => 4,
                'level' => 3,
                'card_type' => 'unit',
                'is_active' => true,
            ],
            [
                'structure_key' => 'kepala-asrama',
                'label' => 'Kepala Asrama / Boarding School',
                'person_name' => null,
                'description' => null,
                'members' => ['Murobi Ikhwan', 'Murobi Akhwat', 'Koordinator Piket Asrama', 'Koordinator Makan Santri', 'Koordinator Kebersihan dan Keamanan Asrama'],
                'parent_key' => 'kepala-sekolah',
                'sort_order' => 5,
                'level' => 3,
                'card_type' => 'unit',
                'is_active' => true,
            ],
            [
                'structure_key' => 'tata-usaha',
                'label' => 'Tata Usaha',
                'person_name' => null,
                'description' => null,
                'members' => ['Administrasi Sekolah', 'Keuangan', 'Operator Sekolah', 'Arsip dan Dokumen'],
                'parent_key' => 'kepala-sekolah',
                'sort_order' => 6,
                'level' => 3,
                'card_type' => 'unit',
                'is_active' => true,
            ],
            [
                'structure_key' => 'unit-pendukung',
                'label' => 'Unit Pendukung',
                'person_name' => null,
                'description' => null,
                'members' => ['Perpustakaan', 'Laboratorium Komputer', 'UKS', 'Keamanan', 'Kebersihan'],
                'parent_key' => 'kepala-sekolah',
                'sort_order' => 7,
                'level' => 3,
                'card_type' => 'unit',
                'is_active' => true,
            ],
        ];

        foreach ($structures as $structure) {
            OrganizationStructure::updateOrCreate(
                ['structure_key' => $structure['structure_key']],
                $structure
            );
        }
    }
}
