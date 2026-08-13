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
            $table->enum('status', ['active', 'restricted', 'blocked', 'silently_blocked'])
                ->default('active')
                ->after('is_active');
            $table->text('status_reason')->nullable()->after('status');
            $table->timestamp('status_changed_at')->nullable()->after('status_reason');
            $table->foreignId('status_changed_by')->nullable()->after('status_changed_at')
                ->constrained('users')->nullOnDelete();
            $table->timestamp('phone_verified_at')->nullable()->after('phone');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('status_changed_by');
            $table->dropColumn(['status', 'status_reason', 'status_changed_at', 'phone_verified_at']);
        });
    }
};
