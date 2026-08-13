<?php

namespace App\Http\Controllers;

use App\Http\Resources\CityResource;
use App\Models\City;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CityController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return CityResource::collection(City::query()->orderBy('name')->get());
    }
}
