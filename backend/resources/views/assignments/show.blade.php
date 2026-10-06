@extends('layouts.app')

@section('title', $assignment->judul)

@section('content')
<div class="page-header">
    <div>
        <h1 class="page-title">{{ $assignment->judul }}</h1>
        <p class="page-subtitle">
            Mapel: <strong>{{ $assignment->subject->nama_mapel ?? '-' }}</strong> | 
            Kelas: <strong>{{ $assignment->academicClass->nama_kelas ?? '-' }}</strong> |
            Oleh: {{ $assignment->guru->name ?? 'Pengajar' }}
        </p>
    </div>
    <a href="{{ route('assignments.index') }}" class="btn btn-secondary">← Kembali ke Daftar Tugas</a>
</div>

<div style="display: grid; grid-template-columns: minmax(0, 1.8fr) minmax(0, 1.2fr); gap: 1.5rem;">
    <!-- Left Column: Details -->
    <div>
        <div class="card">
            <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">Petunjuk Pengerjaan</h3>
            
            <div style="line-height: 1.7; font-size: 0.92rem; color: #334155; margin-bottom: 1.5rem; white-space: pre-line;">
                {{ $assignment->deskripsi ?: 'Tidak ada instruksi tertulis khusus.' }}
            </div>

            @if($assignment->video_link)
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="font-size: 0.9rem; font-weight: 600; margin-bottom: 0.5rem;">🎥 Video Pembahasan / Pendukung:</h4>
                    <a href="{{ $assignment->video_link }}" target="_blank" class="btn btn-secondary btn-sm">
                        Buka Video di Tab Baru ↗
                    </a>
                </div>
            @endif

            <div style="padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.85rem; color: var(--gray);">
                Batas Pengumpulan: 
                <strong style="color: {{ $assignment->deadline && $assignment->deadline->isPast() ? '#dc2626' : '#16a34a' }};">
                    {{ $assignment->deadline ? $assignment->deadline->format('l, d F Y - H:i') : 'Tanpa batas waktu' }}
                </strong>
            </div>
        </div>

        @if(auth()->user()->isGuru() || auth()->user()->isAdmin())
            <!-- Teacher View: Submissions List -->
            <div class="card">
                <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">Pengumpulan Jawaban Siswa ({{ $assignment->submissions->count() }})</h3>
                
                <div class="table-responsive">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Siswa</th>
                                <th>Jawaban / Catatan</th>
                                <th>Tgl Kumpul</th>
                                <th>Nilai</th>
                                <th>Beri Nilai</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($assignment->submissions as $sub)
                                <tr>
                                    <td>
                                        <strong>{{ $sub->student->name ?? '-' }}</strong>
                                        <div style="font-size: 0.75rem; color: var(--gray);">{{ $sub->student->email ?? '' }}</div>
                                    </td>
                                    <td>
                                        <div style="font-size: 0.85rem;">{{ $sub->catatan ?: '-' }}</div>
                                        @if($sub->link_drive)
                                            <a href="{{ $sub->link_drive }}" target="_blank" style="font-size: 0.75rem; color: var(--primary);">Link Drive ↗</a>
                                        @endif
                                    </td>
                                    <td style="font-size: 0.8rem;">{{ $sub->submitted_at->format('d M Y, H:i') }}</td>
                                    <td>
                                        @if($sub->nilai !== null)
                                            <span style="font-size: 1.1rem; font-weight: 700; color: #16a34a;">{{ $sub->nilai }}</span>
                                        @else
                                            <span style="color: var(--gray); font-size: 0.8rem;">Belum dinilai</span>
                                        @endif
                                    </td>
                                    <td>
                                        <form action="{{ route('submissions.grade', $sub->id) }}" method="POST" style="display: flex; gap: 0.35rem; align-items: center;">
                                            @csrf
                                            <input type="number" name="nilai" step="0.01" min="0" max="100" value="{{ $sub->nilai }}" placeholder="0-100" class="form-control" style="width: 75px; padding: 0.35rem;" required>
                                            <button type="submit" class="btn btn-primary btn-sm">Simpan</button>
                                        </form>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" style="text-align: center; color: var(--gray); padding: 1.5rem;">
                                        Belum ada siswa yang mengumpulkan tugas ini.
                                    </td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        @endif
    </div>

    <!-- Right Column: Submission Form for Student -->
    @if(auth()->user()->isMurid())
        <div>
            <div class="card">
                <h3 style="font-size: 1.1rem; font-weight: 600; margin-bottom: 1rem;">Pengumpulan Tugas Saya</h3>
                
                @if($mySubmission)
                    <div class="alert alert-success" style="margin-bottom: 1rem;">
                        <span>✅</span>
                        <div>
                            Tugas sudah dikumpulkan pada <strong>{{ $mySubmission->submitted_at->format('d M Y, H:i') }}</strong>
                        </div>
                    </div>

                    @if($mySubmission->nilai !== null)
                        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; text-align: center;">
                            <div style="font-size: 0.85rem; color: #166534; font-weight: 600;">NILAI ANDA</div>
                            <div style="font-size: 2.5rem; font-weight: 800; color: #15803d;">{{ $mySubmission->nilai }}</div>
                            @if($mySubmission->feedback)
                                <div style="font-size: 0.85rem; color: #166534; margin-top: 0.5rem; text-align: left;">
                                    <strong>Catatan Guru:</strong> {{ $mySubmission->feedback }}
                                </div>
                            @endif
                        </div>
                    @endif
                @endif

                <form action="{{ route('assignments.submit', $assignment->id) }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    
                    <div class="form-group">
                        <label for="catatan" class="form-label">Jawaban Teks / Catatan Siswa</label>
                        <textarea id="catatan" name="catatan" class="form-control" rows="4" placeholder="Tuliskan jawaban atau catatan Anda di sini...">{{ old('catatan', $mySubmission->catatan ?? '') }}</textarea>
                    </div>

                    <div class="form-group">
                        <label for="link_drive" class="form-label">Tautan Link Drive / Tugas Online</label>
                        <input type="url" id="link_drive" name="link_drive" class="form-control" placeholder="https://drive.google.com/..." value="{{ old('link_drive', $mySubmission->link_drive ?? '') }}">
                    </div>

                    <div class="form-group">
                        <label for="file" class="form-label">Upload File Dokumen / Foto Jawaban (Maks 20MB)</label>
                        <input type="file" id="file" name="file" class="form-control">
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        {{ $mySubmission ? 'Perbarui Jawaban Tugas' : 'Kirim Tugas Sekarang' }}
                    </button>
                </form>
            </div>
        </div>
    @endif
</div>
@endsection
