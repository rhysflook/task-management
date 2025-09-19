<?php

namespace App\Models;

use App\Enums\TaskStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Project extends Model
{
    /** @use HasFactory<\Database\Factories\ProjectFactory> */
    use HasFactory;
    use SoftDeletes;

    protected static function booted()
    {
        static::creating(function ($project) {

            $project->user_id = auth()->id();
        });
    }

    protected $fillable = [
        'name',
        'code',
        'description',
        'user_id',
        'status',
    ];

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class);
    }

}
