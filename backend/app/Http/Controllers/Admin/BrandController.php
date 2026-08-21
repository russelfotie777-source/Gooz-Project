<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\BrandController as PublicBrandController;
use App\Http\Controllers\Controller;
use App\Http\Requests\Brand\StoreBrandRequest;
use App\Http\Requests\Brand\UpdateBrandRequest;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use App\Services\ImageResizer;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    // Logos are shown small (badges/cards) — see the performance audit's #1
    // finding.
    private const LOGO_MAX_WIDTH = 600;

    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $brands = Brand::query()
            ->when($request->query('q'), fn ($q, $search) => $q->where('name', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate($perPage);

        return BrandResource::collection($brands);
    }

    public function store(StoreBrandRequest $request, ImageResizer $resizer): BrandResource
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $data['logo'] = Storage::disk('public')->url(
                $resizer->resizeAndStore($request->file('logo'), 'brands', self::LOGO_MAX_WIDTH)
            );
        }

        $brand = Brand::create($data);
        Cache::forget(PublicBrandController::CACHE_KEY);

        return new BrandResource($brand->fresh());
    }

    public function update(UpdateBrandRequest $request, Brand $brand, ImageResizer $resizer): BrandResource
    {
        $data = $request->validated();

        if ($request->hasFile('logo')) {
            $this->deleteLogoFile($brand);

            $data['logo'] = Storage::disk('public')->url(
                $resizer->resizeAndStore($request->file('logo'), 'brands', self::LOGO_MAX_WIDTH)
            );
        } else {
            // No new file in this request: never let the "logo" key here
            // (validated as null when absent) wipe out the existing logo.
            unset($data['logo']);
        }

        $brand->update($data);
        Cache::forget(PublicBrandController::CACHE_KEY);

        return new BrandResource($brand->fresh());
    }

    public function destroy(Brand $brand)
    {
        $this->deleteLogoFile($brand);

        $brand->delete();
        Cache::forget(PublicBrandController::CACHE_KEY);

        return response()->json(null, 204);
    }

    private function deleteLogoFile(Brand $brand): void
    {
        if ($brand->logo) {
            Storage::disk('public')->delete(Str::after($brand->logo, '/storage/'));
        }
    }
}
