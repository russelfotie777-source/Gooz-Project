<?php

namespace App\Http\Controllers;

use App\Http\Resources\NeighborhoodResource;
use App\Models\Neighborhood;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NeighborhoodController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'city_id' => ['sometimes', 'integer', 'exists:cities,id'],
        ]);

        $query = Neighborhood::query()->orderBy('name');

        if ($cityId = $request->query('city_id')) {
            $query->where('city_id', $cityId);
        }

        return NeighborhoodResource::collection($query->get());
    }
}
