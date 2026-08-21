<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Banner\StoreBannerRequest;
use App\Http\Requests\Banner\UpdateBannerRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use App\Services\ImageResizer;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BannerController extends Controller
{
    // Hero banners are full-bleed, so they get more headroom than a
    // category/brand thumbnail — see the performance audit's #1 finding.
    private const IMAGE_MAX_WIDTH = 1600;

    public function index(): AnonymousResourceCollection
    {
        $banners = Banner::query()->with('product')->orderBy('position')->get();

        return BannerResource::collection($banners);
    }

    public function show(Banner $banner): BannerResource
    {
        return new BannerResource($banner->load('product'));
    }

    public function store(StoreBannerRequest $request, ImageResizer $resizer): BannerResource
    {
        $data = $request->validated();

        $data['image'] = Storage::disk('public')->url(
            $resizer->resizeAndStore($request->file('image'), 'banners', self::IMAGE_MAX_WIDTH)
        );
        $data['position'] = ((int) Banner::max('position')) + 1;

        $banner = Banner::create($data);

        return new BannerResource($banner->fresh('product'));
    }

    public function update(UpdateBannerRequest $request, Banner $banner, ImageResizer $resizer): BannerResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $this->deleteImageFile($banner);

            $data['image'] = Storage::disk('public')->url(
                $resizer->resizeAndStore($request->file('image'), 'banners', self::IMAGE_MAX_WIDTH)
            );
        } else {
            // No new file in this request: never let the "image" key here
            // (validated as null when absent) wipe out the existing image.
            unset($data['image']);
        }

        $banner->update($data);

        return new BannerResource($banner->fresh('product'));
    }

    public function destroy(Banner $banner)
    {
        $this->deleteImageFile($banner);

        $banner->delete();

        return response()->json(null, 204);
    }

    private function deleteImageFile(Banner $banner): void
    {
        if ($banner->image) {
            Storage::disk('public')->delete(Str::after($banner->image, '/storage/'));
        }
    }
}
