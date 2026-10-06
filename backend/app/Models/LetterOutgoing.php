<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class LetterOutgoing extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'letter_type_id',
        'letter_number',
        'sequence_number',
        'subject',
        'letter_date',
        'letter_month',
        'letter_year',
        'opening_paragraph',
        'body',
        'closing_paragraph',
        'attachment',
        'pdf_font_size',
        'cc',
        'status',
        'use_letterhead',
        'letterhead_mode',
        'signer_1_id',
        'signer_2_id',
        'created_by',
        'updated_by',
        'issued_at',
        'show_basmallah',
        'show_closing_dua',
        'basmallah_text',
        'closing_dua_text',
        'letter_classification_code',
        'letter_school_code',
        'hijri_date',
    ];

    protected function casts(): array
    {
        return [
            'sequence_number' => 'integer',
            'letter_date' => 'date',
            'letter_month' => 'integer',
            'letter_year' => 'integer',
            'use_letterhead' => 'boolean',
            'show_basmallah' => 'boolean',
            'show_closing_dua' => 'boolean',
            'pdf_font_size' => 'integer',
            'issued_at' => 'datetime',
        ];
    }

    public function letterType(): BelongsTo
    {
        return $this->belongsTo(LetterType::class);
    }

    public function recipients(): HasMany
    {
        return $this->hasMany(LetterRecipient::class)->orderBy('sort_order');
    }

    public function signerOne(): BelongsTo
    {
        return $this->belongsTo(LetterSigner::class, 'signer_1_id')->withTrashed();
    }

    public function signerTwo(): BelongsTo
    {
        return $this->belongsTo(LetterSigner::class, 'signer_2_id')->withTrashed();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function attachmentContent(): HasOne
    {
        return $this->hasOne(LetterAttachmentContent::class);
    }
}
