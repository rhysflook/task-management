<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Heartbeat extends Model
{
    public function isAlive(): bool
    {
        $interval = env('IS_ALIVE_INTERVAL', 5);
        $threshold = now()->subSeconds($interval)->timestamp;
        return $this->last_heartbeat >= $threshold;
    }
}
