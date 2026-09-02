<?php

namespace Tests\Feature;

use App\Models\Ticket;
use App\Models\User;
use App\Services\PushNotificationService;
use Tests\TestCase;

class AdminTicketStatusTest extends TestCase
{
    private function ticket(User $user): Ticket
    {
        return Ticket::create([
            'user_id' => $user->id,
            'subject' => 'Colis manquant',
            'category' => 'commande',
            'priority' => 'moyenne',
            'status' => 'ouvert',
            'message' => "Je n'ai pas reçu mon colis.",
            'created_by' => $user->id,
        ]);
    }

    public function test_updating_a_ticket_status_notifies_the_shopper_with_a_natural_label(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create();
        $ticket = $this->ticket($user);

        $this->mock(PushNotificationService::class, function ($mock) use ($user, $ticket) {
            $mock->shouldReceive('sendToUser')
                ->once()
                ->withArgs(fn ($notifiedUser, $title) => $notifiedUser->is($user) && $title === 'Ticket #'.$ticket->id);
        });

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/tickets/{$ticket->id}/status", ['status' => 'en_cours'])
            ->assertOk();

        $this->assertDatabaseHas('user_notifications', [
            'user_id' => $user->id,
            'type' => 'ticket_status',
            'title' => 'Ticket #'.$ticket->id,
            'body' => 'Votre ticket "Colis manquant" est maintenant : pris en charge.',
        ]);
    }

    public function test_a_user_without_the_manage_users_permission_cannot_update_ticket_status(): void
    {
        $staff = User::factory()->create(['role' => 'staff']);
        $ticket = $this->ticket(User::factory()->create());

        $this->actingAs($staff, 'sanctum')
            ->patchJson("/api/v1/admin/tickets/{$ticket->id}/status", ['status' => 'résolu'])
            ->assertForbidden();
    }
}
