<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Category\StoreCategoryRequest;
use App\Http\Requests\Category\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function store(StoreCategoryRequest $request): CategoryResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image'] = Storage::disk('public')->url(
                $request->file('image')->store('categories', 'public')
            );
        }

        $category = Category::create($data);

        return new CategoryResource($category->fresh());
    }

    public function update(UpdateCategoryRequest $request, Category $category): CategoryResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $this->deleteImageFile($category);

            $data['image'] = Storage::disk('public')->url(
                $request->file('image')->store('categories', 'public')
            );
        } else {
            // No new file in this request: never let the "image" key here
            // (validated as null when absent) wipe out the existing image.
            unset($data['image']);
        }

        $category->update($data);

        return new CategoryResource($category->fresh());
    }

    public function destroy(Category $category)
    {
        $this->deleteImageFile($category);

        $category->delete();

        return response()->json(null, 204);
    }

    private function deleteImageFile(Category $category): void
    {
        if ($category->image) {
            Storage::disk('public')->delete(Str::after($category->image, '/storage/'));
        }
    }
}
