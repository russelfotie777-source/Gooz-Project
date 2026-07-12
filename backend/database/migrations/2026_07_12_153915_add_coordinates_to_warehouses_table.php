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
            $table->decimal('latitude', 10, 7)->nullable()->after('quartier');
            $table->decimal('longitude', 10, 7)->nullable()->after('latitude');
            $table->boolean('is_active')->default(true)->after('responsible_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('warehouses', function (Blueprint $table) {
            $table->dropColumn(['latitude', 'longitude', 'is_active']);
        });
    }
};
