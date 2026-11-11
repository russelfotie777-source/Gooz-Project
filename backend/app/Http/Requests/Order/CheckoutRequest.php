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

            // Not required_if: unlike quartier/ville (needed for the delivery
            // fee calculation below), the free-text street address is just a
            // courtesy detail for the delivery rider — plenty of streets in
            // this catalogue's delivery area aren't named/numbered, so
            // forcing shoppers to fill in something here only pushed them to
            // type a meaningless placeholder.
            'shipping_address' => ['nullable', 'string', 'max:500'],
            'delivery_note' => ['nullable', 'string', 'max:500'],
            'shipping_latitude' => ['required_if:delivery_method,livraison', 'nullable', 'numeric', 'between:-90,90'],
            'shipping_longitude' => ['required_if:delivery_method,livraison', 'nullable', 'numeric', 'between:-180,180'],

            'warehouse_id' => [
                'required_if:delivery_method,retrait', 'nullable', 'integer',
                Rule::exists('warehouses', 'id')->where('is_active', true),
            ],
        ];
    }
}
