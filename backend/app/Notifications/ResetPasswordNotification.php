<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// Only ever sent to User::recovery_email (phone+password accounts) — see
// User::getEmailForPasswordReset()/sendPasswordResetNotification(). Queued
// like SendPushNotificationJob (audit finding #2): mail delivery shouldn't
// block the request that triggered it.
class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private readonly string $token,
        private readonly string $phone,
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = rtrim(config('app.frontend_url'), '/').'/fr/reinitialiser-mot-de-passe?'.http_build_query([
            'token' => $this->token,
            'phone' => $this->phone,
        ]);

        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe Shopitech')
            ->greeting('Bonjour,')
            ->line('Vous recevez cet email car une demande de réinitialisation de mot de passe a été faite pour votre compte Shopitech.')
            ->action('Réinitialiser le mot de passe', $resetUrl)
            ->line('Ce lien expire dans '.config('auth.passwords.users.expire').' minutes.')
            ->line("Si vous n'êtes pas à l'origine de cette demande, aucune action n'est requise — votre mot de passe actuel reste inchangé.");
    }
}
