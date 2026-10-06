<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'MyAcademic') - Sistem Informasi Akademik</title>
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary: #4f46e5;
            --primary-hover: #4338ca;
            --primary-light: #eef2ff;
            --secondary: #0ea5e9;
            --success: #10b981;
            --danger: #ef4444;
            --warning: #f59e0b;
            --dark: #0f172a;
            --gray: #64748b;
            --light-gray: #f8fafc;
            --border: #e2e8f0;
            --card-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background-color: #f1f5f9;
            color: #1e293b;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* Top Navbar */
        .navbar {
            background-color: #ffffff;
            border-bottom: 1px solid var(--border);
            padding: 0.75rem 1.5rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 50;
        }

        .brand {
            display: flex;
            align-items: center;
            gap: 0.75rem;
            text-decoration: none;
            color: var(--dark);
            font-weight: 700;
            font-size: 1.25rem;
        }

        .brand-badge {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            padding: 0.35rem 0.65rem;
            border-radius: 8px;
            font-size: 0.9rem;
        }

        .nav-links {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            list-style: none;
        }

        .nav-link {
            text-decoration: none;
            color: var(--gray);
            font-weight: 500;
            font-size: 0.9rem;
            padding: 0.5rem 0.85rem;
            border-radius: 8px;
            transition: all 0.2s;
        }

        .nav-link:hover, .nav-link.active {
            color: var(--primary);
            background-color: var(--primary-light);
        }

        .user-nav {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .user-badge {
            font-size: 0.75rem;
            font-weight: 600;
            padding: 0.2rem 0.5rem;
            border-radius: 9999px;
            text-transform: uppercase;
        }
        .badge-admin { background-color: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
        .badge-guru { background-color: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
        .badge-murid { background-color: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }

        /* Container */
        .container {
            max-width: 1200px;
            width: 100%;
            margin: 0 auto;
            padding: 2rem 1.5rem;
            flex: 1;
        }

        /* Page Header */
        .page-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .page-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--dark);
        }

        .page-subtitle {
            font-size: 0.875rem;
            color: var(--gray);
            margin-top: 0.25rem;
        }

        /* Cards */
        .card {
            background: #ffffff;
            border-radius: 12px;
            border: 1px solid var(--border);
            box-shadow: var(--card-shadow);
            padding: 1.5rem;
            margin-bottom: 1.5rem;
        }

        /* Buttons */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            font-weight: 600;
            font-size: 0.875rem;
            padding: 0.6rem 1.2rem;
            border-radius: 8px;
            border: 1px solid transparent;
            cursor: pointer;
            text-decoration: none;
            transition: all 0.15s ease-in-out;
        }

        .btn-primary { background-color: var(--primary); color: white; }
        .btn-primary:hover { background-color: var(--primary-hover); }

        .btn-secondary { background-color: white; border-color: var(--border); color: var(--dark); }
        .btn-secondary:hover { background-color: var(--light-gray); }

        .btn-danger { background-color: var(--danger); color: white; }
        .btn-danger:hover { opacity: 0.9; }

        .btn-sm { padding: 0.35rem 0.75rem; font-size: 0.8rem; }

        /* Tables */
        .table-responsive {
            width: 100%;
            overflow-x: auto;
        }

        table.data-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.875rem;
        }

        table.data-table th {
            background-color: var(--light-gray);
            color: var(--gray);
            font-weight: 600;
            padding: 0.75rem 1rem;
            border-bottom: 1px solid var(--border);
            text-transform: uppercase;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
        }

        table.data-table td {
            padding: 1rem;
            border-bottom: 1px solid var(--border);
            vertical-align: middle;
        }

        table.data-table tr:hover {
            background-color: #f8fafc;
        }

        /* Forms */
        .form-group {
            margin-bottom: 1.25rem;
        }

        .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--dark);
            margin-bottom: 0.4rem;
        }

        .form-control {
            width: 100%;
            padding: 0.65rem 0.85rem;
            font-size: 0.875rem;
            border-radius: 8px;
            border: 1px solid var(--border);
            background-color: #fff;
            color: var(--dark);
            outline: none;
            transition: border-color 0.15s;
        }

        .form-control:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
        }

        /* Alerts */
        .alert {
            padding: 1rem 1.25rem;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }
        .alert-success { background-color: #ecfdf5; color: #065f46; border: 1px solid #a7f3d0; }
        .alert-error { background-color: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }

        /* Grid */
        .grid-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1.25rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: white;
            padding: 1.25rem;
            border-radius: 12px;
            border: 1px solid var(--border);
            box-shadow: var(--card-shadow);
        }

        .stat-label { font-size: 0.85rem; color: var(--gray); font-weight: 500; }
        .stat-value { font-size: 1.85rem; font-weight: 700; color: var(--dark); margin: 0.25rem 0; }
        .stat-desc { font-size: 0.75rem; color: var(--gray); }

        /* Footer */
        footer {
            background-color: #ffffff;
            border-top: 1px solid var(--border);
            padding: 1.25rem;
            text-align: center;
            font-size: 0.8rem;
            color: var(--gray);
        }

        @media (max-width: 860px) {
            .nav-links { display: none; }
        }
    </style>
    @yield('styles')
</head>
<body>
    <!-- Top Navbar -->
    <nav class="navbar">
        <a href="/" class="brand">
            <span class="brand-badge">MA</span>
            <span>MyAcademic</span>
        </a>

        @auth
        <ul class="nav-links">
            @if(auth()->user()->isAdmin())
                <li><a href="{{ route('admin.dashboard') }}" class="nav-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}">Dashboard</a></li>
                <li><a href="{{ route('classes.index') }}" class="nav-link {{ request()->routeIs('classes.*') ? 'active' : '' }}">Kelas</a></li>
                <li><a href="{{ route('subjects.index') }}" class="nav-link {{ request()->routeIs('subjects.*') ? 'active' : '' }}">Mata Pelajaran</a></li>
                <li><a href="{{ route('users.index') }}" class="nav-link {{ request()->routeIs('users.*') ? 'active' : '' }}">Pengguna</a></li>
                <li><a href="{{ route('assignments.index') }}" class="nav-link {{ request()->routeIs('assignments.*') ? 'active' : '' }}">Tugas</a></li>
            @elseif(auth()->user()->isGuru())
                <li><a href="{{ route('guru.dashboard') }}" class="nav-link {{ request()->routeIs('guru.dashboard') ? 'active' : '' }}">Dashboard</a></li>
                <li><a href="{{ route('subjects.index') }}" class="nav-link {{ request()->routeIs('subjects.*') ? 'active' : '' }}">Mapel</a></li>
                <li><a href="{{ route('assignments.index') }}" class="nav-link {{ request()->routeIs('assignments.*') ? 'active' : '' }}">Tugas</a></li>
                <li><a href="{{ route('materials.index') }}" class="nav-link {{ request()->routeIs('materials.*') ? 'active' : '' }}">Materi</a></li>
                <li><a href="{{ route('attendance.take') }}" class="nav-link {{ request()->routeIs('attendance.*') ? 'active' : '' }}">Presensi</a></li>
                <li><a href="{{ route('offline-assessment.index') }}" class="nav-link {{ request()->routeIs('offline-assessment.*') ? 'active' : '' }}">Penilaian Offline</a></li>
                <li><a href="{{ route('excel.index') }}" class="nav-link {{ request()->routeIs('excel.*') ? 'active' : '' }}">Dokumen Excel</a></li>
            @else
                <li><a href="{{ route('murid.dashboard') }}" class="nav-link {{ request()->routeIs('murid.dashboard') ? 'active' : '' }}">Dashboard</a></li>
                <li><a href="{{ route('assignments.index') }}" class="nav-link {{ request()->routeIs('assignments.*') ? 'active' : '' }}">Tugas Saya</a></li>
                <li><a href="{{ route('materials.index') }}" class="nav-link {{ request()->routeIs('materials.*') ? 'active' : '' }}">Materi</a></li>
                <li><a href="{{ route('space-belajar.index') }}" class="nav-link {{ request()->routeIs('space-belajar.*') ? 'active' : '' }}">Space Belajar</a></li>
            @endif
        </ul>

        <div class="user-nav">
            <a href="{{ route('notifications.index') }}" class="nav-link" title="Notifikasi">
                🔔
            </a>
            <a href="{{ route('account.settings') }}" class="nav-link {{ request()->routeIs('account.*') ? 'active' : '' }}" title="Pengaturan Akun">
                ⚙️
            </a>
            <div style="text-align: right;">
                <div style="font-weight: 600; font-size: 0.875rem;">{{ auth()->user()->name }}</div>
                <span class="user-badge badge-{{ auth()->user()->role }}">
                    {{ auth()->user()->role }}
                </span>
            </div>
            <form action="{{ route('logout') }}" method="POST" style="display:inline;">
                @csrf
                <button type="submit" class="btn btn-secondary btn-sm" title="Keluar">
                    🚪 Logout
                </button>
            </form>
        </div>
        @else
        <div>
            <a href="{{ route('login') }}" class="btn btn-primary btn-sm">Masuk</a>
        </div>
        @endauth
    </nav>

    <!-- Main Content -->
    <main class="container">
        <!-- Flash Messages -->
        @if(session('success'))
            <div class="alert alert-success">
                <span>✅</span>
                <div>{{ session('success') }}</div>
            </div>
        @endif

        @if($errors->any())
            <div class="alert alert-error">
                <span>⚠️</span>
                <div>
                    @foreach($errors->all() as $error)
                        <div>{{ $error }}</div>
                    @endforeach
                </div>
            </div>
        @endif

        @yield('content')
    </main>

    <!-- Footer -->
    <footer>
        &copy; {{ date('Y') }} MyAcademic — Sistem Manajemen Sekolah Modern. Berbasis Laravel 11.
    </footer>

    @yield('scripts')
</body>
</html>
