<?php
namespace App\Enums;

enum BedStatus: int
{
    case AVAILABLE = 1; // 空床
    case OCCUPIED = 2;  // 入所
    case OUTING = 3;   // 外出
    case DISCHARGED = 4; // 退所

    public function label(): string
    {
        return match($this) {
            BedStatus::AVAILABLE => '空床',
            BedStatus::OCCUPIED => '入所',
            BedStatus::OUTING => '外出',
            BedStatus::DISCHARGED => '退所',
        };
    }
}