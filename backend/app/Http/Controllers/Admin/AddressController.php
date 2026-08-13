<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AddressResource;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AddressController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $addresses = Address::query()
            ->with('user:id,name,phone')
            ->when($request->query('q'), fn ($q, $search) => $q->where(function ($query) use ($search) {
                $query->where('recipient_name', 'like', "%{$search}%")
                    ->orWhere('recipient_phone', 'like', "%{$search}%")
                    ->orWhere('ville', 'like', "%{$search}%");
            }))
            ->latest()
            ->paginate(20);

        return AddressResource::collection($addresses);
    }

    public function show(Address $address): AddressResource
    {
        return new AddressResource($address->load('user:id,name,phone'));
    }
}
