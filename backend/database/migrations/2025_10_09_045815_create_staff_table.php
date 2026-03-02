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
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->smallInteger('staff_id');
            $table->string('name');
            $table->smallInteger('gender');
            $table->string('password');
            $table->uuid('unit_id');
            $table->foreign('unit_id')->references('id')->on('units')->nullOnDelete();
            $table->integer('data_creator_id');
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff');
    }
};
