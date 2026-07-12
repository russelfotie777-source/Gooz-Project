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
        if ($product->reviews()->where('user_id', $request->user()->id)->exists()) {
            throw ValidationException::withMessages([
                'product_id' => ['Vous avez déjà laissé un avis sur ce produit.'],
            ]);
        }

        $review = $product->reviews()->create([
            'user_id' => $request->user()->id,
            'rating' => $request->validated('rating'),
            'comment' => $request->validated('comment'),
        ]);

        return new ReviewResource($review->fresh('user'));
    }
}
