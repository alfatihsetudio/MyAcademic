@extends('layouts.public')

@section('content')
<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div class="text-center mb-8">
            <h1 class="text-2xl font-bold text-gray-900">Form Pendaftaran SPMB</h1>
            <p class="text-gray-600 mt-2">Isi data diri dengan benar untuk mendaftar</p>
        </div>

        @if (session('error'))
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {{ session('error') }}
            </div>
        @endif

        @if ($errors->any())
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                <ul class="list-disc list-inside text-sm">
                    @foreach ($errors->all() as $error)
                        <li>{{ $error }}</li>
                    @endforeach
                </ul>
            </div>
        @endif

        <form method="POST" action="{{ route('ppdb.store') }}" class="space-y-6">
            @csrf

            <div class="border-b border-gray-200 pb-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Data Siswa</h2>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="sm:col-span-2">
                        <x-input-label for="student_name" value="Nama Lengkap Siswa" />
                        <x-text-input id="student_name" name="student_name" type="text" class="mt-1 block w-full"
                            value="{{ old('student_name') }}" required />
                        <x-input-error :messages="$errors->get('student_name')" class="mt-1" />
                    </div>

                    <div>
                        <x-input-label for="gender" value="Jenis Kelamin" />
                        <select id="gender" name="gender" required
                            class="mt-1 block w-full border-gray-300 focus:border-[#0F6B3A] focus:ring-[#0F6B3A] rounded-md shadow-sm">
                            <option value="">Pilih Jenis Kelamin</option>
                            <option value="laki_laki" @selected(old('gender') == 'laki_laki')>Laki-Laki</option>
                            <option value="perempuan" @selected(old('gender') == 'perempuan')>Perempuan</option>
                        </select>
                        <x-input-error :messages="$errors->get('gender')" class="mt-1" />
                    </div>

                    <div>
                        <x-input-label for="birth_place" value="Tempat Lahir" />
                        <x-text-input id="birth_place" name="birth_place" type="text" class="mt-1 block w-full"
                            value="{{ old('birth_place') }}" required />
                        <x-input-error :messages="$errors->get('birth_place')" class="mt-1" />
                    </div>

                    <div>
                        <x-input-label for="birth_date" value="Tanggal Lahir" />
                        <x-text-input id="birth_date" name="birth_date" type="date" class="mt-1 block w-full"
                            value="{{ old('birth_date') }}" required />
                        <x-input-error :messages="$errors->get('birth_date')" class="mt-1" />
                    </div>

                    <div>
                        <x-input-label for="previous_school" value="Asal Sekolah" />
                        <x-text-input id="previous_school" name="previous_school" type="text" class="mt-1 block w-full"
                            value="{{ old('previous_school') }}" required />
                        <x-input-error :messages="$errors->get('previous_school')" class="mt-1" />
                    </div>

                    <div class="sm:col-span-2">
                        <x-input-label for="address" value="Alamat" />
                        <textarea id="address" name="address" rows="3" required
                            class="mt-1 block w-full border-gray-300 focus:border-[#0F6B3A] focus:ring-[#0F6B3A] rounded-md shadow-sm">{{ old('address') }}</textarea>
                        <x-input-error :messages="$errors->get('address')" class="mt-1" />
                    </div>
                </div>
            </div>

            <div class="border-b border-gray-200 pb-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Data Orang Tua</h2>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <x-input-label for="father_name" value="Nama Ayah" />
                        <x-text-input id="father_name" name="father_name" type="text" class="mt-1 block w-full"
                            value="{{ old('father_name') }}" required />
                        <x-input-error :messages="$errors->get('father_name')" class="mt-1" />
                    </div>

                    <div>
                        <x-input-label for="mother_name" value="Nama Ibu" />
                        <x-text-input id="mother_name" name="mother_name" type="text" class="mt-1 block w-full"
                            value="{{ old('mother_name') }}" required />
                        <x-input-error :messages="$errors->get('mother_name')" class="mt-1" />
                    </div>

                    <div>
                        <x-input-label for="parent_whatsapp" value="No. WhatsApp Orang Tua" />
                        <x-text-input id="parent_whatsapp" name="parent_whatsapp" type="text" class="mt-1 block w-full"
                            value="{{ old('parent_whatsapp') }}" placeholder="08xxxxxxxxxx" required />
                        <x-input-error :messages="$errors->get('parent_whatsapp')" class="mt-1" />
                    </div>

                    <div>
                        <x-input-label for="parent_job" value="Pekerjaan Orang Tua (opsional)" />
                        <x-text-input id="parent_job" name="parent_job" type="text" class="mt-1 block w-full"
                            value="{{ old('parent_job') }}" />
                        <x-input-error :messages="$errors->get('parent_job')" class="mt-1" />
                    </div>
                </div>
            </div>

            <div class="border-b border-gray-200 pb-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Informasi Tambahan</h2>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <x-input-label for="boarding_ready" value="Siap Tinggal di Asrama?" />
                        <select id="boarding_ready" name="boarding_ready" required
                            class="mt-1 block w-full border-gray-300 focus:border-[#0F6B3A] focus:ring-[#0F6B3A] rounded-md shadow-sm">
                            <option value="">Pilih</option>
                            <option value="1" @selected(old('boarding_ready') == '1')>Ya, Siap</option>
                            <option value="0" @selected(old('boarding_ready') == '0' && old('boarding_ready') !== null)>Tidak</option>
                        </select>
                        <x-input-error :messages="$errors->get('boarding_ready')" class="mt-1" />
                    </div>

                    <div>
                        <x-input-label for="quran_reading_ability" value="Kemampuan Baca Al-Qur'an" />
                        <select id="quran_reading_ability" name="quran_reading_ability" required
                            class="mt-1 block w-full border-gray-300 focus:border-[#0F6B3A] focus:ring-[#0F6B3A] rounded-md shadow-sm">
                            <option value="">Pilih Kemampuan</option>
                            <option value="belum_bisa" @selected(old('quran_reading_ability') == 'belum_bisa')>Belum Bisa</option>
                            <option value="terbata_bata" @selected(old('quran_reading_ability') == 'terbata_bata')>Terbata-Bata</option>
                            <option value="lancar" @selected(old('quran_reading_ability') == 'lancar')>Lancar</option>
                            <option value="baik" @selected(old('quran_reading_ability') == 'baik')>Baik</option>
                        </select>
                        <x-input-error :messages="$errors->get('quran_reading_ability')" class="mt-1" />
                    </div>

                    <div class="sm:col-span-2">
                        <x-input-label for="health_notes" value="Riwayat Kesehatan (opsional)" />
                        <textarea id="health_notes" name="health_notes" rows="2"
                            class="mt-1 block w-full border-gray-300 focus:border-[#0F6B3A] focus:ring-[#0F6B3A] rounded-md shadow-sm">{{ old('health_notes') }}</textarea>
                        <p class="text-xs text-gray-500 mt-1">Misal: alergi, asma, atau kondisi kesehatan lainnya</p>
                        <x-input-error :messages="$errors->get('health_notes')" class="mt-1" />
                    </div>

                    <div class="sm:col-span-2">
                        <x-input-label for="motivation" value="Motivasi Masuk Boarding School" />
                        <textarea id="motivation" name="motivation" rows="4" required
                            class="mt-1 block w-full border-gray-300 focus:border-[#0F6B3A] focus:ring-[#0F6B3A] rounded-md shadow-sm">{{ old('motivation') }}</textarea>
                        <x-input-error :messages="$errors->get('motivation')" class="mt-1" />
                    </div>
                </div>
            </div>

            <div class="flex items-center justify-between pt-2">
                <a href="{{ url('/') }}" class="text-sm text-gray-600 hover:text-gray-900">
                    &larr; Kembali ke Beranda
                </a>
                <button type="submit" id="btn-submit"
                    class="px-6 py-3 bg-[#0F6B3A] text-white font-semibold rounded-lg hover:bg-[#0A4F2B] focus:outline-none focus:ring-2 focus:ring-[#0F6B3A] focus:ring-offset-2 transition-colors duration-200"
                    onclick="this.disabled=true; this.textContent='Mendaftarkan...'; this.form.submit();">
                    Daftar Sekarang
                </button>
            </div>
        </form>
    </div>
</div>
@endsection
