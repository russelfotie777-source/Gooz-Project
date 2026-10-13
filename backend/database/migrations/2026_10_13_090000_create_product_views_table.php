<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_views', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            // Anonymous, client-generated (sessionStorage) — correlates
            // several products viewed in the same browsing session without
            // needing an account. Not a foreign key to anything; just a
            // grouping token.
            $table->string('session_token');
            $table->timestamp('created_at')->useCurrent();

            $table->unique(['product_id', 'session_token']);
            $table->index('session_token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_views');
    }
};
