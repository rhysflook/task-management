<?php

namespace App\Models;

use App\Concerns\CascadingDelete;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Casts\Attribute;
class Room extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;
    use SoftDeletes;
    use HasUuids;
    use CascadingDelete;

    protected array $cascadingDeletes = [
        'beds',
    ];
    use LogsActivity;

    public $incrementing = false;   // not auto-increment
    protected $keyType = 'string';  // UUID is stored as string

    protected $with = ['beds'];

    protected static function booted()
    {
        //
    }

    protected $fillable = [
        'id',
        'number',
        'name',
        'unit_id',
        // 'patient_id',
        // 'extension',
        'x',
        'y',
        'width',
        'height',
        'grid_rows',
        'grid_columns',
        'icon',
        'is_utility',
    ];

    protected $appends = ['w', 'h'];

    public function w(): Attribute
    {
        return Attribute::get(
            fn () => $this->width
        );
    }

    public function h(): Attribute
    {
        return Attribute::get(
            fn () => $this->height
        );
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->logFillable();
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function patients()
    {
        return $this->hasMany(Patient::class);
    }

    public function beds()
    {
        return $this->hasMany(Bed::class)->orderBy('position');
    }

    public static function generateRoomNo()
    {
        // Find the largest room number
        $maxExisting = self::query()
            ->orderByRaw('number::int desc')
            ->first();

        if ($maxExisting) {
            $nextNumber = intval($maxExisting->number) + 1;
        } else {
            $nextNumber = 1;
        }

        return str_pad($nextNumber, 3, '0', STR_PAD_LEFT);
    }   
}
