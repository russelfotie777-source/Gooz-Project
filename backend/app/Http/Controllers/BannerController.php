<?php

namespace App\Http\Controllers;

use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BannerController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $banners = Banner::query()
            ->where('is_active', true)
            ->orderBy('position')
            ->get();

        return BannerResource::collection($banners);
    }
}
