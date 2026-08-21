<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\CategoryController as PublicCategoryController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use App\Services\ImageResizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    // Shown as a card/badge image (category grid, homepage sections), never
    // full-bleed — see the performance audit's #1 finding.
    private const IMAGE_MAX_WIDTH = 800;

    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $categories = Category::query()
            ->when($request->query('q'), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate($perPage);

        return CategoryResource::collection($categories);
    }

    public function store(StoreCategoryRequest $request, ImageResizer $resizer): CategoryResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = Storage::disk('public')->url(
                $resizer->resizeAndStore($request->file('image'), 'categories', self::IMAGE_MAX_WIDTH)
            );
        }

        $category = Category::create($data);
        Cache::forget(PublicCategoryController::CACHE_KEY);

        return new CategoryResource($category->fresh());
    }

    public function update(UpdateCategoryRequest $request, Category $category, ImageResizer $resizer): CategoryResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $this->deleteImageFile($category);

            $data['image'] = Storage::disk('public')->url(
                $resizer->resizeAndStore($request->file('image'), 'categories', self::IMAGE_MAX_WIDTH)
            );
        } else {
            // No new file in this request: never let the "image" key here
            // (validated as null when absent) wipe out the existing image.
            unset($data['image']);
        }

        $category->update($data);
        Cache::forget(PublicCategoryController::CACHE_KEY);

        return new CategoryResource($category->fresh());
    }

    public function destroy(Category $category)
    {
        $this->deleteImageFile($category);

        $category->delete();
        Cache::forget(PublicCategoryController::CACHE_KEY);

        return response()->json(null, 204);
    }

    private function deleteImageFile(Category $category): void
    {
        if ($category->image) {
            Storage::disk('public')->delete(Str::after($category->image, '/storage/'));
        }
    }
}
