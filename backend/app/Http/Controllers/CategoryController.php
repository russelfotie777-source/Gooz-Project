<?php

namespace App\Http\Controllers;

use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class CategoryController extends Controller
{
    // Changes only through the admin panel (Admin\CategoryController), which
    // forgets this key on every create/update/delete — safe to cache for a
    // while instead of hitting the DB on every page load.
    public const CACHE_KEY = 'public:categories';

    public function index(): AnonymousResourceCollection
    {
        // Cached as a plain array, not the Eloquent Collection itself —
        // unserializing a cached Collection of models can hit a class-
        // loading timing issue ("tried to call a method on an incomplete
        // object") depending on what's already autoloaded when the cache is
        // read. Model::hydrate() turns the array back into real models
        // without ever going through PHP's object (un)serialization.
        $categories = Category::hydrate(
            Cache::remember(
                self::CACHE_KEY,
                3600,
                fn () => Category::query()->where('is_active', true)->get()->toArray()
            )
        );

        return CategoryResource::collection($categories);
    }

    public function show(Category $category): CategoryResource
    {
        if (! $category->is_active) {
            throw new NotFoundHttpException;
        }

        return new CategoryResource($category);
    }
}
