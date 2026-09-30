<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HomepageAd\UpdateHomepageAdSettingRequest;
use App\Http\Resources\HomepageAdSettingResource;
use App\Models\HomepageAdSetting;

/**
 * Singleton resource: there is exactly one homepage-ad configuration
 * (which product FlashSacrificeCard/MysteryBoxCard feature). No
 * index/store/destroy.
 */
class HomepageAdSettingController extends Controller
{
    private const WITH = [
        'flashSacrificeProduct.images',
        'flashSacrificeProduct.variants',
        'mysteryBoxProduct.images',
        'mysteryBoxProduct.variants',
    ];

    public function show(): HomepageAdSettingResource
    {
        return new HomepageAdSettingResource(HomepageAdSetting::current()->load(self::WITH));
    }

    public function update(UpdateHomepageAdSettingRequest $request): HomepageAdSettingResource
    {
        $setting = HomepageAdSetting::current();
        $setting->update($request->validated());

        return new HomepageAdSettingResource($setting->fresh()->load(self::WITH));
    }
}
