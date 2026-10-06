<?php

return [
    'dashboard' => [
        'key' => 'dashboard',
        'label' => 'Dashboard SPMB',
        'route' => 'admin.ppdb.dashboard',
        'route_active' => 'admin.ppdb.dashboard',
        'icon' => 'home',
        'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'staf_kesiswaan', 'kepala_sekolah'],
    ],

    'sections' => [
        [
            'label' => 'SPMB (PENERIMAAN SISWA)',
            'items' => [
                [
                    'key' => 'ppdb.dashboard',
                    'label' => 'Statistik SPMB',
                    'route' => 'admin.ppdb.dashboard',
                    'route_active' => 'admin.ppdb.dashboard',
                    'icon' => 'chart-bar',
                    'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'staf_kesiswaan', 'kepala_sekolah'],
                    'permission' => 'ppdb.dashboard.view',
                ],
                [
                    'key' => 'ppdb.applications',
                    'label' => 'Data Pendaftar (Calon Murid)',
                    'route' => 'admin.ppdb.applications.index',
                    'route_active' => 'admin.ppdb.applications.*',
                    'icon' => 'document',
                    'roles' => ['superadmin', 'admin', 'staf_tata_usaha', 'staf_kesiswaan', 'kepala_sekolah'],
                    'permission' => 'ppdb.applications.view',
                ],
                [
                    'key' => 'ppdb.settings',
                    'label' => 'Pengaturan Gelombang & Biaya',
                    'route' => 'admin.ppdb.settings.edit',
                    'route_active' => 'admin.ppdb.settings.*',
                    'icon' => 'gear',
                    'roles' => ['superadmin', 'admin'],
                    'permission' => 'ppdb.settings.manage',
                ],
            ],
        ],
        [
            'label' => 'LANDING PAGE SPMB',
            'items' => [
                [
                    'key' => 'website.settings',
                    'label' => 'Informasi & Brosur Sekolah',
                    'route' => 'admin.website.settings.edit',
                    'route_active' => 'admin.website.settings.edit',
                    'icon' => 'gear',
                    'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                    'permission' => 'website.settings.manage',
                ],
                [
                    'key' => 'website.media',
                    'label' => 'Galeri & Fasilitas Kampus',
                    'route' => 'admin.website.media.index',
                    'route_active' => 'admin.website.media.*',
                    'icon' => 'image',
                    'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                    'permission' => 'website.media.manage',
                ],
                [
                    'key' => 'website.faq',
                    'label' => 'FAQ Calon Pendaftar',
                    'route' => 'admin.website.faq.index',
                    'route_active' => 'admin.website.faq.*',
                    'icon' => 'lightbulb',
                    'roles' => ['superadmin', 'admin', 'staf_tata_usaha'],
                    'permission' => 'website.faq.manage',
                ],
            ],
        ],
    ],

    'account' => [
        'label' => 'AKUN',
        'items' => [
            [
                'key' => 'account.profile',
                'label' => 'Profil Panitia',
                'route' => 'profile.edit',
                'route_active' => 'profile.*',
                'icon' => 'person',
                'roles' => [],
            ],
        ],
    ],
];
