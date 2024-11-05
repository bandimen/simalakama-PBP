<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dosen extends Model
{
    protected $table = 'dosen';

    public function pembimbingAkademik()
    {
        return $this->hasOne(PembimbingAkademik::class, 'nidn', 'nidn');
    }

    public function kaprodi()
    {
        return $this->hasOne(Kaprodi::class, 'nidn', 'nidn');
    }
}
