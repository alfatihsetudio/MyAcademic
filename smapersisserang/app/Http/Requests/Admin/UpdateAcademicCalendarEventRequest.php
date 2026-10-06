<?php

namespace App\Http\Requests\Admin;

use App\Models\AcademicYear;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAcademicCalendarEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function prepareForValidation(): void
    {
        $data = [];

        if ($this->has('is_holiday')) {
            $data['is_holiday'] = filter_var($this->is_holiday, FILTER_VALIDATE_BOOLEAN);
        }

        if ($this->has('is_effective_day')) {
            $data['is_effective_day'] = filter_var($this->is_effective_day, FILTER_VALIDATE_BOOLEAN);
        }

        if ($this->has('targets') && is_array($this->targets)) {
            $normalized = $this->targets;

            if (in_array('semua', $normalized)) {
                $normalized = ['semua'];
            }

            $data['targets'] = array_values(array_unique($normalized));
        }

        if (!empty($data)) {
            $this->merge($data);
        }
    }

    public function after(): array
    {
        return [
            function ($validator) {
                if (!$validator->errors()->has('academic_year_id')
                    && !$validator->errors()->has('start_date')
                    && !$validator->errors()->has('end_date')
                ) {
                    $year = AcademicYear::find($this->academic_year_id);

                    if ($year) {
                        $start = $this->input('start_date');
                        $end = $this->input('end_date');

                        if ($start && $end) {
                            if ($start < $year->start_date->toDateString()
                                || $end > $year->end_date->toDateString()
                            ) {
                                $validator->errors()->add(
                                    'start_date',
                                    'Tanggal kegiatan harus berada dalam rentang tahun pelajaran yang dipilih.'
                                );
                            }
                        }
                    }
                }
            },
        ];
    }

    public function rules(): array
    {
        return [
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', Rule::in([
                'awal-masuk',
                'libur-nasional',
                'penyerahan-rapor',
                'libur-ramadan',
                'asesmen-ujian',
                'libur-semester',
                'tka-asesmen-nasional',
                'kegiatan-sekolah',
                'kegiatan-pesantren',
                'lainnya',
            ])],
            'source' => ['required', Rule::in(['sekolah', 'pemerintah'])],
            'description' => ['nullable', 'string'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'is_all_day' => ['nullable', 'boolean'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => ['required', 'date_format:H:i', 'after:start_time'],
            'day_status' => ['required', Rule::in([
                'efektif',
                'tidak-efektif',
                'libur',
                'kegiatan-khusus',
            ])],
            'is_holiday' => ['nullable', 'boolean'],
            'is_effective_day' => ['nullable', 'boolean'],
            'targets' => ['required', 'array', 'min:1'],
            'targets.*' => ['string', Rule::in([
                'semua',
                'guru',
                'siswa',
                'orang_tua',
                'asrama',
                'publik',
            ])],
            'responsible_type' => [
                'required',
                Rule::in(['teacher', 'other']),
            ],
            'teacher_id' => [
                'nullable',
                'integer',
                Rule::exists('teachers', 'id'),
                'required_if:responsible_type,teacher',
            ],
            'person_in_charge' => [
                'nullable',
                'string',
                'max:255',
                'required_if:responsible_type,other',
            ],
            'location' => ['nullable', 'string', 'max:255'],
            'internal_notes' => ['nullable', 'string'],
            'status' => ['required', Rule::in(['draft', 'published', 'archived'])],
        ];
    }

    public function messages(): array
    {
        return [
            'academic_year_id.required' => 'Tahun pelajaran wajib dipilih.',
            'academic_year_id.exists' => 'Tahun pelajaran yang dipilih tidak valid.',
            'title.required' => 'Nama kegiatan wajib diisi.',
            'end_date.after_or_equal' => 'Tanggal selesai tidak boleh sebelum tanggal mulai.',
            'start_time.required' => 'Jam mulai wajib diisi.',
            'start_time.date_format' => 'Format jam mulai tidak valid.',
            'end_time.required' => 'Jam selesai wajib diisi.',
            'end_time.date_format' => 'Format jam selesai tidak valid.',
            'end_time.after' => 'Jam selesai harus setelah jam mulai.',
            'targets.required' => 'Minimal satu sasaran harus dipilih.',
            'targets.min' => 'Minimal satu sasaran harus dipilih.',
            'category.in' => 'Kategori yang dipilih tidak valid.',
            'day_status.in' => 'Status hari yang dipilih tidak valid.',
            'status.in' => 'Status kegiatan tidak valid.',
            'responsible_type.required' => 'Pilih jenis penanggung jawab.',
            'responsible_type.in' => 'Jenis penanggung jawab tidak valid.',
            'teacher_id.required_if' => 'Pilih guru sebagai penanggung jawab.',
            'teacher_id.exists' => 'Guru yang dipilih tidak tersedia.',
            'person_in_charge.required_if' => 'Isi nama penanggung jawab lainnya.',
        ];
    }
}
