<?php

namespace App\Http\Controllers;

use App\Http\Requests\Cart\AddCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\Stock;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class CartController extends Controller
{
    public function index(Request $request): CartResource
    {
        return new CartResource($this->activeCart($request)->load(['items.product.brand', 'items.variant']));
    }

    public function addItem(AddCartItemRequest $request): CartResource
    {
        $product = Product::findOrFail($request->validated('product_id'));

        if (! $product->is_active) {
            throw ValidationException::withMessages([
                'product_id' => ['Ce produit n\'est plus disponible.'],
            ]);
        }

        $variantId = $request->validated('product_variant_id');

        if ($variantId && $product->variants()->whereKey($variantId)->doesntExist()) {
            throw ValidationException::withMessages([
                'product_variant_id' => ['Cette variante n\'appartient pas à ce produit.'],
            ]);
        }

        $cart = $this->activeCart($request);

        $cartItem = CartItem::firstOrNew([
            'cart_id' => $cart->id,
            'product_id' => $product->id,
            'product_variant_id' => $variantId,
        ]);

        $newQuantity = $cartItem->exists
            ? $cartItem->quantity + $request->validated('quantity')
            : $request->validated('quantity');

        $this->assertStockAvailable($product->id, $variantId, $newQuantity);

        $cartItem->quantity = $newQuantity;
        $cartItem->save();

        return new CartResource($cart->load(['items.product.brand', 'items.variant']));
    }

    public function updateItem(UpdateCartItemRequest $request, CartItem $cartItem): CartResource
    {
        $this->authorizeOwnership($request, $cartItem);

        $this->assertStockAvailable(
            $cartItem->product_id,
            $cartItem->product_variant_id,
            $request->validated('quantity')
        );

        $cartItem->update(['quantity' => $request->validated('quantity')]);

        return new CartResource($cartItem->cart->load(['items.product.brand', 'items.variant']));
    }

    public function removeItem(Request $request, CartItem $cartItem)
    {
        $this->authorizeOwnership($request, $cartItem);

        $cartItem->delete();

        return response()->json(null, 204);
    }

    public function clear(Request $request)
    {
        $this->activeCart($request)->items()->delete();

        return response()->json(null, 204);
    }

    private function activeCart(Request $request): Cart
    {
        return $request->user()->carts()->firstOrCreate(['is_active' => true]);
    }

    private function authorizeOwnership(Request $request, CartItem $cartItem): void
    {
        abort_if($cartItem->cart->user_id !== $request->user()->id, 403);
    }

    private function assertStockAvailable(int $productId, ?int $variantId, int $requestedQuantity): void
    {
        $available = Stock::query()
            ->where('product_id', $productId)
            ->when(
                $variantId,
                fn ($q) => $q->where('product_variant_id', $variantId),
                fn ($q) => $q->whereNull('product_variant_id')
            )
            ->get()
            ->sum(fn (Stock $stock) => $stock->quantity_available - $stock->quantity_reserved);

        if ($requestedQuantity > $available) {
            throw ValidationException::withMessages([
                'quantity' => ["Stock insuffisant. Disponible : {$available}."],
            ]);
        }
    }
}
