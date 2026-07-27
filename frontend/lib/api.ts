import type { Brand, Category, Product, ProductImage, ProductVariant } from "./types";

// Talks to the Laravel API described in API.md. Server Components call these
// directly (Node fetch, no CORS involved); a "use client" component would
// need NEXT_PUBLIC_API_URL to also be reachable from the browser.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8001/api/v1";

interface ApiCollection<T> {
  data: T[];
}

interface ApiResource<T> {
  data: T;
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`API ${path} -> ${res.status}`);
  }
  return res.json();
}

// Laravel returns `decimal` columns as strings (e.g. "20000.00") to avoid
// float precision loss — coerce them here so the rest of the app can treat
// Product/ProductVariant prices as the `number` the types declare.
function normalizeImage(raw: ProductImage): ProductImage {
  return raw;
}

function normalizeVariant(raw: ProductVariant): ProductVariant {
  return {
    ...raw,
    additional_price: Number(raw.additional_price),
    images: (raw.images ?? []).map(normalizeImage),
  };
}

function normalizeProduct(raw: Product): Product {
  return {
    ...raw,
    base_price: Number(raw.base_price),
    promo_price: raw.promo_price !== null ? Number(raw.promo_price) : null,
    price: Number(raw.price),
    images: raw.images ?? [],
    variants: (raw.variants ?? []).map(normalizeVariant),
  };
}

function normalizeCategory(raw: Category): Category {
  return {
    ...raw,
    children: (raw.children ?? []).map(normalizeCategory),
  };
}

// `/categories` only returns active root categories, with their subcategories
// nested under `children` (see API.md §3). None of the category lists in this
// app render a hierarchy — they're flat bubble/sidebar lists — so flatten the
// tree here to surface every category (root and child) from the database.
function flattenCategories(categories: Category[]): Category[] {
  return categories.flatMap((category) => [category, ...flattenCategories(category.children)]);
}

export interface GetProductsParams {
  category_id?: number;
  brand_id?: number;
  q?: string;
  is_promotion?: boolean;
  min_price?: number;
  max_price?: number;
  sort_by?: "created_at" | "base_price" | "name";
  sort_dir?: "asc" | "desc";
  per_page?: number;
}

function buildQuery(params: GetProductsParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export async function getProducts(params: GetProductsParams = {}): Promise<Product[]> {
  const { data } = await apiFetch<ApiCollection<Product>>(`/products${buildQuery(params)}`);
  return data.map(normalizeProduct);
}

export async function getProduct(id: number): Promise<Product> {
  const { data } = await apiFetch<ApiResource<Product>>(`/products/${id}`);
  return normalizeProduct(data);
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiFetch<ApiCollection<Category>>("/categories");
  return flattenCategories(data.map(normalizeCategory));
}

export async function getBrands(): Promise<Brand[]> {
  const { data } = await apiFetch<ApiCollection<Brand>>("/brands");
  return data;
}
