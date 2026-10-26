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
        Schema::table('products', function (Blueprint $table) {
            // Until now, the product page's "Spécifications"/"Détails du
            // produit"/"Plus d'information" sections were just recombining
            // other fields (reference, categories, variant colors/sizes...)
            // — there was no admin-authored content type behind them at
            // all. These three let an admin set each section's content
            // directly, per product — see ProductController::store()/
            // update(), which are pure mass-assignment and need no changes
            // beyond $fillable.
            $table->json('specifications')->nullable()->after('meta_description');
            $table->text('product_details')->nullable()->after('specifications');
            $table->text('more_info')->nullable()->after('product_details');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn(['specifications', 'product_details', 'more_info']);
        });
    }
};
