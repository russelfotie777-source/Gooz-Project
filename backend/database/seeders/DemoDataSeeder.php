<?php

namespace Database\Seeders;

use App\Models\Address;
use App\Models\Coupon;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\Review;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    /**
     * Seeds realistic orders/payments/deliveries/reviews so the admin panel
     * has non-empty data to demo against. Safe to re-run: customers and the
     * delivery account are keyed by phone (firstOrCreate), orders are only
     * created if none exist yet.
     */
    public function run(): void
    {
        $customers = $this->seedCustomers();
        $this->seedAddresses($customers);
        $deliveryBoy = $this->seedDeliveryBoy();
        $warehouse = Warehouse::query()->first();
        $coupon = Coupon::query()->where('code', 'BIENVENUE10')->first();
        $products = Product::query()->with('variants')->get();

        if (Order::query()->exists()) {
            $this->command?->info('Des commandes existent déjà, DemoDataSeeder ignoré pour les commandes.');
        } else {
            $this->seedOrders($customers, $products, $warehouse, $coupon, $deliveryBoy);
        }

        $this->seedReviews($customers, $products);
    }

    /**
     * @return \Illuminate\Support\Collection<int, User>
     */
    private function seedCustomers()
    {
        $names = [
            ['name' => 'Amina Ngo Bell', 'phone' => '677010101'],
            ['name' => 'Junior Mbarga', 'phone' => '677010102'],
            ['name' => 'Chantal Fotso', 'phone' => '677010103'],
            ['name' => 'Serge Kamdem', 'phone' => '677010104'],
            ['name' => 'Odette Ateba', 'phone' => '677010105'],
            ['name' => 'Yves Nkeng', 'phone' => '677010106'],
            ['name' => 'Larissa Mballa', 'phone' => '677010107'],
            ['name' => 'Patrick Eto\'o Jr', 'phone' => '677010108'],
        ];

        return collect($names)->map(fn (array $data) => User::query()->firstOrCreate(
            ['phone' => $data['phone']],
            [
                'name' => $data['name'],
                'password' => Hash::make('Password123!'),
                'role' => 'customer',
                'is_active' => true,
            ]
        ));
    }

    /**
     * @param  \Illuminate\Support\Collection<int, User>  $customers
     */
    private function seedAddresses($customers): void
    {
        $places = [
            ['region' => 'Littoral', 'ville' => 'Douala', 'quartier' => 'Akwa'],
            ['region' => 'Littoral', 'ville' => 'Douala', 'quartier' => 'Bonapriso'],
            ['region' => 'Centre', 'ville' => 'Yaoundé', 'quartier' => 'Bastos'],
            ['region' => 'Centre', 'ville' => 'Yaoundé', 'quartier' => 'Mvan'],
            ['region' => 'Littoral', 'ville' => 'Douala', 'quartier' => 'Bonamoussadi'],
        ];

        foreach ($customers as $index => $customer) {
            if ($customer->addresses()->exists()) {
                continue;
            }

            $home = $places[$index % count($places)];

            Address::create([
                'user_id' => $customer->id,
                'label' => 'Maison',
                'recipient_name' => $customer->name,
                'recipient_phone' => $customer->phone,
                'ville' => $home['ville'],
                'region' => $home['region'],
                'quartier' => $home['quartier'],
                'address_line' => 'Rue '.(100 + $index),
                'is_default' => true,
            ]);

            if ($index % 2 === 0) {
                $work = $places[($index + 1) % count($places)];

                Address::create([
                    'user_id' => $customer->id,
                    'label' => 'Bureau',
                    'recipient_name' => $customer->name,
                    'recipient_phone' => $customer->phone,
                    'ville' => $work['ville'],
                    'region' => $work['region'],
                    'quartier' => $work['quartier'],
                    'address_line' => 'Avenue '.(200 + $index),
                    'is_default' => false,
                ]);
            }
        }
    }

    private function seedDeliveryBoy(): User
    {
        $user = User::query()->firstOrCreate(
            ['phone' => '699000099'],
            ['name' => 'Franck Livreur', 'password' => Hash::make('Password123!')]
        );

        $user->forceFill(['role' => 'delivery', 'is_active' => true])->save();

        return $user;
    }

    private function seedOrders($customers, $products, ?Warehouse $warehouse, ?Coupon $coupon, User $deliveryBoy): void
    {
        $statuses = ['en_attente', 'confirmée', 'en_préparation', 'expédiée', 'livrée', 'livrée', 'annulée'];
        $paymentMethods = ['mobile_money', 'mobile_money', 'espèces', 'carte'];
        $deliveryMethods = ['livraison', 'livraison', 'retrait'];

        for ($i = 0; $i < 22; $i++) {
            $customer = $customers->random();
            $status = $statuses[array_rand($statuses)];
            $deliveryMethod = $deliveryMethods[array_rand($deliveryMethods)];
            $createdAt = now()->subDays(random_int(0, 29))->subHours(random_int(0, 23));

            $itemCount = random_int(1, 3);
            $lines = [];
            $subtotal = 0;

            foreach ($products->random(min($itemCount, $products->count())) as $product) {
                if ($product->variants->isEmpty()) {
                    continue;
                }

                $variant = $product->variants->random();
                $quantity = random_int(1, 2);
                $unitPrice = $variant->effectivePrice();

                $subtotal += $unitPrice * $quantity;

                $lines[] = [
                    'product_id' => $product->id,
                    'product_variant_id' => $variant->id,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                ];
            }

            if (empty($lines)) {
                continue;
            }

            $useCoupon = $coupon && random_int(1, 5) === 1;
            $discount = $useCoupon ? round($subtotal * ((float) $coupon->value / 100), 2) : 0;

            $deliveryFee = $deliveryMethod === 'retrait' ? 0 : [500, 750, 1000, 1500][array_rand([500, 750, 1000, 1500])];
            $total = $subtotal - $discount + $deliveryFee;

            $order = Order::create([
                'user_id' => $customer->id,
                'coupon_id' => $useCoupon ? $coupon->id : null,
                'order_reference' => 'ORD-'.$createdAt->format('ymd').'-'.strtoupper(Str::random(6)),
                'status' => $status,
                'total_amount' => $total,
                'discount_amount' => $discount,
                'delivery_method' => $deliveryMethod,
                'warehouse_id' => $warehouse?->id,
                'delivery_fees' => $deliveryFee,
                'shipping_address' => $deliveryMethod === 'livraison' ? 'Rue '.random_int(10, 200).', Bonamoussadi' : null,
                'shipping_phone' => $customer->phone,
                'shipping_latitude' => $deliveryMethod === 'livraison' ? 4.05 + (random_int(-50, 50) / 1000) : null,
                'shipping_longitude' => $deliveryMethod === 'livraison' ? 9.7 + (random_int(-50, 50) / 1000) : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            $order->items()->createMany($lines);

            if ($useCoupon) {
                $coupon->increment('used_count');
            }

            $paymentStatus = match ($status) {
                'annulée' => random_int(0, 1) ? 'échoué' : 'remboursé',
                'en_attente' => 'en_attente',
                default => 'payé',
            };

            Payment::create([
                'order_id' => $order->id,
                'amount' => $total,
                'payment_method' => $paymentMethods[array_rand($paymentMethods)],
                'payment_status' => $paymentStatus,
                'transaction_reference' => $paymentStatus === 'payé' ? strtoupper(Str::random(10)) : null,
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);

            if ($deliveryMethod === 'livraison' && $status !== 'en_attente') {
                $deliveryStatus = match ($status) {
                    'confirmée' => 'en_attente',
                    'en_préparation' => 'pris_en_charge',
                    'expédiée' => 'en_transit',
                    'livrée' => 'livré',
                    'annulée' => 'échec',
                    default => 'en_attente',
                };

                Delivery::create([
                    'order_id' => $order->id,
                    'delivery_boy_id' => $deliveryBoy->id,
                    'delivery_status' => $deliveryStatus,
                    'tracking_code' => 'TRK-'.strtoupper(Str::random(8)),
                    'created_at' => $createdAt,
                    'updated_at' => $createdAt,
                ]);
            }
        }

        $this->command?->info('22 commandes de démonstration créées.');
    }

    private function seedReviews($customers, $products): void
    {
        if (Review::query()->count() >= 5) {
            return;
        }

        $comments = [
            'Très bonne qualité, livraison rapide !',
            'Conforme à la description, je recommande.',
            'Correct mais l\'emballage pourrait être amélioré.',
            'Excellent rapport qualité-prix.',
            'Service client réactif, produit nickel.',
            null,
        ];

        for ($i = 0; $i < 8; $i++) {
            Review::create([
                'user_id' => $customers->random()->id,
                'product_id' => $products->random()->id,
                'rating' => random_int(3, 5),
                'comment' => $comments[array_rand($comments)],
                'is_approved' => $i < 4,
            ]);
        }

        $this->command?->info('8 avis de démonstration créés (4 approuvés, 4 en attente).');
    }
}
