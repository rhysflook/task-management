<?php
namespace App\Services;

use Illuminate\Support\Facades\DB;

class AsteriskAccountService
{

    public static function findNextAvailableExtension(): ?string
    {
        $lastExtension = DB::table('ps_endpoints')
            ->where('id', 'like', '3%')
            ->orderBy('id', 'desc')
            ->first();

        if (!$lastExtension) {
            return '3000';
        }

        $lastNumber = (int) $lastExtension->id;
        $nextNumber = $lastNumber + 1;

        if ($nextNumber > 3999) {
            return null; // No more extensions available in the 3xxx range
        }

        return (string) $nextNumber;
    }

    public static function createAccountForExtension(): array
    {
        $extensionNumber = self::findNextAvailableExtension();
        DB::table('ps_endpoints')->insert([
            'id' => $extensionNumber,
            'transport' => 'transport-udp',
            'aors' => $extensionNumber,
            'auth' => $extensionNumber,
            'context' => 'from-ari',
            'disallow' => 'all',
            'allow' => 'ulaw,alaw',
            'rtp_symmetric' => true,
            'force_rport' => true,
            'rewrite_contact' => true,
        ]);

        DB::table('ps_aors')->insert([
            'id' => $extensionNumber,
            'max_contacts' => 1,
        ]);

        DB::table('ps_auths')->insert([
            'id' => $extensionNumber,
            'auth_type' => 'userpass',
            'username' => $extensionNumber,
            'password' => 'pass' . $extensionNumber,
        ]);

        return [
            'extension_number' => $extensionNumber,
            'pass' => 'pass' . $extensionNumber,
            'connection_ip' => '192.168.1.164',
        ];
    }
}