<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // shipping_address doesn't apply to "retrait" (pickup) orders, so it
        // can no longer be a required column. Raw SQL avoids a doctrine/dbal
        // dependency just for this column-type change.
        DB::statement('ALTER TABLE orders MODIFY shipping_address TEXT NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE orders MODIFY shipping_address TEXT NOT NULL');
    }
};
