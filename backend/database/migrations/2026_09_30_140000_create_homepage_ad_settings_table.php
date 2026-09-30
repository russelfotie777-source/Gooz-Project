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
        Schema::create('homepage_ad_settings', function (Blueprint $table) {
            $table->id();
            // Singleton row (see HomepageAdSetting::current()) — which real
            // product FlashSacrificeCard/MysteryBoxCard feature next to the
            // homepage hero. Both nullable: with no admin pick yet, the
            // frontend falls back to an on-sale product automatically (see
            // HomePage.tsx's featuredProduct logic) rather than showing
            // nothing. nullOnDelete rather than cascade: deleting the
            // featured product should just clear the pick, not blow away
            // this settings row.
            $table->foreignId('flash_sacrifice_product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->foreignId('mystery_box_product_id')->nullable()->constrained('products')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('homepage_ad_settings');
    }
};
