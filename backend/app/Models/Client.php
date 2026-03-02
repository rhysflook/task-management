<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Client extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected static function booted()
    {

    }

    protected $fillable = [
        'topic',
        'extension_id',
        'bed_id',
        'device_id'
    ];
        
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->logFillable();
    }

    public function extension()
    {
        return $this->morphOne(Extension::class, 'owner');
    }

    public function bed()
    {
        return $this->belongsTo(Bed::class);
    }

    public function room()
    {
        return $this->hasOneThrough(
            Room::class,      // Final model
            Bed::class,       // Intermediate model
            'id',             // Foreign key on beds table (beds.id)
            'id',             // Foreign key on rooms table (rooms.id)
            'bed_id',         // Local key on clients table (clients.bed_id)
            'room_id'         // Local key on beds table (beds.room_id)
        );
    }
}
