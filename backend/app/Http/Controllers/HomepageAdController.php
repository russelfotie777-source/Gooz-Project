<?php

namespace App\Http\Controllers;

use App\Http\Resources\HomepageAdSettingResource;
use App\Models\HomepageAdSetting;

class HomepageAdController extends Controller
{
    public function show(): HomepageAdSettingResource
    {
        $setting = HomepageAdSetting::current()->load([
            'flashSacrificeProduct.images',
            'flashSacrificeProduct.variants' => fn ($q) => $q->where('is_active', true),
            'mysteryBoxProduct.images',
            'mysteryBoxProduct.variants' => fn ($q) => $q->where('is_active', true),
        ]);

        // A hand-picked product deactivated since stays attached to the
        // setting — hide it instead of showing a disabled product to shoppers.
        if ($setting->flashSacrificeProduct && ! $setting->flashSacrificeProduct->is_active) {
            $setting->setRelation('flashSacrificeProduct', null);
        }
        if ($setting->mysteryBoxProduct && ! $setting->mysteryBoxProduct->is_active) {
            $setting->setRelation('mysteryBoxProduct', null);
        }

        return new HomepageAdSettingResource($setting);
    }
}
