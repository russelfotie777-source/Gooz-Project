<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Minimal client for FCM's HTTP v1 API: signs the service-account JWT
 * ourselves and exchanges it for a cached OAuth2 access token, then POSTs
 * messages directly. Deliberately avoids the kreait/firebase-php SDK — that
 * package pulls in the full Google Cloud PHP SDK (Storage, gRPC, ~25
 * packages) for Firestore/Storage/RemoteConfig features this app never
 * uses. Sending a message only needs Guzzle (already a Laravel dependency)
 * and PHP's built-in openssl extension.
 */
class FirebaseMessaging
{
    private const TOKEN_CACHE_KEY = 'firebase_fcm_access_token';

    private const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

    private array $credentials;

    public function __construct()
    {
        $path = config('services.firebase.credentials');

        if (! is_string($path) || ! is_file($path)) {
            throw new RuntimeException("Firebase credentials file not found at [{$path}].");
        }

        $this->credentials = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
    }

    /**
     * @return array{success: bool, invalidToken: bool}
     */
    public function send(string $deviceToken, string $title, string $body, array $data = []): array
    {
        $projectId = $this->credentials['project_id'];

        $response = Http::withToken($this->accessToken())
            ->post("https://fcm.googleapis.com/v1/projects/{$projectId}/messages:send", [
                'message' => [
                    'token' => $deviceToken,
                    'notification' => [
                        'title' => $title,
                        'body' => $body,
                    ],
                    'data' => array_map('strval', $data),
                ],
            ]);

        if ($response->successful()) {
            return ['success' => true, 'invalidToken' => false];
        }

        // FCM returns these when the token is stale/uninstalled — the
        // caller should stop retrying and delete it.
        $status = data_get($response->json(), 'error.status');
        $invalidToken = in_array($status, ['NOT_FOUND', 'UNREGISTERED', 'INVALID_ARGUMENT'], true);

        if (! $invalidToken) {
            Log::warning('fcm_send_failed', [
                'status' => $response->status(),
                'body' => $response->json(),
            ]);
        }

        return ['success' => false, 'invalidToken' => $invalidToken];
    }

    private function accessToken(): string
    {
        return Cache::remember(self::TOKEN_CACHE_KEY, now()->addMinutes(50), function () {
            $now = time();

            $jwt = $this->signedJwt([
                'iss' => $this->credentials['client_email'],
                'scope' => self::SCOPE,
                'aud' => $this->credentials['token_uri'],
                'iat' => $now,
                'exp' => $now + 3600,
            ]);

            $response = Http::asForm()->post($this->credentials['token_uri'], [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $jwt,
            ]);

            if (! $response->successful()) {
                throw new RuntimeException('Unable to obtain a Firebase access token: '.$response->body());
            }

            return $response->json('access_token');
        });
    }

    private function signedJwt(array $claims): string
    {
        $header = $this->base64UrlEncode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
        $payload = $this->base64UrlEncode(json_encode($claims));
        $unsigned = "{$header}.{$payload}";

        openssl_sign($unsigned, $signature, $this->credentials['private_key'], 'SHA256');

        return "{$unsigned}.".$this->base64UrlEncode($signature);
    }

    private function base64UrlEncode(string $value): string
    {
        return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
    }
}
