<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Illuminate\Foundation\Auth\User;

class Staff extends User
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected static function booted()
    {

    }

    protected $fillable = [
        'staff_id',
        'name',
        'gender',
        'password',
        'data_creator_id',
        'unit_id',
        'user_type',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'password' => 'hashed',
        'user_type' => \App\Enums\UserType::class,
    ];
    
    public $rememberTokenName = null;

    public function getAuthIdentifierName()
    {
        return 'id';
    }

    public function username()
    {
        return 'staff_id';
    }
    
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->logFillable();
    }

    public function units()
    {
        return $this->belongsToMany(Unit::class);
    }

    public function extension()
    {
        return $this->morphOne(Extension::class, 'owner');
    }

    public static function generateStaffId()
    {
            // Use today's date instead of admission date
        $today = now();
        $yy = $today->format('y');  // last 2 digits, e.g. "25"

        // Find the largest patient_no starting with this year's prefix
        $maxExisting = self::where('staff_id', 'like', "{$yy}%")->withTrashed()
            ->orderBy('staff_id', 'desc')
            ->value('staff_id');

        if ($maxExisting) {
            // Extract the sequence and increment
            $seq = intval(substr($maxExisting, 2)) + 1;
        } else {
            $seq = 1;
        }

        $seqPadded = str_pad($seq, 2, '0', STR_PAD_LEFT);

        return "{$yy}{$seqPadded}";
    }

    function smartphoneLogins()
    {
        return $this->hasMany(SmartphoneLogin::class);
    }
}
