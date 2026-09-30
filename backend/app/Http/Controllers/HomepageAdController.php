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
            'flashSacrificeProduct.variants',
            'mysteryBoxProduct.images',
            'mysteryBoxProduct.variants',
        ]));
    }
}
