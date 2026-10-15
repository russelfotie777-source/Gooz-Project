<?php

namespace App\Http\Controllers;

use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductView;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Collection;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

class ProductController extends Controller
{
    private const SORTABLE_COLUMNS = ['created_at', 'base_price', 'name'];

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        // Pricing lives on variants now, so filters/sorts that used to touch
        // products.base_price go through the variants relation instead.
        $query = Product::query()
            ->with(['brand', 'categories', 'images', 'variants'])
            ->where('is_active', true);

        if ($categoryId = $request->query('category_id')) {
            $query->whereHas('categories', fn ($q) => $q->whereIn('categories.id', (array) $categoryId));
        }

        if ($brandId = $request->query('brand_id')) {
            $query->whereIn('brand_id', (array) $brandId);
        }

        if ($request->boolean('is_promotion', false)) {
            $query->whereHas('variants', fn ($q) => $q->where('is_promotion', true));
        }

        if ($search = trim((string) $request->query('q', ''))) {
            $query = $this->applySearch($query, $search);
        }

        if ($minPrice = $request->query('min_price')) {
            $query->whereHas('variants', fn ($q) => $q->where('base_price', '>=', $minPrice));
        }

        if ($maxPrice = $request->query('max_price')) {
            $query->whereHas('variants', fn ($q) => $q->where('base_price', '<=', $maxPrice));
        }

        if ($color = $request->query('color')) {
            $query->whereHas('variants', fn ($q) => $q->whereIn('color', (array) $color));
        }

        $sortBy = in_array($request->query('sort_by'), self::SORTABLE_COLUMNS, true)
            ? $request->query('sort_by')
            : 'created_at';
        $sortDir = $request->query('sort_dir') === 'asc' ? 'asc' : 'desc';

        if ($sortBy === 'base_price') {
            // min_price (products.min_price) is kept in sync by
            // ProductVariantObserver — sorts on an indexed column instead of
            // a correlated subquery per row (performance audit finding).
            $query->orderBy('min_price', $sortDir);
        } else {
            $query->orderBy($sortBy, $sortDir);
        }

        // The homepage catalogue and category pages fetch once and filter/sort
        // client-side rather than re-querying per filter change — a cap this
        // low silently hid anything past it, even for filters that otherwise
        // matched more products. 200 comfortably covers the current catalogue
        // size; a true server-driven paginated catalogue is the real fix once
        // the product count grows enough for that to matter.
        $perPage = min((int) $request->query('per_page', 15), 200) ?: 15;

        return ProductResource::collection($query->paginate($perPage));
    }

    /**
     * Tiered so a typo or a reordered/partial query still surfaces
     * something instead of an empty results page — the old behaviour was a
     * single "%{$search}%" LIKE against the whole string, which missed
     * "tenda routeur" matching "Routeur WiFi 6 Tenda TX3" (wrong order) and
     * obviously missed any misspelled word entirely.
     *
     *   1. Every word present (any order) in name/reference — the common
     *      case, and the most precise.
     *   2. Any word present — covers a typo in one word of a multi-word
     *      query, or the words just not all being on the product.
     *   3. Nothing matched even loosely (likely a single misspelled word) —
     *      rank a bounded candidate pool by string similarity to the raw
     *      query and keep only the reasonably close ones.
     *
     * Each tier only runs if the previous one came back empty, so the
     * common case (tier 1 matches) pays for exactly one extra exists()
     * check, not three full queries.
     */
    private function applySearch(Builder $query, string $search): Builder
    {
        $words = preg_split('/\s+/', $search, -1, PREG_SPLIT_NO_EMPTY);
        if ($words === [] || $words === false) {
            return $query;
        }

        $matchField = function (Builder $q, string $word) {
            $q->where('name', 'like', "%{$word}%")->orWhere('reference', 'like', "%{$word}%");
        };

        $strict = $query->clone()->where(function (Builder $q) use ($words, $matchField) {
            foreach ($words as $word) {
                $q->where(fn (Builder $q2) => $matchField($q2, $word));
            }
        });

        if ($strict->clone()->exists()) {
            return $strict;
        }

        $loose = $query->clone()->where(function (Builder $q) use ($words, $matchField) {
            foreach ($words as $word) {
                $q->orWhere(fn (Builder $q2) => $matchField($q2, $word));
            }
        });

        if ($loose->clone()->exists()) {
            return $loose;
        }

        return $this->fuzzySearch($query, $search);
    }

    // similar_text()'s percent is symmetric-ish but order-sensitive enough
    // that comparing against the raw query (not per-word) works fine for
    // short product names. 500 candidates keeps this bounded regardless of
    // catalogue size — only reached when tiers 1 and 2 above found nothing.
    private const FUZZY_CANDIDATE_LIMIT = 500;

    private const FUZZY_MIN_PERCENT = 40.0;

    private function fuzzySearch(Builder $query, string $search): Builder
    {
        $queryWords = preg_split('/\s+/', mb_strtolower($search), -1, PREG_SPLIT_NO_EMPTY) ?: [];

        $matchingIds = $query->clone()
            ->limit(self::FUZZY_CANDIDATE_LIMIT)
            ->get(['id', 'name'])
            ->map(function ($product) use ($queryWords) {
                $nameWords = preg_split('/\s+/', mb_strtolower($product->name), -1, PREG_SPLIT_NO_EMPTY) ?: [];

                // Best per-word similarity, not the whole strings against
                // each other — a short mistyped word compared against an
                // entire (much longer) product name always scores low on
                // length alone, even when it's one letter off from a word
                // that's actually in that name.
                $best = 0.0;
                foreach ($queryWords as $queryWord) {
                    foreach ($nameWords as $nameWord) {
                        similar_text($queryWord, $nameWord, $percent);
                        $best = max($best, $percent);
                    }
                }

                return ['id' => $product->id, 'percent' => $best];
            })
            ->filter(fn (array $row) => $row['percent'] >= self::FUZZY_MIN_PERCENT)
            ->sortByDesc('percent')
            ->pluck('id');

        if ($matchingIds->isEmpty()) {
            // whereIn('id', []) would otherwise match everything (an empty
            // IN-list has no restricting effect in the query builder here),
            // the opposite of "nothing close enough was found".
            return $query->whereRaw('1 = 0');
        }

        // index() always appends its own ->orderBy($sortBy, ...) after this
        // returns — relevance has to win over that, not just tiebreak it,
        // or the closest match could get buried under newer/pricier
        // products that matched less well. FIELD() gives every id here a
        // distinct rank, so that later orderBy never has a tie left to
        // decide and is effectively a no-op.
        return $query->whereIn('id', $matchingIds)
            ->orderByRaw('FIELD(id, '.$matchingIds->implode(',').')');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProductRequest $request): ProductResource
    {
        $data = $request->validated();
        $categoryIds = $data['category_ids'];
        unset($data['category_ids']);

        $product = Product::create($data);
        $product->categories()->sync($categoryIds);

        return new ProductResource($product->fresh(['brand', 'categories']));
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product): ProductResource
    {
        if (! $product->is_active) {
            throw new NotFoundHttpException;
        }

        $product->load(['brand', 'categories', 'images', 'variants.images', 'variants.stocks', 'stocks']);

        return new ProductResource($product);
    }

    /**
     * "Souvent acheté aussi" — products that actually co-occurred with this
     * one in past orders, ranked by how often, with same-category products
     * filling in any remainder. The co-purchase signal is real but this
     * catalogue's order history is still thin, so leaning on it alone would
     * leave the section empty for most products; the fallback keeps it
     * useful regardless of how much order history exists yet.
     */
    public function related(Product $product): AnonymousResourceCollection
    {
        $limit = 8;

        $orderIds = OrderItem::where('product_id', $product->id)
            ->whereHas('order', fn ($q) => $q->where('status', '!=', 'annulée'))
            ->pluck('order_id');

        $coPurchasedIds = OrderItem::whereIn('order_id', $orderIds)
            ->where('product_id', '!=', $product->id)
            ->select('product_id')
            ->selectRaw('COUNT(*) as frequency')
            ->groupBy('product_id')
            ->orderByDesc('frequency')
            ->limit($limit)
            ->pluck('product_id');

        return ProductResource::collection($this->withCategoryFallback($product, $coPurchasedIds, $limit));
    }

    /**
     * "Les clients ont aussi consulté" — same idea as related() above, but
     * off ProductView instead of OrderItem: products that showed up in the
     * same anonymous browsing session as this one (see trackView() below),
     * not just the same order. A much weaker signal needs much less data to
     * say something, so this fills in with the category fallback just as
     * readily.
     */
    public function alsoViewed(Product $product): AnonymousResourceCollection
    {
        $limit = 8;

        $sessionTokens = ProductView::where('product_id', $product->id)->pluck('session_token');

        $coViewedIds = ProductView::whereIn('session_token', $sessionTokens)
            ->where('product_id', '!=', $product->id)
            ->select('product_id')
            ->selectRaw('COUNT(DISTINCT session_token) as frequency')
            ->groupBy('product_id')
            ->orderByDesc('frequency')
            ->limit($limit)
            ->pluck('product_id');

        return ProductResource::collection($this->withCategoryFallback($product, $coViewedIds, $limit));
    }

    /**
     * Records that this anonymous browsing session viewed this product —
     * the raw signal alsoViewed() above correlates. session_token is a
     * client-generated id (sessionStorage, see lib/productView.ts), not
     * tied to any account; (product_id, session_token) is unique, so a page
     * refresh or a second visit in the same tab just no-ops instead of
     * inflating the count.
     */
    public function trackView(Request $request, Product $product): Response
    {
        $sessionToken = $request->validate([
            'session_token' => ['required', 'string', 'max:100'],
        ])['session_token'];

        ProductView::firstOrCreate([
            'product_id' => $product->id,
            'session_token' => $sessionToken,
        ], [
            'created_at' => now(),
        ]);

        return response()->noContent();
    }

    /**
     * Shared by related() and alsoViewed(): load the given (already-ranked)
     * product ids, preserving that rank, then top up with same-category
     * products — excluding $product itself and whatever's already in the
     * list — whenever the co-occurrence signal alone doesn't reach $limit.
     */
    private function withCategoryFallback(Product $product, Collection $rankedIds, int $limit): Collection
    {
        $products = Product::whereIn('id', $rankedIds)
            ->where('is_active', true)
            ->with(['brand', 'categories', 'images', 'variants'])
            ->get()
            ->sortBy(fn ($p) => $rankedIds->search($p->id))
            ->values();

        if ($products->count() < $limit) {
            $excludeIds = $products->pluck('id')->push($product->id);
            $categoryIds = $product->categories()->pluck('categories.id');

            $fallback = Product::where('is_active', true)
                ->whereHas('categories', fn ($q) => $q->whereIn('categories.id', $categoryIds))
                ->whereNotIn('id', $excludeIds)
                ->with(['brand', 'categories', 'images', 'variants'])
                ->latest()
                ->limit($limit - $products->count())
                ->get();

            $products = $products->concat($fallback);
        }

        return $products;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): ProductResource
    {
        $data = $request->validated();

        if (array_key_exists('category_ids', $data)) {
            $product->categories()->sync($data['category_ids']);
            unset($data['category_ids']);
        }

        $product->update($data);

        return new ProductResource($product->fresh(['brand', 'categories']));
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
