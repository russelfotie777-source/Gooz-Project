<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AppPromo\StoreAppPromoImageRequest;
use App\Http\Requests\AppPromo\UpdateAppPromoImageRequest;
use App\Http\Resources\AppPromoImageResource;
use App\Models\AppPromoImage;
use App\Services\ImageResizer;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AppPromoImageController extends Controller
{
    // A small corner-widget thumbnail, not a full-bleed banner — see the
    // performance audit's #1 finding on right-sizing uploaded images.
    private const IMAGE_MAX_WIDTH = 800;

    public function index(): AnonymousResourceCollection
    {
        $images = AppPromoImage::query()->orderBy('position')->get();

        return AppPromoImageResource::collection($images);
    }

    public function store(StoreAppPromoImageRequest $request, ImageResizer $resizer): AppPromoImageResource
    {
        $data = $request->validated();

        $data['image'] = Storage::disk('public')->url(
            $resizer->resizeAndStore($request->file('image'), 'app-promo', self::IMAGE_MAX_WIDTH)
        );
        $data['position'] = ((int) AppPromoImage::max('position')) + 1;
        // Explicit, not left to the column's DB-level default(true): a
        // ->fresh() re-fetch would reflect that default correctly, but it
        // also resets wasRecentlyCreated to false, which is what Laravel
        // checks to auto-return 201 for a newly created resource.
        $data['is_active'] ??= true;

        $image = AppPromoImage::create($data);

        return new AppPromoImageResource($image);
    }

    // Toggle only — an admin swapping the picture entirely is just as well
    // served by deleting this one and adding a new one, and it keeps this
    // endpoint (and the admin UI list row) simple.
    public function update(UpdateAppPromoImageRequest $request, AppPromoImage $appPromoImage): AppPromoImageResource
    {
        $appPromoImage->update($request->validated());

        return new AppPromoImageResource($appPromoImage->fresh());
    }

    public function destroy(AppPromoImage $appPromoImage)
    {
        Storage::disk('public')->delete(Str::after($appPromoImage->image, '/storage/'));
        $appPromoImage->delete();

        return response()->json(null, 204);
    }
}
