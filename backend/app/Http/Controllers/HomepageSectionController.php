<?php

namespace App\Http\Controllers;

use App\Http\Resources\BrandResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\HomepageSection;
use App\Models\Product;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

// Customer-facing counterpart to Admin\HomepageSectionController — until
// this existed, the admin panel could create/reorder sections that no
// public route ever exposed, so nothing a merchant configured here could
// ever reach a real shopper (see HomePage.tsx, which was entirely
// hardcoded). This resolves each section's actual content (manual product
// picks, or one of the automatic strategies) at read time.
class HomepageSectionController extends Controller
{
    public function index(Request $request)
    {
        $now = now();
        // No auth:sanctum middleware on this route (it must work for
        // guests) — the default guard is session-based ('web'), which
        // never sees a Bearer token, so the guard has to be named
        // explicitly here to still recognize a logged-in shopper. This is
        // what "visibility: logged_in / guests" filters on.
        $isLoggedIn = (bool) $request->user('sanctum');

        $sections = HomepageSection::query()
            ->where('is_active', true)
            ->where(fn (Builder $q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn (Builder $q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now))
            ->when(! $isLoggedIn, fn (Builder $q) => $q->where('visibility', '!=', 'logged_in'))
            ->when($isLoggedIn, fn (Builder $q) => $q->where('visibility', '!=', 'guests'))
            ->with(['items.product.brand', 'items.product.category', 'items.product.images', 'items.product.variants'])
            ->orderBy('position')
            ->get();

        $batched = $this->batchSimpleAutomaticSections($sections);

        return response()->json([
            'data' => $sections->map(fn (HomepageSection $section) => $this->present($section, $batched->get($section->id)))->values(),
        ]);
    }

    /**
     * Sections using the plain "recency" strategies (new_arrivals /
     * category_showcase, no extra filters beyond category_ids) each used to
     * run their own products query — with N such sections on the homepage,
     * that's N round-trips run one after another before the page can
     * respond (see the performance audit). Grouped by sort_direction (the
     * one thing that has to match to share a single ORDER BY), fetched in
     * one query per group, then split back out per section in memory.
     * Sections with any other filter, or another strategy, are left as
     * individual queries in queryAutomaticProducts() — merging those in too
     * would risk subtly changing what best_sellers/price_range actually
     * compute, for a gain this homepage's section count doesn't need.
     *
     * @return Collection<int, Collection<int, Product>> keyed by section id
     */
    private function batchSimpleAutomaticSections(Collection $sections): Collection
    {
        $batchable = $sections->filter(function (HomepageSection $section) {
            if ($section->section_type !== 'automatic') {
                return false;
            }

            if (! in_array($section->automatic_strategy, ['new_arrivals', 'category_showcase', null, ''], true)) {
                return false;
            }

            return empty($section->brand_ids)
                && $section->min_price === null
                && $section->max_price === null
                && ! $section->in_stock_only
                && ! $section->campaign_products_only;
        });

        $results = new Collection;

        foreach ($batchable->groupBy(fn (HomepageSection $s) => $s->sort_direction === 'desc' ? 'desc' : 'asc') as $direction => $group) {
            /** @var Collection<int, HomepageSection> $group */
            $categoryIds = $group->pluck('category_ids')->filter()->flatten()->unique()->values();
            $needsAllCategories = $group->contains(fn (HomepageSection $s) => empty($s->category_ids));
            $poolSize = (int) $group->sum(fn (HomepageSection $s) => $s->item_limit ?: 8);

            $pool = Product::query()
                ->with(['brand', 'category', 'images', 'variants'])
                ->where('is_active', true)
                ->when(! $needsAllCategories, fn (Builder $q) => $q->whereIn('category_id', $categoryIds))
                ->orderBy('created_at', $direction)
                ->limit($poolSize)
                ->get();

            foreach ($group as $section) {
                $limit = $section->item_limit ?: 8;
                $ids = $section->category_ids;

                $results->put(
                    $section->id,
                    empty($ids)
                        ? $pool->take($limit)
                        : $pool->whereIn('category_id', $ids)->take($limit)->values()
                );
            }
        }

        return $results;
    }

    private function present(HomepageSection $section, ?Collection $batchedProducts = null): array
    {
        $limit = $section->item_limit ?: 8;

        $base = [
            'id' => $section->id,
            'display_title' => $section->display_title,
            'slug' => $section->slug,
            'description' => $section->description,
            'display_layout' => $section->display_layout,
            'show_title' => $section->show_title,
            'show_view_all' => $section->show_view_all,
            'view_all_url' => $section->view_all_url ?? ('/sections/'.$section->slug),
        ];

        // These two strategies list categories/brands themselves, not
        // products — a fundamentally different card, not just a different
        // product filter.
        if ($section->section_type !== 'manual' && $section->automatic_strategy === 'category_list') {
            return $base + [
                'content_type' => 'categories',
                'categories' => CategoryResource::collection($this->resolveCategories($section, $limit)),
            ];
        }

        if ($section->section_type !== 'manual' && $section->automatic_strategy === 'brand_list') {
            return $base + [
                'content_type' => 'brands',
                'brands' => BrandResource::collection($this->resolveBrands($section, $limit)),
            ];
        }

        return $base + [
            'content_type' => 'products',
            'products' => ProductResource::collection($this->resolveProducts($section, $limit, $batchedProducts)),
        ];
    }

    private function resolveCategories(HomepageSection $section, int $limit): Collection
    {
        return Category::query()
            ->where('is_active', true)
            ->when($section->category_ids, fn (Builder $q, array $ids) => $q->whereIn('id', $ids))
            ->orderBy('name', $section->sort_direction ?: 'asc')
            ->limit($limit)
            ->get();
    }

    private function resolveBrands(HomepageSection $section, int $limit): Collection
    {
        return Brand::query()
            ->when($section->brand_ids, fn (Builder $q, array $ids) => $q->whereIn('id', $ids))
            ->orderBy('name', $section->sort_direction ?: 'asc')
            ->limit($limit)
            ->get();
    }

    private function resolveProducts(HomepageSection $section, int $limit, ?Collection $batchedProducts = null): Collection
    {
        if ($section->section_type === 'manual') {
            return $section->items->pluck('product')->filter()->values();
        }

        if ($batchedProducts !== null) {
            return $batchedProducts;
        }

        $automatic = $this->queryAutomaticProducts($section, $limit);

        if ($section->section_type === 'mixed') {
            $manual = $section->items->pluck('product')->filter();
            $manualIds = $manual->pluck('id');

            return $manual->concat($automatic->reject(fn (Product $p) => $manualIds->contains($p->id)))
                ->take($limit)
                ->values();
        }

        return $automatic;
    }

    private function queryAutomaticProducts(HomepageSection $section, int $limit): Collection
    {
        $query = Product::query()
            ->with(['brand', 'category', 'images', 'variants'])
            ->where('is_active', true);

        $this->applyAutomaticFilters($query, $section);

        $direction = $section->sort_direction === 'desc' ? 'desc' : 'asc';

        switch ($section->automatic_strategy) {
            case 'best_sellers':
                $query->withSum(['orderItems as sold_quantity' => function (Builder $q) use ($section) {
                    if ($section->window_days) {
                        $q->whereHas(
                            'order',
                            fn (Builder $oq) => $oq->where('created_at', '>=', now()->subDays($section->window_days))
                        );
                    }
                }], 'quantity')->orderBy('sold_quantity', $direction === 'asc' ? 'asc' : 'desc');
                break;

            case 'price_range':
                // products.min_price, kept in sync by ProductVariantObserver
                // — see ProductController::index() for the same swap.
                $query->orderBy('min_price', $direction);
                break;

            case 'category_showcase':
            case 'new_arrivals':
            default:
                $query->orderBy('created_at', $direction);
                break;
        }

        return $query->limit($limit)->get();
    }

    private function applyAutomaticFilters(Builder $query, HomepageSection $section): void
    {
        if (! empty($section->category_ids)) {
            $query->whereIn('category_id', $section->category_ids);
        }

        if (! empty($section->brand_ids)) {
            $query->whereIn('brand_id', $section->brand_ids);
        }

        if ($section->min_price !== null) {
            $query->whereHas('variants', fn (Builder $q) => $q->where('base_price', '>=', $section->min_price));
        }

        if ($section->max_price !== null) {
            $query->whereHas('variants', fn (Builder $q) => $q->where('base_price', '<=', $section->max_price));
        }

        if ($section->in_stock_only) {
            $query->whereHas('stocks', fn (Builder $q) => $q->whereRaw('quantity_available - quantity_reserved > 0'));
        }

        if ($section->campaign_products_only) {
            $query->whereHas('variants', fn (Builder $q) => $q->where('is_promotion', true));
        }
    }
}
