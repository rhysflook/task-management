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
        Schema::table('heartbeat_logs', function (Blueprint $table) {
            $table->string('unit')->nullable()->after('heart_rate');
            $table->string('room')->nullable()->after('unit');
            $table->string('bed')->nullable()->after('room');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('heartbeat_logs', function (Blueprint $table) {
            $table->dropColumn(['unit', 'room', 'bed']);
        });
    }
};
