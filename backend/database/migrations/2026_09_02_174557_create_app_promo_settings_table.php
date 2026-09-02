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
        Schema::create('app_promo_settings', function (Blueprint $table) {
            $table->id();
            // Singleton row (see AppPromoSetting::current()) — the corner
            // widget's copy ("Téléchargez l'application...") is fixed in the
            // frontend component itself, not stored here. The admin only
            // controls whether it shows at all and an optional illustration.
            $table->boolean('is_active')->default(true);
            $table->string('image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('app_promo_settings');
    }
};
