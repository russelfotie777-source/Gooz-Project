<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HomepageSectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'internal_name' => $this->internal_name,
            'display_title' => $this->display_title,
            'slug' => $this->slug,
            'view_url' => '/sections/'.$this->slug,
            'description' => $this->description,
            'section_type' => $this->section_type,
            'display_layout' => $this->display_layout,
            'automatic_strategy' => $this->automatic_strategy,
            'display_mode' => $this->display_mode,
            'sort_direction' => $this->sort_direction,
            'item_limit' => $this->item_limit,
            'visibility' => $this->visibility,
            'view_all_url' => $this->view_all_url,
            'starts_at' => $this->starts_at,
            'ends_at' => $this->ends_at,
            'show_title' => $this->show_title,
            'show_view_all' => $this->show_view_all,
            'is_active' => $this->is_active,
            'position' => $this->position,
            'window_days' => $this->window_days,
            'category_ids' => $this->category_ids ?? [],
            'brand_ids' => $this->brand_ids ?? [],
            'min_price' => $this->min_price,
            'max_price' => $this->max_price,
            'in_stock_only' => $this->in_stock_only,
            'campaign_products_only' => $this->campaign_products_only,
            'items' => HomepageSectionItemResource::collection($this->whenLoaded('items')),
            'created_at' => $this->created_at,
        ];
    }
}
