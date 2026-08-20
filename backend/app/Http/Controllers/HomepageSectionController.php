<?php

namespace App\Http\Controllers;

use App\Http\Resources\BrandResource;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\ProductResource;
use App\Models\Brand;
use App\Models\Category;
use App\Models\HomepageSection;
use App\Models\Product;
use App\Models\ProductVariant;
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

        return response()->json([
            'data' => $sections->map(fn (HomepageSection $section) => $this->present($section))->values(),
        ]);
    }

    private function present(HomepageSection $section): array
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
            'products' => ProductResource::collection($this->resolveProducts($section, $limit)),
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

    private function resolveProducts(HomepageSection $section, int $limit): Collection
    {
        if ($section->section_type === 'manual') {
            return $section->items->pluck('product')->filter()->values();
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
                $query->orderBy(
                    ProductVariant::select('base_price')
                        ->whereColumn('product_id', 'products.id')
                        ->orderBy('base_price')
                        ->limit(1),
                    $direction
                );
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
