<?php

namespace App\Enums;

enum TaskStatus: int
{
    case UNASSIGNED = 1;
    case ASSIGNED = 2;
    case ACTIVE = 3;
    case COMPLETED = 4;
    case ON_HOLD = 5;
    case CANCELLED = 6;
    case ARCHIVED = 7;

    public function jsonKey(): string
    {
        return match ($this) {
            self::UNASSIGNED => 'unassigned',
            self::ASSIGNED => 'assigned',
            self::ACTIVE => 'active',
            self::COMPLETED => 'completed',
            self::ON_HOLD => 'on_hold',
            self::CANCELLED => 'cancelled',
            self::ARCHIVED => 'archived',
        };
    }
}
