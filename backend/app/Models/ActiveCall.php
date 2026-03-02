<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActiveCall extends Model
{
    protected $fillable = [
        'uniqueid',
        'patient_id',
    ];
}
