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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->string('patient_no');
            $table->string('name');
            $table->string('kana');
            $table->string('birth_day');
            $table->string('gender');
            $table->uuid('unit_id');
            $table->foreign('unit_id')->references('id')->on('units')->nullable()->nullOnDelete();
            $table->uuid('room_id');
            $table->foreign('room_id')->references('id')->on('rooms')->nullable()->nullOnDelete();
            $table->uuid('bed_id')->nullable();
            $table->foreign('bed_id')->references('id')->on('beds')->nullable()->nullOnDelete();
            $table->string('section');
            $table->string('admission_day');
            $table->string('discharge_day')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
