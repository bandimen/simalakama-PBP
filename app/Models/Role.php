<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{

    protected $fillable = [
        'name'
    ];


    public function users()
    {
        return $this->belongsToMany(User::class, 'role_user');
    }
}
