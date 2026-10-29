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
        // Distinct from the existing `email` column, which is the identifier
        // for Firebase email/password accounts (login.phone@Account.password
        // is never checked for those — see AuthController::social). This one
        // is specifically an optional password-recovery contact for
        // phone+password accounts, whose real password lives in this table
        // and can't be reset through Firebase at all.
        Schema::table('users', function (Blueprint $table) {
            $table->string('recovery_email')->nullable()->unique()->after('email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('recovery_email');
        });
    }
};
