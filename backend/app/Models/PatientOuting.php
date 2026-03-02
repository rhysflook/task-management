<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PatientOuting extends Model
{
    protected $fillable = [
        'patient_id',
        'outing_start',
        'outing_end',
    ];
}
