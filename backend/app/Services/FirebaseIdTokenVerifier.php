<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Verifies a Firebase Auth ID token (the JWT the frontend gets back from
 * signInWithPopup) without pulling in the kreait/firebase-php SDK — same
 * "just openssl + Guzzle" approach as FirebaseMessaging. Follows Google's
 * documented manual-verification procedure: check the RS256 signature
 * against Google's rotating public certs, then validate iss/aud/exp/sub.
 */
class FirebaseIdTokenVerifier
{
    private const CERTS_URL = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';

    private const CERTS_CACHE_KEY = 'firebase_id_token_certs';

    private string $projectId;

    public function __construct()
    {
        $path = config('services.firebase.credentials');

        if (! is_string($path) || ! is_file($path)) {
            throw new RuntimeException("Firebase credentials file not found at [{$path}].");
        }

        $credentials = json_decode(file_get_contents($path), true, flags: JSON_THROW_ON_ERROR);
        $this->projectId = $credentials['project_id'];
    }

    /**
     * @return array<string, mixed> the token's decoded claims (sub, name, firebase.sign_in_provider, ...)
     *
     * @throws RuntimeException if the token is malformed, expired, or fails signature/claim checks
     */
    public function verify(string $idToken): array
    {
        $parts = explode('.', $idToken);
        if (count($parts) !== 3) {
            throw new RuntimeException('Malformed ID token.');
        }

        [$headerB64, $payloadB64, $signatureB64] = $parts;

        $header = json_decode($this->base64UrlDecode($headerB64), true);
        $payload = json_decode($this->base64UrlDecode($payloadB64), true);

        if (! is_array($header) || ! is_array($payload)) {
            throw new RuntimeException('Malformed ID token.');
        }

        if (($header['alg'] ?? null) !== 'RS256') {
            throw new RuntimeException('Unexpected ID token signing algorithm.');
        }

        $cert = $this->certs()[$header['kid'] ?? ''] ?? null;
        if (! $cert) {
            throw new RuntimeException('Unknown ID token signing key.');
        }

        $publicKey = openssl_pkey_get_public($cert);
        if ($publicKey === false) {
            throw new RuntimeException('Invalid signing certificate.');
        }

        $signature = $this->base64UrlDecode($signatureB64);
        $verified = openssl_verify("{$headerB64}.{$payloadB64}", $signature, $publicKey, OPENSSL_ALGO_SHA256);

        if ($verified !== 1) {
            throw new RuntimeException('ID token signature verification failed.');
        }

        $now = time();
        $issuer = "https://securetoken.google.com/{$this->projectId}";

        if (($payload['iss'] ?? null) !== $issuer) {
            throw new RuntimeException('ID token issuer mismatch.');
        }

        if (($payload['aud'] ?? null) !== $this->projectId) {
            throw new RuntimeException('ID token audience mismatch.');
        }

        if (! isset($payload['exp']) || $payload['exp'] < $now) {
            throw new RuntimeException('ID token has expired.');
        }

        if (! isset($payload['iat']) || $payload['iat'] > $now + 60) {
            throw new RuntimeException('ID token issued in the future.');
        }

        if (empty($payload['sub'])) {
            throw new RuntimeException('ID token missing subject.');
        }

        return $payload;
    }

    /** @return array<string, string> kid => PEM certificate */
    private function certs(): array
    {
        return Cache::remember(self::CERTS_CACHE_KEY, now()->addHour(), function () {
            $response = Http::get(self::CERTS_URL);

            if (! $response->successful()) {
                throw new RuntimeException('Unable to fetch Firebase signing certificates.');
            }

            return $response->json();
        });
    }

    private function base64UrlDecode(string $value): string
    {
        $padded = str_pad($value, strlen($value) % 4 === 0 ? strlen($value) : strlen($value) + 4 - strlen($value) % 4, '=');

        return base64_decode(strtr($padded, '-_', '+/'));
    }
}
