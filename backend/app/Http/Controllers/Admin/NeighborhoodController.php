<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Controllers\NeighborhoodController as PublicNeighborhoodController;
use App\Http\Requests\Neighborhood\StoreNeighborhoodRequest;
use App\Http\Requests\Neighborhood\UpdateNeighborhoodRequest;
use App\Http\Resources\NeighborhoodResource;
use App\Models\Neighborhood;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class NeighborhoodController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $neighborhoods = Neighborhood::query()
            ->with('city:id,name')
            ->when($request->query('city_id'), fn ($q, $cityId) => $q->where('city_id', $cityId))
            ->when($request->query('q'), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate($perPage);

        return NeighborhoodResource::collection($neighborhoods);
    }

    public function show(Neighborhood $neighborhood): NeighborhoodResource
    {
        return new NeighborhoodResource($neighborhood->load('city'));
    }

    public function store(StoreNeighborhoodRequest $request): NeighborhoodResource
    {
        $neighborhood = Neighborhood::create($request->validated());
        Cache::forget(PublicNeighborhoodController::CACHE_KEY);

        return new NeighborhoodResource($neighborhood->fresh('city'));
    }

    public function update(UpdateNeighborhoodRequest $request, Neighborhood $neighborhood): NeighborhoodResource
    {
        $neighborhood->update($request->validated());
        Cache::forget(PublicNeighborhoodController::CACHE_KEY);

        return new NeighborhoodResource($neighborhood->fresh('city'));
    }

    public function destroy(Neighborhood $neighborhood)
    {
        $neighborhood->delete();
        Cache::forget(PublicNeighborhoodController::CACHE_KEY);

        return response()->json(null, 204);
    }
}
