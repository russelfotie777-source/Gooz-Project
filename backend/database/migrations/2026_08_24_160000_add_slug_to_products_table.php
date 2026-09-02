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
        Schema::table('products', function (Blueprint $table) {
            $table->string('slug')->nullable()->after('name');
        });

        // Unlike brands/categories, product names aren't validated unique
        // (two products can legitimately share a name across categories), so
        // the backfill has to guard against collisions itself — appends
        // -2, -3... to whichever row loses the race, in id order.
        $usedSlugs = [];

        foreach (DB::table('products')->select('id', 'name')->orderBy('id')->get() as $product) {
            $base = Str::slug($product->name);
            $slug = $base;
            $suffix = 2;

            while (in_array($slug, $usedSlugs, true)) {
                $slug = "{$base}-{$suffix}";
                $suffix++;
            }

            $usedSlugs[] = $slug;
            DB::table('products')->where('id', $product->id)->update(['slug' => $slug]);
        }

        // NOT NULL tightening is MySQL-only DDL; the unique index itself
        // (unlike a column-type change) doesn't need doctrine/dbal and works
        // identically on SQLite via the portable Schema builder below.
        if (DB::connection()->getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE products MODIFY slug VARCHAR(255) NOT NULL');
        }

        Schema::table('products', function (Blueprint $table) {
            $table->unique('slug');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('slug');
        });
    }
};
