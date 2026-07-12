<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $reviews = Review::query()
            ->where('is_approved', false)
            ->with(['user', 'product'])
            ->latest()
            ->paginate(20);

        return ReviewResource::collection($reviews);
    }

    public function approve(Review $review): ReviewResource
    {
        $review->update(['is_approved' => true]);

        return new ReviewResource($review->load('user'));
    }

    public function destroy(Review $review)
    {
        $review->delete();

        return response()->json(null, 204);
    }
}
