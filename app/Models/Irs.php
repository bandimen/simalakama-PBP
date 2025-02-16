<?php

namespace App\Models;

use App\Models\IrsDetail;
use App\Models\Mahasiswa;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Irs extends Model
{
    use HasFactory;

    protected $table = 'irs';
    protected $fillable = [
        'nim',
        'semester',
        'jenis_semester',
        'tahun_ajaran',
        'status',
        'total_sks',
        'max_sks',
    ];

    // relasi ke mahasiswa many to 1
    public function mahasiswa() 
    {
        return $this->belongsTo(Mahasiswa::class, 'nim', 'nim');
    }

    public function irsDetails()
    {
        return $this->hasMany(IrsDetail::class, 'irs_id', 'id');
    }

    public function khs()
    {
        return $this->hasOne(Khs::class);
    }
}
