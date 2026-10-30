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
        // Stores the full URL (same convention as Brand::logo), not a bare
        // path — see ImageResizer::resizeAndStore()/pathFromUrl(). Null
        // means "use the app's default placeholder avatar", decided
        // frontend-side.
        Schema::table('users', function (Blueprint $table) {
            $table->string('avatar')->nullable()->after('recovery_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('avatar');
        });
    }
};
