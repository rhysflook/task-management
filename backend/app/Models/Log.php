<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Log extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;
    use SoftDeletes;

    protected $table = 'combined_logs';

    protected static function booted()
    {

    }

    protected $fillable = [
        'staff_name',
        'extension',
        'patient_name',
        'data_kbn',
        'time_stamp',
        'unit_name',
        'room_name',
        'bed_no'
    ];

    public array $fromTo = [
        'time_stamp' => ["key" => "time_stamp", "format" => "Y-m"],
    ];
}
