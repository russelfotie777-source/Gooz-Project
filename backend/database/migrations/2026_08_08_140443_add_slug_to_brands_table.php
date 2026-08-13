<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        foreach (DB::table('brands')->select('id', 'name')->get() as $brand) {
            DB::table('brands')->where('id', $brand->id)->update(['slug' => Str::slug($brand->name)]);
        }

        DB::statement('ALTER TABLE brands MODIFY slug VARCHAR(255) NOT NULL');
        DB::statement('ALTER TABLE brands ADD UNIQUE brands_slug_unique (slug)');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('brands', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
