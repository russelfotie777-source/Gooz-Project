<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// A product used to belong to exactly one category (products.category_id).
// This introduces a pivot table so a product can belong to several
// categories, carrying over every existing product's single category as its
// first pivot row before the old column is dropped — see down() for the
// reverse (picks an arbitrary category back into the scalar column, since
// a many-to-many assignment can't always roll back losslessly).
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('category_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['category_id', 'product_id']);
        });

        DB::table('products')
            ->whereNotNull('category_id')
            ->select('id', 'category_id')
            ->orderBy('id')
            ->chunk(500, function ($products) {
                $now = now();
                $rows = $products->map(fn ($product) => [
                    'category_id' => $product->category_id,
                    'product_id' => $product->id,
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all();

                DB::table('category_product')->insert($rows);
            });

        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn('category_id');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('brand_id')->constrained()->nullOnDelete();
        });

        DB::table('category_product')
            ->select('product_id', 'category_id')
            ->orderBy('id')
            ->chunk(500, function ($rows) {
                foreach ($rows as $row) {
                    DB::table('products')
                        ->where('id', $row->product_id)
                        ->whereNull('category_id')
                        ->update(['category_id' => $row->category_id]);
                }
            });

        Schema::dropIfExists('category_product');
    }
};
