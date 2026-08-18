<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'enkap' => [
        // Maviance's e-commerce payment gateway (WSO2-fronted OAuth2 API,
        // distinct from the older Smobilpay S3P agent API). See
        // App\Services\Enkap\EnkapClient / EnkapPaymentService.
        //
        // The WSO2 devportal's own OpenAPI export is misleading here (it
        // advertises host "api.enkap-staging.maviance.info" + basePath
        // "/payment/v1" for both environments) — confirmed against the real
        // camoo/enkap-oauth SDK (the one Maviance's own WooCommerce plugin
        // ships) and live-tested end to end: LIVE and SANDBOX are different
        // hosts, and every resource path (other than /token) is actually
        // prefixed with /purchase/v1.2, not /payment/v1. See
        // EnkapClient::API_PREFIX.
        'sandbox' => (bool) env('ENKAP_SANDBOX', false),
        'live_url' => env('ENKAP_LIVE_URL', 'https://api-v2.enkap.cm'),
        'sandbox_url' => env('ENKAP_SANDBOX_URL', 'https://api.enkap-staging.maviance.info'),
        'consumer_key' => env('ENKAP_CONSUMER_KEY'),
        'consumer_secret' => env('ENKAP_CONSUMER_SECRET'),
        // Value for the required x-dev-smobilpal-merchant header on order
        // creation — confirmed working: "itechservicessarl".
        'merchant_username' => env('ENKAP_MERCHANT_USERNAME'),
        // Configured merchant-wide on Enkap's side (not sent per-request),
        // but we still need them locally to build the routes they point to.
        'notification_url' => env('ENKAP_NOTIFICATION_URL'),
        'return_url' => env('ENKAP_RETURN_URL'),
    ],

    'firebase' => [
        // Service account JSON downloaded from Firebase Console > Project
        // Settings > Service Accounts > Generate new private key. Used to
        // sign the OAuth2 JWT-bearer assertion for FCM's HTTP v1 API — see
        // App\Services\FirebaseMessaging. Not web-accessible: lives under
        // storage/app, which Laravel never serves directly.
        'credentials' => env('FIREBASE_CREDENTIALS', storage_path('app/firebase/service-account.json')),
    ],

];
