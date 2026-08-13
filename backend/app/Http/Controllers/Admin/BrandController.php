<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Brand\StoreBrandRequest;
use App\Http\Requests\Brand\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $brands = Brand::query()
            ->when($request->query('q'), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate($perPage);

        return BrandResource::collection($brands);
    }

    public function store(StoreBrandRequest $request): BrandResource
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $data['logo'] = Storage::disk('public')->url(
                $request->file('logo')->store('brands', 'public')
            );
        }

        $brand = Brand::create($data);

        return new BrandResource($brand->fresh());
    }

    public function update(UpdateBrandRequest $request, Brand $brand): BrandResource
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $this->deleteLogoFile($brand);

            $data['logo'] = Storage::disk('public')->url(
                $request->file('logo')->store('brands', 'public')
            );
        } else {
            // No new file in this request: never let the "logo" key here
            // (validated as null when absent) wipe out the existing logo.
            unset($data['logo']);
        }

        $brand->update($data);

        return new BrandResource($brand->fresh());
    }

    public function destroy(Brand $brand)
    {
        $this->deleteLogoFile($brand);

        $brand->delete();

        return response()->json(null, 204);
    }

    private function deleteLogoFile(Brand $brand): void
    {
        if ($brand->logo) {
            Storage::disk('public')->delete(Str::after($brand->logo, '/storage/'));
        }
    }
}
