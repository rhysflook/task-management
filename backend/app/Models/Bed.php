<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Bed extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;
    use SoftDeletes;
    use HasUuids;
    use LogsActivity;

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $with  = ['client', 'patient'];

    protected static function booted()
    {

    }

    protected $fillable = [
        'bed_no',
        'room_id',
        'client_id',
        'status',
        'position'
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->logFillable();
    }

    public function getNameAttribute()
    {
        return $this->bed_no;
    }

    public function client()
    {
        return $this->hasOne(Client::class);
    }

    public function patient()
    {
        return $this->hasOne(Patient::class);
    }

    public function room()
    {
        return $this->belongsTo(Room::class);
    }

    public function extension()
    {
        return $this->belongsTo(Extension::class);
    }
}
