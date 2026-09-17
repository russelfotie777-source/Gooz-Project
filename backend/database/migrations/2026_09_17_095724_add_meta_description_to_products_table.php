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
            // Distinct from `description` (the long on-page text): a short,
            // search-snippet-optimized summary for <meta name="description">
            // and Open Graph. Falls back to `description` when empty — see
            // generateMetadata() in frontend's products/[id]/page.tsx.
            $table->string('meta_description', 300)->nullable()->after('description');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('meta_description');
        });
    }
};
