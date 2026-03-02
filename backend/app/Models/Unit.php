<?php

namespace App\Models;

use App\Concerns\CascadingDelete;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Unit extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;
    use SoftDeletes;
    use HasUuids;
    use CascadingDelete;
    use LogsActivity;

    protected array $cascadingDeletes = [
        'rooms',
    ];

    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected static function booted()
    {

    }

    protected $fillable = [
        'id',
        'unit_no',     
        'name',
    ];

    public $ignoreSliceKeys = [
        'staff_id_1',
        'staff_name_1',
        'staff_id_2',
        'staff_name_2',
        'staff_id_3',
        'staff_name_3'
    ];
    
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->logFillable();
    }

    public function staff()
    {
        return $this->belongsToMany(Staff::class);
    }

    public function rooms()
    {
        return $this->hasMany(Room::class);
    }

    public function patients()
    {
        return $this->hasMany(Patient::class);
    }

}
