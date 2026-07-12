<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProductController extends Controller
{
    private const SORTABLE_COLUMNS = ['created_at', 'base_price', 'name'];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::query()
            ->with(['brand', 'category', 'images'])
            ->where('is_active', true);

        if ($categoryId = $request->query('category_id')) {
            $query->where('category_id', $categoryId);
        }

        if ($brandId = $request->query('brand_id')) {
            $query->where('brand_id', $brandId);
        }

        if ($request->boolean('is_promotion', false)) {
            $query->where('is_promotion', true);
        }

        if ($search = $request->query('q')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('reference', 'like', "%{$search}%");
            });
        }

        if ($minPrice = $request->query('min_price')) {
            $query->where('base_price', '>=', $minPrice);
        }

        if ($maxPrice = $request->query('max_price')) {
            $query->where('base_price', '<=', $maxPrice);
        }

        $sortBy = in_array($request->query('sort_by'), self::SORTABLE_COLUMNS, true)
            ? $request->query('sort_by')
            : 'created_at';
        $sortDir = $request->query('sort_dir') === 'asc' ? 'asc' : 'desc';

        $query->orderBy($sortBy, $sortDir);

        $perPage = min((int) $request->query('per_page', 15), 50) ?: 15;

        return ProductResource::collection($query->paginate($perPage));
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): ProductResource
    {
        $product = Product::create($request->validated());

        return new ProductResource($product->fresh(['brand', 'category']));
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): ProductResource
    {
        if (! $product->is_active) {
            throw new NotFoundHttpException;
        }

        $product->load(['brand', 'category', 'images', 'variants.images', 'variants.stocks', 'stocks']);

        return new ProductResource($product);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $product->update($request->validated());

        return new ProductResource($product->fresh(['brand', 'category']));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json(null, 204);
    }
}
