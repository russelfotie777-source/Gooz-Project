<?php

namespace App\Http\Controllers;

use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class BrandController extends Controller
{
    // Changes only through the admin panel (Admin\BrandController), which
    // forgets this key on every create/update/delete.
    public const CACHE_KEY = 'public:brands';

    public function index(): AnonymousResourceCollection
    {
        // Array, not the Collection itself — see CategoryController::index()
        // for why (unserializing cached Eloquent models can hit a class-
        // loading timing issue).
        $brands = Brand::hydrate(
            Cache::remember(
                self::CACHE_KEY,
                3600,
                fn () => Brand::query()->where('is_active', true)->get()->toArray()
            )
        );

        return BrandResource::collection($brands);
    }

    public function show(Brand $brand): BrandResource
    {
        return new BrandResource($brand);
    }
}
