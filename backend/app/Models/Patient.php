<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Patient extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;
    use SoftDeletes;
    use LogsActivity;

    protected static function booted()
    {

    }

    protected $fillable = [
        'patient_no',
        'name',
        'kana',
        'birth_day',
        'gender',
        'unit_id',
        'room_id',
        'bed_id',
        'section',
        'admission_day',
        'discharge_day',
    ];
    
    public array $fromTo = [
        'admission_day' => ["key" => "admission_day", "format" => "Y-m"],
        'discharge_day' => ["key" => "discharge_day", "format" => "Y-m"],
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
        ->logFillable();
    }

    public function room()
    {
        return $this->belongsTo(Room::class, 'room_id');
    }

    public function bed()
    {
        return $this->belongsTo(Bed::class, 'bed_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }

    public function patientOutings()
    {
        return $this->hasMany(PatientOuting::class, 'patient_id');
    }

    public static function generatePatientNumber()
    {
        // Use today's date instead of admission date
        $today = now();
        $yy = $today->format('y');  // last 2 digits, e.g. "25"

        // Find the largest patient_no starting with this year's prefix
        $maxExisting = self::where('patient_no', 'like', "{$yy}%")
            ->orderBy('patient_no', 'desc')
            ->value('patient_no');

        if ($maxExisting) {
            // Extract the sequence and increment
            $seq = intval(substr($maxExisting, 2)) + 1;
        } else {
            $seq = 1;
        }

        // Zero-pad to 4 digits (0001 → 9999)
        $seqPadded = str_pad($seq, 4, '0', STR_PAD_LEFT);

        return "{$yy}{$seqPadded}";
    }

    public function admissions()
    {
        return $this->hasMany(PatientAdmission::class, 'patient_id');
    }

    public function discharges()
    {
        return $this->hasMany(PatientDischarge::class, 'patient_id');
    }

    public function activeCall()
    {
        return $this->hasOne(ActiveCall::class, 'patient_id');
    }
}
