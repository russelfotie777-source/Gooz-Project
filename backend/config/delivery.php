<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Delivery fee pricing (XAF)
    |--------------------------------------------------------------------------
    |
    | Distance is computed as the crow-flies distance (Haversine formula)
    | between the customer's GPS coordinates and the nearest active
    | warehouse. Tuned for intra-city delivery in Douala — a moto delivery
    | rarely costs more than a couple thousand XAF within the city, hence
    | the max_fee cap.
    |
    */

    'base_fee' => (float) env('DELIVERY_BASE_FEE', 500),

    'free_radius_km' => (float) env('DELIVERY_FREE_RADIUS_KM', 2),

    'price_per_km' => (float) env('DELIVERY_PRICE_PER_KM', 150),

    'free_item_count' => (int) env('DELIVERY_FREE_ITEM_COUNT', 3),

    'price_per_extra_item' => (float) env('DELIVERY_PRICE_PER_EXTRA_ITEM', 100),

    'min_fee' => (float) env('DELIVERY_MIN_FEE', 800),

    'max_fee' => (float) env('DELIVERY_MAX_FEE', 5000),

];
