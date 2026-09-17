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
        Schema::table('banners', function (Blueprint $table) {
            // Some banner creatives (the graphic designer's own ad exports)
            // already bake their title/CTA into the image itself — for
            // those, the site's own scrim + title/description overlay
            // (HeroBanner.tsx) would duplicate the text and needlessly
            // darken an already-finished visual. Defaults to true so every
            // existing banner keeps rendering exactly as before.
            $table->boolean('show_overlay')->default(true)->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropColumn('show_overlay');
        });
    }
};
