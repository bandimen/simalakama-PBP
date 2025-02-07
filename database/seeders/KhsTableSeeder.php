<?php

namespace Database\Seeders;

use App\Models\Khs;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class KhsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $khs = [
            // khs farrel dgn id irs 1, smt 1 th ajaran 2023/2024 gasal
            [
                'irs_id' => 1,
            ], 
            // khs farrel dgn id irs 2, smt 2 th ajaran 2023/2024 genap
            [
                'irs_id' => 2,
            ], 

            // khs nopal dgn id irs 3, smt 1 th ajaran 2022/2023 gasal
            [
                'irs_id' => 3,
            ], 
            // khs nopal dgn id irs 4, smt 2 th ajaran 2022/2023 genap
            [
                'irs_id' => 4,
            ], 
            // khs nopal dgn id irs 5, smt 3 th ajaran 2023/2024 gasal
            [
                'irs_id' => 5,
            ], 
            // khs nopal dgn id irs 6, smt 4 th ajaran 2023/2024 genap
            [
                'irs_id' => 6,
            ], 
        ];

        foreach($khs as $k){
            Khs::create($k);
        }
    }
}
