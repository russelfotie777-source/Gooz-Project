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
        Schema::table('users', function (Blueprint $table) {
            // MySQL drops a column's own unique index for free when the
            // column is dropped; SQLite doesn't — it refuses to drop a
            // column still referenced by an index definition ("error in
            // index users_email_unique after drop column"), which only ever
            // surfaced once the test suite started running migrations
            // against SQLite (see phpunit.xml). Dropping the index first
            // works identically on both.
            $table->dropUnique(['email']);
            $table->dropColumn(['email', 'email_verified_at']);
            $table->string('phone')->unique()->after('name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('phone');
            $table->string('email')->unique()->after('name');
            $table->timestamp('email_verified_at')->nullable()->after('email');
        });
    }
};
