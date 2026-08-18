<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\DeliverySetting\UpdateDeliverySettingRequest;
use App\Http\Resources\DeliverySettingResource;
use App\Models\DeliverySetting;

/**
 * Singleton resource: there is exactly one delivery pricing configuration,
 * consumed directly by DeliveryFeeCalculator. No index/store/destroy.
 */
class DeliverySettingController extends Controller
{
    public function show(): DeliverySettingResource
    {
        return new DeliverySettingResource(DeliverySetting::current());
    }

    public function update(UpdateDeliverySettingRequest $request): DeliverySettingResource
    {
        $setting = DeliverySetting::current();
        $setting->update($request->validated());

        return new DeliverySettingResource($setting->fresh());
    }
}
