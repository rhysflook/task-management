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
        Schema::create('client_heartbeat', function (Blueprint $table) {
            $table->id();
            $table->string('device_id', 255);
            $table->string('status', 255);
            $table->timestamp('heartbeat_at');
            $table->text('payload');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_heartbeat');
    }
};
