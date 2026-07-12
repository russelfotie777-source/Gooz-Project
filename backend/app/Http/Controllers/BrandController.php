<?php

namespace App\Http\Controllers;

use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BrandController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return BrandResource::collection(Brand::query()->where('is_active', true)->get());
    }

    public function show(Brand $brand): BrandResource
    {
        return new BrandResource($brand);
    }
}
