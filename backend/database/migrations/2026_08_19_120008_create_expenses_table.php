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
        Schema::create('expenses', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('payee');
            $table->foreignId('expense_account_id')->constrained('accounts')->onDelete('restrict');
            $table->foreignId('paid_from_account_id')->constrained('accounts')->onDelete('restrict');
            $table->decimal('amount', 12, 2);
            $table->string('currency')->default('XAF');
            $table->date('date');
            $table->enum('status', ['enregistrée', 'annulée'])->default('enregistrée');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('expenses');
    }
};
