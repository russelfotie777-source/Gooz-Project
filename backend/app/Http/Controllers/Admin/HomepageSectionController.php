<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\HomepageSection\StoreHomepageSectionRequest;
use App\Http\Requests\HomepageSection\UpdateHomepageSectionRequest;
use App\Http\Resources\HomepageSectionResource;
use App\Models\HomepageSection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class HomepageSectionController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $perPage = min((int) $request->query('per_page', 25), 100) ?: 25;

        $sections = HomepageSection::query()
            ->when($request->query('q'), fn ($q, $search) => $q->where(function ($query) use ($search) {
                $query->where('display_title', 'like', "%{$search}%")
                    ->orWhere('internal_name', 'like', "%{$search}%");
            }))
            ->orderBy('position')
            ->paginate($perPage);

        return HomepageSectionResource::collection($sections);
    }

    public function show(HomepageSection $homepageSection): HomepageSectionResource
    {
        return new HomepageSectionResource($homepageSection->load('items.product'));
    }

    public function store(StoreHomepageSectionRequest $request): HomepageSectionResource
    {
        $data = $request->validated();
        $items = $data['items'] ?? null;
        unset($data['items']);

        $data['view_all_url'] ??= '/sections/'.$data['slug'];
        $data['position'] = ((int) HomepageSection::max('position')) + 1;

        $section = HomepageSection::create($data);
        $this->syncItems($section, $items);

        return new HomepageSectionResource($section->fresh()->load('items.product'));
    }

    public function update(UpdateHomepageSectionRequest $request, HomepageSection $homepageSection): HomepageSectionResource
    {
        $data = $request->validated();
        $items = array_key_exists('items', $data) ? $data['items'] : null;
        unset($data['items']);

        $homepageSection->update($data);

        if ($items !== null) {
            $this->syncItems($homepageSection, $items);
        }

        return new HomepageSectionResource($homepageSection->fresh()->load('items.product'));
    }

    public function destroy(HomepageSection $homepageSection)
    {
        $homepageSection->delete();

        return response()->json(null, 204);
    }

    public function reorder(Request $request): AnonymousResourceCollection
    {
        $data = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['integer', 'exists:homepage_sections,id'],
        ]);

        DB::transaction(function () use ($data) {
            foreach (array_values($data['ids']) as $index => $id) {
                HomepageSection::whereKey($id)->update(['position' => $index + 1]);
            }
        });

        return HomepageSectionResource::collection(HomepageSection::query()->orderBy('position')->get());
    }

    private function syncItems(HomepageSection $section, ?array $items): void
    {
        if ($items === null) {
            return;
        }

        $section->items()->delete();

        foreach (array_values($items) as $index => $item) {
            $section->items()->create([
                'product_id' => $item['product_id'],
                'position' => $index + 1,
            ]);
        }
    }
}
