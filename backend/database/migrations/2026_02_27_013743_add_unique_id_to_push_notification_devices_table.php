<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('push_notification_devices', function (Blueprint $table) {
            $table->string('unique_id')->nullable()->after('device_token')->unique();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('push_notification_devices', function (Blueprint $table) {
            $table->dropUnique(['unique_id']);
            $table->dropColumn('unique_id');
        });
    }
};
