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
        Schema::table('app_promo_settings', function (Blueprint $table) {
            // Moved to app_promo_images — the widget now shows a rotating
            // set of images (like the other banner slots) instead of one.
            // This table is left as the master on/off switch only.
            $table->dropColumn('image');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_promo_settings', function (Blueprint $table) {
            $table->string('image')->nullable();
        });
    }
};
