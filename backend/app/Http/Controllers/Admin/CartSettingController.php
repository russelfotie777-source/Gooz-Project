<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CartSetting\UpdateCartSettingRequest;
use App\Http\Resources\CartSettingResource;
use App\Models\CartSetting;

/**
 * Singleton resource: there is exactly one cart-expiry configuration.
 * No index/store/destroy.
 */
class CartSettingController extends Controller
{
    public function show(): CartSettingResource
    {
        return new CartSettingResource(CartSetting::current());
    }

    public function update(UpdateCartSettingRequest $request): CartSettingResource
    {
        $setting = CartSetting::current();
        $setting->update($request->validated());

        return new CartSettingResource($setting->fresh());
    }
}
