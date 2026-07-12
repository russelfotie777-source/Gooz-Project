<?php

namespace App\Http\Requests\Order;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'delivery_method' => ['required', Rule::in(['livraison', 'retrait'])],
            'shipping_phone' => ['required', 'string', 'regex:/^\+?[0-9]{8,15}$/'],
            'payment_method' => ['required', Rule::in(['carte', 'mobile_money', 'paypal', 'espèces'])],
            'coupon_code' => ['nullable', 'string', 'max:50'],

            'shipping_address' => ['required_if:delivery_method,livraison', 'nullable', 'string'],
            'shipping_latitude' => ['required_if:delivery_method,livraison', 'nullable', 'numeric', 'between:-90,90'],
            'shipping_longitude' => ['required_if:delivery_method,livraison', 'nullable', 'numeric', 'between:-180,180'],

            'warehouse_id' => [
                'required_if:delivery_method,retrait', 'nullable', 'integer',
                Rule::exists('warehouses', 'id')->where('is_active', true),
            ],
        ];
    }
}
