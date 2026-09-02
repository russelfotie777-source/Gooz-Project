<?php

namespace App\Http\Controllers;

use App\Http\Resources\AppPromoImageResource;
use App\Models\AppPromoImage;
use App\Models\AppPromoSetting;
use Illuminate\Http\JsonResponse;

class AppPromoController extends Controller
{
    // No natural Eloquent relation between the two (AppPromoImage is a flat,
    // globally-scoped list, same as Announcement) — combined by hand here
    // rather than forcing an artificial foreign key just to use a Resource.
    public function show(): JsonResponse
    {
        $setting = AppPromoSetting::current();
        $images = AppPromoImage::where('is_active', true)->orderBy('position')->get();

        return response()->json([
            'data' => [
                'is_active' => $setting->is_active,
                'images' => AppPromoImageResource::collection($images),
            ],
        ]);
    }
}
