<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class StoreAcademicYearRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'academic_year' => ['required', 'string', 'max:20', 'regex:/^\d{4}\/\d{4}$/', 'unique:academic_years,academic_year'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'odd_semester_start_date' => ['nullable', 'date'],
            'odd_semester_end_date' => ['nullable', 'date'],
            'even_semester_start_date' => ['nullable', 'date'],
            'even_semester_end_date' => ['nullable', 'date'],
            'is_current' => ['nullable', 'boolean'],
            'description' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Nama tahun pelajaran wajib diisi.',
            'name.string' => 'Nama tahun pelajaran harus berupa teks.',
            'name.max' => 'Nama tahun pelajaran maksimal 255 karakter.',
            'academic_year.required' => 'Tahun pelajaran wajib diisi.',
            'academic_year.regex' => 'Format tahun pelajaran harus YYYY/YYYY (contoh: 2026/2027).',
            'academic_year.unique' => 'Tahun pelajaran sudah terdaftar.',
            'start_date.required' => 'Tanggal mulai wajib diisi.',
            'start_date.date' => 'Tanggal mulai tidak valid.',
            'end_date.required' => 'Tanggal selesai wajib diisi.',
            'end_date.date' => 'Tanggal selesai tidak valid.',
            'end_date.after' => 'Tanggal selesai harus setelah tanggal mulai.',
            'odd_semester_start_date.date' => 'Tanggal mulai semester ganjil tidak valid.',
            'odd_semester_end_date.date' => 'Tanggal selesai semester ganjil tidak valid.',
            'even_semester_start_date.date' => 'Tanggal mulai semester genap tidak valid.',
            'even_semester_end_date.date' => 'Tanggal selesai semester genap tidak valid.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $data = $this->all();

            if (preg_match('/^(\d{4})\/(\d{4})$/', $data['academic_year'] ?? '', $m)) {
                $year1 = (int) $m[1];
                $year2 = (int) $m[2];
                if ($year2 !== $year1 + 1) {
                    $validator->errors()->add('academic_year', 'Tahun kedua harus merupakan tahun pertama ditambah 1 (contoh: 2026/2027).');
                }
            }

            $startDate = $data['start_date'] ?? null;
            $endDate = $data['end_date'] ?? null;

            // Odd semester pair validation
            $oddStart = $data['odd_semester_start_date'] ?? null;
            $oddEnd = $data['odd_semester_end_date'] ?? null;

            if ($oddStart && !$oddEnd) {
                $validator->errors()->add('odd_semester_end_date', 'Tanggal selesai semester ganjil wajib diisi jika tanggal mulai diisi.');
            }
            if (!$oddStart && $oddEnd) {
                $validator->errors()->add('odd_semester_start_date', 'Tanggal mulai semester ganjil wajib diisi jika tanggal selesai diisi.');
            }
            if ($oddStart && $oddEnd) {
                if ($oddEnd < $oddStart) {
                    $validator->errors()->add('odd_semester_end_date', 'Tanggal selesai semester ganjil harus setelah atau sama dengan tanggal mulai.');
                }
                if ($startDate && $oddStart < $startDate) {
                    $validator->errors()->add('odd_semester_start_date', 'Semester ganjil tidak boleh dimulai sebelum tahun pelajaran dimulai.');
                }
                if ($endDate && $oddEnd > $endDate) {
                    $validator->errors()->add('odd_semester_end_date', 'Semester ganjil tidak boleh berakhir setelah tahun pelajaran berakhir.');
                }
            }

            // Even semester pair validation
            $evenStart = $data['even_semester_start_date'] ?? null;
            $evenEnd = $data['even_semester_end_date'] ?? null;

            if ($evenStart && !$evenEnd) {
                $validator->errors()->add('even_semester_end_date', 'Tanggal selesai semester genap wajib diisi jika tanggal mulai diisi.');
            }
            if (!$evenStart && $evenEnd) {
                $validator->errors()->add('even_semester_start_date', 'Tanggal mulai semester genap wajib diisi jika tanggal selesai diisi.');
            }
            if ($evenStart && $evenEnd) {
                if ($evenEnd < $evenStart) {
                    $validator->errors()->add('even_semester_end_date', 'Tanggal selesai semester genap harus setelah atau sama dengan tanggal mulai.');
                }
                if ($startDate && $evenStart < $startDate) {
                    $validator->errors()->add('even_semester_start_date', 'Semester genap tidak boleh dimulai sebelum tahun pelajaran dimulai.');
                }
                if ($endDate && $evenEnd > $endDate) {
                    $validator->errors()->add('even_semester_end_date', 'Semester genap tidak boleh berakhir setelah tahun pelajaran berakhir.');
                }
            }

            // Odd semester must not overlap into even semester
            if ($oddStart && $oddEnd && $evenStart) {
                if ($oddEnd >= $evenStart) {
                    $validator->errors()->add('odd_semester_end_date', 'Semester ganjil tidak boleh melewati tanggal mulai semester genap.');
                }
            }
        });
    }
}
