<?php

namespace App\Models;

use App\Models\Scopes\TenantScope;
use Illuminate\Database\Eloquent\Model;

abstract class TenantBaseModel extends Model
{
    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::addGlobalScope(new TenantScope);
        
        static::creating(function ($model) {
            if (app()->has('current_tenant_id') && !$model->school_id) {
                $model->school_id = app('current_tenant_id');
            }
        });
    }
}
