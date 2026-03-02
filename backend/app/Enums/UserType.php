<?php
namespace App\Enums;

enum UserType: int
{
    case CARE_STAFF = 1;
    case NURSE = 2;
    case OFFICE_STAFF = 3;
    case ADMIN = 9;
    case SUPERUSER = 99;

    public function getLabel(): string
    {
        return match($this) {
            UserType::CARE_STAFF => '介護スタッフ',
            UserType::NURSE => '看護師',
            UserType::OFFICE_STAFF => '事務職',
            UserType::ADMIN => 'システム管理者',
            UserType::SUPERUSER => 'メディアシステム',
        };
    }

}