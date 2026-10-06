<?php

namespace App\Models\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Schema;

trait HasTenant
{
    /**
     * Boot the tenant scope for the model.
     */
    protected static function bootHasTenant(): void
    {
        static::addGlobalScope('tenant', function (Builder $builder) {
            // Apply scope only if user is authenticated and is not a superadmin
            if (Auth::check()) {
                $user = Auth::user();
                
                // Allow super admin to see everything if they don't have a specific school_id
                if ($user->hasRole('super_admin') && !$user->school_id) {
                    return;
                }

                $model = $builder->getModel();
                $table = $model->getTable();

                if ($user->school_id && Schema::hasColumn($table, 'school_id')) {
                    $builder->where($table . '.school_id', $user->school_id);
                }
            }
        });
        
        static::creating(function ($model) {
            if (Auth::check() && empty($model->school_id)) {
                $user = Auth::user();
                if ($user->school_id && Schema::hasColumn($model->getTable(), 'school_id')) {
                    $model->school_id = $user->school_id;
                }
            }
        });
    }
}
