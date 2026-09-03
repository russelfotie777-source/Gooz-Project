<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\AppPromo\UpdateAppPromoSettingRequest;
use App\Http\Resources\AppPromoSettingResource;
use App\Models\AppPromoSetting;

class AppPromoSettingController extends Controller
{
    public function show(): AppPromoSettingResource
    {
        return new AppPromoSettingResource(AppPromoSetting::current());
    }

    public function update(UpdateAppPromoSettingRequest $request): AppPromoSettingResource
    {
        $setting = AppPromoSetting::current();
        $setting->update($request->validated());

        return new AppPromoSettingResource($setting->fresh());
    }
}
