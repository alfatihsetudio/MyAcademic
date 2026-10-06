<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Route;

class NavigationMenu extends Model
{
    protected $fillable = [
        'menu_key',
        'label',
        'route_name',
        'url',
        'parent_key',
        'sort_order',
        'location',
        'is_active',
        'is_external',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'is_external' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeLocation($query, string $location)
    {
        return $query->where('location', $location);
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_key', 'menu_key')
            ->where('is_active', true)
            ->orderBy('sort_order');
    }

    public function url(): string
    {
        if ($this->route_name && Route::has($this->route_name)) {
            return route($this->route_name);
        }

        return $this->url ?? '#';
    }
}
