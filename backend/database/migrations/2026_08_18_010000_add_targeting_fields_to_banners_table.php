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
            $table->text('description')->nullable()->after('title');
            $table->enum('link_type', ['external', 'product'])->default('external')->after('link_url');
            $table->foreignId('product_id')->nullable()->after('link_type')->constrained()->nullOnDelete();
            $table->enum('location', ['homepage', 'category', 'search', 'checkout'])->default('homepage')->after('product_id');
            $table->timestamp('starts_at')->nullable()->after('location');
            $table->timestamp('ends_at')->nullable()->after('starts_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropConstrainedForeignId('product_id');
            $table->dropColumn(['description', 'link_type', 'location', 'starts_at', 'ends_at']);
        });
    }
};
