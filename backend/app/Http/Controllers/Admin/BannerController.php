<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Banner\StoreBannerRequest;
use App\Http\Requests\Banner\UpdateBannerRequest;
use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BannerController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $banners = Banner::query()->with('product')->orderBy('position')->get();

        return BannerResource::collection($banners);
    }

    public function show(Banner $banner): BannerResource
    {
        return new BannerResource($banner->load('product'));
    }

    public function store(StoreBannerRequest $request): BannerResource
    {
        $data = $request->validated();

        $data['image'] = Storage::disk('public')->url(
            $request->file('image')->store('banners', 'public')
        );
        $data['position'] = ((int) Banner::max('position')) + 1;

        $banner = Banner::create($data);

        return new BannerResource($banner->fresh('product'));
    }

    public function update(UpdateBannerRequest $request, Banner $banner): BannerResource
    {
        $data = $request->validated();

        if ($request->hasFile('image')) {
            $this->deleteImageFile($banner);

            $data['image'] = Storage::disk('public')->url(
                $request->file('image')->store('banners', 'public')
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
