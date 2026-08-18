<?php

namespace App\Services;

use App\Models\DeliverySetting;
use App\Models\Warehouse;
use RuntimeException;

class DeliveryFeeCalculator
{
    private const EARTH_RADIUS_KM = 6371;

    /**
     * @return array{fee: float, distance_km: float, warehouse: Warehouse}
     */
    public function calculate(float $latitude, float $longitude, int $itemCount): array
    {
        $warehouse = $this->nearestActiveWarehouse($latitude, $longitude);

        if (! $warehouse) {
            throw new RuntimeException('Aucun entrepôt actif disponible pour calculer la livraison.');
        }

        $distanceKm = $this->distanceInKm(
            $latitude,
            $longitude,
            (float) $warehouse->latitude,
            (float) $warehouse->longitude
        );

        $fee = $this->feeForDistance($distanceKm, $itemCount);

        return [
            'fee' => $fee,
            'distance_km' => round($distanceKm, 2),
            'warehouse' => $warehouse,
        ];
    }

    public function nearestActiveWarehouse(float $latitude, float $longitude): ?Warehouse
    {
        return Warehouse::query()
            ->where('is_active', true)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->get()
            ->sortBy(fn (Warehouse $warehouse) => $this->distanceInKm(
                $latitude,
                $longitude,
                (float) $warehouse->latitude,
                (float) $warehouse->longitude
            ))
            ->first();
    }

    private function feeForDistance(float $distanceKm, int $itemCount): float
    {
        $settings = DeliverySetting::current();

        $billableDistance = max(0, $distanceKm - $settings->free_radius_km);
        $extraItems = max(0, $itemCount - $settings->free_item_count);

        $fee = $settings->base_fee
            + $billableDistance * $settings->price_per_km
            + $extraItems * $settings->price_per_extra_item;

        $fee = max($fee, $settings->min_fee);
        $fee = min($fee, $settings->max_fee);

        return round($fee, 2);
    }

    private function distanceInKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $lat1Rad = deg2rad($lat1);
        $lat2Rad = deg2rad($lat2);
        $deltaLat = deg2rad($lat2 - $lat1);
        $deltaLng = deg2rad($lng2 - $lng1);

        $a = sin($deltaLat / 2) ** 2
            + cos($lat1Rad) * cos($lat2Rad) * sin($deltaLng / 2) ** 2;
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return self::EARTH_RADIUS_KM * $c;
    }
}
