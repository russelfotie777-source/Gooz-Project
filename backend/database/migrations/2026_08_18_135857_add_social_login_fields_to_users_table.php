<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
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
        // provide it. Raw SQL because changing an existing column's
        // nullability via Schema::table()->change() requires doctrine/dbal,
        // which this project doesn't otherwise need.
        DB::statement('ALTER TABLE users MODIFY phone VARCHAR(255) NULL');

        Schema::table('users', function (Blueprint $table) {
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
        });

        DB::statement('ALTER TABLE users MODIFY phone VARCHAR(255) NOT NULL');
    }
};
