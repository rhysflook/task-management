<?php
namespace App\Enums;

use App\Models\Patient;

enum PatientStatus: int
{
    case ADMITTED = 2; // 入所中
    case DISCHARGED = 4;  // 退所済み
    case VACANT = 1;   // 外出中
    case OUTING = 3; // 空床
    
    public function label(): string
    {
        return match($this) {
            PatientStatus::VACANT => '空床',
            PatientStatus::ADMITTED => '入所',
            PatientStatus::DISCHARGED => '退所',
            PatientStatus::OUTING => '外出',
        };
    }
}