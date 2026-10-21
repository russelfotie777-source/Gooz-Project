<?php

namespace App\Http\Controllers;

use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
use Illuminate\Database\QueryException;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class ReviewController extends Controller
{
    public function index(Product $product): AnonymousResourceCollection
    {
        $reviews = $product->reviews()
            ->where('is_approved', true)
            ->with('user')
            ->latest()
            ->paginate(15);

        return ReviewResource::collection($reviews);
    }

    public function store(StoreReviewRequest $request, Product $product): ReviewResource
    {
        // This route is public (reviews don't require an account), so unlike
        // every other authenticated endpoint there's no auth:sanctum
        // middleware to resolve $request->user() for us — done explicitly,
        // and may come back null for a genuine guest.
        $user = $request->user('sanctum');

        if ($user && $product->reviews()->where('user_id', $user->id)->exists()) {
            throw ValidationException::withMessages([
                'product_id' => ['Vous avez déjà laissé un avis sur ce produit.'],
            ]);
        }

        // The check above is "check, then act" — not safe on its own
        // against two near-simultaneous submissions (double-tap) both
        // passing it before either insert lands. The real guard is the
        // unique(user_id, product_id) DB constraint (see its migration);
        // this just turns the loser's constraint violation into the same
        // clean validation error instead of a raw 500.
        try {
            $review = $product->reviews()->create([
                'user_id' => $user?->id,
                'guest_name' => $user ? null : $request->validated('guest_name'),
                'rating' => $request->validated('rating'),
                'comment' => $request->validated('comment'),
            ]);
        } catch (QueryException $e) {
            if ($user && (int) $e->getCode() === 23000) {
                throw ValidationException::withMessages([
                    'product_id' => ['Vous avez déjà laissé un avis sur ce produit.'],
                ]);
            }

            throw $e;
        }

        return new ReviewResource($review->fresh('user'));
    }
}
