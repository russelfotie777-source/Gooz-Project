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
        // Social sign-in (Google/Facebook via Firebase Auth) can create an
        // account before a phone number is known — the phone is asked for as
        // a follow-up step, since delivery needs one but Firebase doesn't
        // provide it. NOT NULL is a real constraint SQLite enforces too (a
        // MySQL-only raw ALTER MODIFY here would leave phone still NOT NULL
        // under the test suite's SQLite database — an actual schema gap, not
        // a harmless skip) — ->change() works natively on both without
        // doctrine/dbal on this Laravel version.
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->change();
            $table->string('firebase_uid')->nullable()->unique()->after('phone');
            $table->string('auth_provider')->nullable()->after('firebase_uid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['firebase_uid', 'auth_provider']);
            $table->string('phone')->nullable(false)->change();
        });
    }
};
