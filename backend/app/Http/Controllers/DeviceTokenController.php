<?php

namespace App\Http\Controllers;

use App\Http\Requests\DeviceToken\StoreDeviceTokenRequest;
use App\Models\DeviceToken;
use Illuminate\Http\Request;

class DeviceTokenController extends Controller
{
    public function store(StoreDeviceTokenRequest $request)
    {
        $token = DeviceToken::updateOrCreate(
            ['token' => $request->validated('token')],
            ['user_id' => $request->user()->id, 'platform' => $request->validated('platform')]
        );

        return response()->json(['id' => $token->id], 201);
    }

    public function destroy(Request $request)
    {
        DeviceToken::where('token', $request->string('token'))
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(null, 204);
    }
}
