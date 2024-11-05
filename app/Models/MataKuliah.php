<?php

namespace App\Models;

use App\Models\IrsDetail;
use App\Models\JadwalKuliah;
use Illuminate\Database\Eloquent\Model;

class MataKuliah extends Model
{
    public function jadwals() {
        return $this->hasMany(JadwalKuliah::class, 'kodemk', 'kodemk');
    }

    public function irsDetails(){
        return $this->hasMany(IrsDetail::class, 'kodemk', 'kodemk');
    }
}
