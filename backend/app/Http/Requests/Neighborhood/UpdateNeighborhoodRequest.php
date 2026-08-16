<?php

namespace App\Http\Requests\Neighborhood;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateNeighborhoodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $cityId = $this->input('city_id', $this->route('neighborhood')?->city_id);

        return [
            'city_id' => ['sometimes', 'required', 'integer', 'exists:cities,id'],
            'name' => [
                'sometimes', 'required', 'string', 'max:255',
                Rule::unique('neighborhoods')
                    ->where(fn ($query) => $query->where('city_id', $cityId))
                    ->ignore($this->route('neighborhood')),
            ],
            'latitude' => ['sometimes', 'required', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'required', 'numeric', 'between:-180,180'],
        ];
    }
}
