<?php

namespace App\Http\Controllers;

use App\Http\Resources\HomepageAdSettingResource;
use App\Models\HomepageAdSetting;

class HomepageAdController extends Controller
{
    public function show(): HomepageAdSettingResource
    {
        return new HomepageAdSettingResource(HomepageAdSetting::current()->load([
            'flashSacrificeProduct.images',
            'flashSacrificeProduct.variants' => fn ($q) => $q->where('is_active', true),
            'mysteryBoxProduct.images',
            'mysteryBoxProduct.variants' => fn ($q) => $q->where('is_active', true),
        ]));
    }
}
