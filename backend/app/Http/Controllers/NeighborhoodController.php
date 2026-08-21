<?php

namespace App\Http\Controllers;

use App\Http\Resources\NeighborhoodResource;
use App\Models\Neighborhood;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class NeighborhoodController extends Controller
{
    // Cached whole (not per city_id) so there's a single key to forget on
    // mutation instead of tracking one per city — the list stays small
    // enough that filtering the cached collection in memory is cheap.
    public const CACHE_KEY = 'public:neighborhoods';

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'city_id' => ['sometimes', 'integer', 'exists:cities,id'],
        ]);

        // Array, not the Collection itself — see CategoryController::index()
        // for why.
        $neighborhoods = Neighborhood::hydrate(
            Cache::remember(
                self::CACHE_KEY,
                3600,
                fn () => Neighborhood::query()->orderBy('name')->get()->toArray()
            )
        );

        if ($cityId = $request->query('city_id')) {
            $neighborhoods = $neighborhoods->where('city_id', (int) $cityId)->values();
        }

        return NeighborhoodResource::collection($neighborhoods);
    }
}
