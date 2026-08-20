<?php

namespace App\Http\Controllers;

use App\Http\Resources\BannerResource;
use App\Models\Banner;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class BannerController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $now = now();

        $banners = Banner::query()
            ->with('product')
            ->where('is_active', true)
            // The admin form collects starts_at/ends_at as a real scheduling
            // window, but nothing enforced it before — an inactive-by-date
            // banner was otherwise indistinguishable from a live one here.
            // Both columns are nullable at the DB level, so treat a null
            // bound as "no constraint" rather than excluding the row.
            ->where(fn ($q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn ($q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now))
            ->when($request->query('location'), fn ($q, $location) => $q->where('location', $location))
            ->orderBy('position')
            ->get();

        return BannerResource::collection($banners);
    }
}
