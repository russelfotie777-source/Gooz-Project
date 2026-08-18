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
        Schema::table('warehouses', function (Blueprint $table) {
            $table->enum('type', ['entrepot', 'boutique'])->default('entrepot')->after('name');
            $table->string('code')->nullable()->unique()->after('type');
            $table->string('pays')->default('Cameroun')->after('region');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warehouses', function (Blueprint $table) {
            $table->dropUnique(['code']);
            $table->dropColumn(['type', 'code', 'pays']);
        });
    }
};
