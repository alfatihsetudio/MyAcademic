<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Masuk - MyAcademic</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            color: #1e293b;
        }
        .login-card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            max-width: 440px;
            width: 100%;
            padding: 2.5rem;
        }
        .brand-header {
            text-align: center;
            margin-bottom: 2rem;
        }
        .brand-badge {
            background: linear-gradient(135deg, #4f46e5, #0ea5e9);
            color: white;
            font-size: 1.5rem;
            font-weight: 700;
            padding: 0.5rem 1rem;
            border-radius: 12px;
            display: inline-block;
            margin-bottom: 0.75rem;
        }
        .brand-title {
            font-size: 1.35rem;
            font-weight: 700;
            color: #0f172a;
        }
        .brand-subtitle {
            font-size: 0.85rem;
            color: #64748b;
            margin-top: 0.25rem;
        }
        .form-group {
            margin-bottom: 1.25rem;
        }
        .form-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 0.4rem;
        }
        .form-control {
            width: 100%;
            padding: 0.75rem 1rem;
            font-size: 0.9rem;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            outline: none;
            transition: all 0.15s;
        }
        .form-control:focus {
            border-color: #4f46e5;
            box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
        }
        .btn-submit {
            width: 100%;
            background-color: #4f46e5;
            color: white;
            border: none;
            padding: 0.8rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: background-color 0.15s;
            margin-top: 0.5rem;
        }
        .btn-submit:hover {
            background-color: #4338ca;
        }
        .alert-error {
            background-color: #fef2f2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            font-size: 0.85rem;
            margin-bottom: 1.25rem;
        }
        .quick-accounts {
            margin-top: 1.75rem;
            padding-top: 1.25rem;
            border-top: 1px dashed #e2e8f0;
            font-size: 0.8rem;
            color: #64748b;
        }
        .quick-accounts-title {
            font-weight: 600;
            color: #334155;
            margin-bottom: 0.5rem;
        }
        .quick-btn {
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
            padding: 0.35rem 0.65rem;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.75rem;
            font-weight: 500;
            margin-right: 0.35rem;
            margin-bottom: 0.35rem;
            transition: all 0.15s;
        }
        .quick-btn:hover {
            background: #e2e8f0;
            color: #0f172a;
        }
    </style>
</head>
<body>
    <div class="login-card">
        <div class="brand-header">
            <span class="brand-badge">MA</span>
            <h1 class="brand-title">MyAcademic</h1>
            <p class="brand-subtitle">Silakan masuk ke akun Anda</p>
        </div>

        @if($errors->any())
            <div class="alert-error">
                @foreach($errors->all() as $error)
                    <div>{{ $error }}</div>
                @endforeach
            </div>
        @endif

        <form action="{{ route('login') }}" method="POST">
            @csrf
            <div class="form-group">
                <label for="email" class="form-label">Alamat Email</label>
                <input type="email" id="email" name="email" class="form-control" value="{{ old('email') }}" required autofocus placeholder="contoh@gmail.com">
            </div>

            <div class="form-group">
                <label for="password" class="form-label">Password</label>
                <input type="password" id="password" name="password" class="form-control" required placeholder="••••••••">
            </div>

            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; font-size: 0.85rem;">
                <label style="display: flex; align-items: center; gap: 0.4rem; cursor: pointer;">
                    <input type="checkbox" name="remember"> Ingat saya
                </label>
            </div>

            <button type="submit" class="btn-submit">Masuk ke Sistem</button>
        </form>

        <div class="quick-accounts">
            <div class="quick-accounts-title">Akun Cepat (Klik untuk isi):</div>
            <button type="button" class="quick-btn" onclick="fillAccount('admin@gmail.com')">🔑 Admin</button>
            <button type="button" class="quick-btn" onclick="fillAccount('guru@gmail.com')">👨‍🏫 Guru</button>
            <button type="button" class="quick-btn" onclick="fillAccount('murid@gmail.com')">👨‍🎓 Murid</button>
            <div style="margin-top: 0.35rem; font-size: 0.75rem;">Password default: <code>admin123</code></div>
        </div>
    </div>

    <script>
        function fillAccount(email) {
            document.getElementById('email').value = email;
            document.getElementById('password').value = 'admin123';
        }
    </script>
</body>
</html>
