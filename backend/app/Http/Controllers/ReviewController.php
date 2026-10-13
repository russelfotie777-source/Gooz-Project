<?php

namespace App\Http\Controllers;

use App\Http\Requests\Review\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Product;
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

        $review = $product->reviews()->create([
            'user_id' => $user?->id,
            'guest_name' => $user ? null : $request->validated('guest_name'),
            'rating' => $request->validated('rating'),
            'comment' => $request->validated('comment'),
        ]);

        return new ReviewResource($review->fresh('user'));
    }
}
