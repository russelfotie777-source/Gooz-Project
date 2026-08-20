<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\CompanyProfile\UpdateCompanyProfileRequest;
use App\Http\Resources\CompanyProfileResource;
use App\Models\CompanyProfile;

/**
 * Singleton resource: there is exactly one company profile. No index/store/destroy.
 */
class CompanyProfileController extends Controller
{
    public function show(): CompanyProfileResource
    {
        return new CompanyProfileResource(CompanyProfile::current());
    }

    public function update(UpdateCompanyProfileRequest $request): CompanyProfileResource
    {
        $profile = CompanyProfile::current();
        $profile->update($request->validated());

        return new CompanyProfileResource($profile->fresh());
    }
}
