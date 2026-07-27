// Mirrors backend/app/Http/Resources/*.php exactly, so swapping mock data
// for a real `fetch` call later requires no shape changes. See API.md.

export interface Brand {
  id: number;
  name: string;
  logo: string | null;
  description: string | null;
  country_origin: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  image: string | null;
  is_active: boolean;
  children: Category[];
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_primary: boolean;
  product_variant_id: number | null;
}

export interface ProductVariant {
  id: number;
  size: string | null;
  color: string | null;
  material: string | null;
  additional_price: number;
  barcode: string | null;
  is_active: boolean;
  images: ProductImage[];
  stock_quantity?: number;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  base_price: number;
  promo_price: number | null;
  /** Already computed server-side: promo_price if is_promotion, else base_price. Don't recompute. */
  price: number;
  reference: string;
  is_active: boolean;
  is_promotion: boolean;
  brand?: Brand;
  category?: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  stock_quantity?: number;
  created_at: string;
}
