<?php

namespace App\Http\Controllers;

use App\Http\Resources\CityResource;
use App\Models\City;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class CityController extends Controller
{
    // No admin endpoint mutates cities (seeded/managed via tinker only), so
    // there's nothing that needs to forget this key.
    public function index(): AnonymousResourceCollection
    {
        // Array, not the Collection itself — see CategoryController::index()
        // for why.
        $cities = City::hydrate(
            Cache::remember('public:cities', 3600, fn () => City::query()->orderBy('name')->get()->toArray())
        );

        return CityResource::collection($cities);
    }
}
