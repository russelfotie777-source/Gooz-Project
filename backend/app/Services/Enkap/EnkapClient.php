<?php

namespace App\Services\Enkap;

use Closure;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Thin HTTP client for Maviance's Enkap payment gateway. Handles the
 * client-credentials token exchange (cached) and prefixes API calls with
 * the configured (live or sandbox) host — see the comment on
 * config('services.enkap') for why this doesn't match the WSO2 devportal's
 * own OpenAPI export.
 */
class EnkapClient
{
    private const TOKEN_CACHE_KEY = 'enkap_access_token';

    // Every resource path is served under this prefix — confirmed against
    // the real camoo/enkap-oauth SDK and live-tested. Only /token sits
    // directly on the host, with no prefix.
    private const API_PREFIX = '/purchase/v1.2';

    private function baseUrl(): string
    {
        return config('services.enkap.sandbox')
            ? config('services.enkap.sandbox_url')
            : config('services.enkap.live_url');
    }

    private function tokenCacheKey(): string
    {
        return self::TOKEN_CACHE_KEY.(config('services.enkap.sandbox') ? '_sandbox' : '_live');
    }

    public function accessToken(): string
    {
        return Cache::remember($this->tokenCacheKey(), now()->addMinutes(55), function () {
            $response = Http::asForm()
                ->withBasicAuth(config('services.enkap.consumer_key'), config('services.enkap.consumer_secret'))
                ->post($this->baseUrl().'/token', [
                    'grant_type' => 'client_credentials',
                ]);

            if (! $response->successful()) {
                throw new RuntimeException('Unable to obtain an Enkap access token: '.$response->body());
            }

            return $response->json('access_token');
        });
    }

    public function get(string $path, array $query = []): Response
    {
        return $this->requestWithRetry(
            fn (string $token) => Http::withToken($token)->acceptJson()->get($this->baseUrl().self::API_PREFIX.$path, $query)
        );
    }

    public function post(string $path, array $body, array $headers = []): Response
    {
        return $this->requestWithRetry(
            fn (string $token) => Http::withToken($token)->acceptJson()->withHeaders($headers)
                ->post($this->baseUrl().self::API_PREFIX.$path, $body)
        );
    }

    public function delete(string $path): Response
    {
        return $this->requestWithRetry(
            fn (string $token) => Http::withToken($token)->acceptJson()->delete($this->baseUrl().self::API_PREFIX.$path)
        );
    }

    /**
     * Enkap's gateway has occasionally rejected a token as an "Invalid JWT
     * token" mere minutes after it was issued and successfully used —
     * observed live, not a caching bug on our end (a freshly re-fetched
     * token works immediately after). Rather than surface that flakiness to
     * every caller, treat any 401 as "the cached token is bad": drop it and
     * retry once with a newly-issued one before giving up.
     */
    private function requestWithRetry(Closure $send): Response
    {
        $response = $send($this->accessToken());

        if ($response->status() === 401) {
            Cache::forget($this->tokenCacheKey());
            $response = $send($this->accessToken());
        }

        return $response;
    }
}
