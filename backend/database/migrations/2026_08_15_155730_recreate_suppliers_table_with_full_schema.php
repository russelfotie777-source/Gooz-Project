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
        Schema::dropIfExists('suppliers');

        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('contact_name');
            $table->string('email')->nullable()->unique();
            $table->string('phone');
            $table->string('pays')->default('Cameroun');
            $table->string('numero_fiscal')->nullable();
            $table->text('adresse');
            $table->text('notes')->nullable();
            $table->enum('type', ['local', 'international'])->default('local');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');

        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('company_name');
            $table->string('contact_name')->nullable();
            $table->string('phone');
            $table->string('email')->unique();
            $table->enum('type', ['local', 'international'])->default('local');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }
};
