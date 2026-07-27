import type { Brand, Category, Product } from "./types";

// Placeholder data shaped exactly like the Laravel API responses (see API.md).
// Swap the fetches in HomePage for real calls to /api/v1/products,
// /api/v1/categories, /api/v1/brands once the backend is wired up — no
// component should need to change shape-wise.

const PLACEHOLDER_IMAGE = "/images/placeholder-product.svg";

export const mockCategories: Category[] = [
  { id: 1, name: "Téléphone", slug: "telephone", parent_id: null, image: null, is_active: true, children: [] },
  { id: 2, name: "Réseau", slug: "reseau", parent_id: null, image: null, is_active: true, children: [] },
  { id: 3, name: "Informatique", slug: "informatique", parent_id: null, image: null, is_active: true, children: [] },
  { id: 4, name: "Sécurité", slug: "securite", parent_id: null, image: null, is_active: true, children: [] },
  { id: 5, name: "Électroménager", slug: "electromenager", parent_id: null, image: null, is_active: true, children: [] },
];

export const mockBrands: Brand[] = [
  { id: 1, name: "Hisense", logo: null, description: null, country_origin: "Chine" },
  { id: 2, name: "Hikvision", logo: null, description: null, country_origin: "Chine" },
  { id: 3, name: "Tenda", logo: null, description: null, country_origin: "Chine" },
  { id: 4, name: "TP-Link", logo: null, description: null, country_origin: "Chine" },
  { id: 5, name: "HP", logo: null, description: null, country_origin: "USA" },
  { id: 6, name: "Samsung", logo: null, description: null, country_origin: "Corée du Sud" },
];

function categoryOf(id: number): Category {
  return mockCategories.find((c) => c.id === id)!;
}

function brandOf(id: number): Brand {
  return mockBrands.find((b) => b.id === id)!;
}

function image(id: number, isPrimary = true): Product["images"][number] {
  return { id, image_url: PLACEHOLDER_IMAGE, is_primary: isPrimary, product_variant_id: null };
}

interface MockProductInput {
  id: number;
  name: string;
  description: string;
  base_price: number;
  is_promotion: boolean;
  promo_price?: number;
  reference: string;
  category_id: number;
  brand_id: number;
  stock_quantity?: number;
}

function buildProduct(input: MockProductInput): Product {
  const price = input.is_promotion && input.promo_price ? input.promo_price : input.base_price;
  return {
    id: input.id,
    name: input.name,
    description: input.description,
    base_price: input.base_price,
    promo_price: input.is_promotion ? input.promo_price ?? null : null,
    price,
    reference: input.reference,
    is_active: true,
    is_promotion: input.is_promotion,
    brand: brandOf(input.brand_id),
    category: categoryOf(input.category_id),
    images: [image(input.id * 10)],
    variants: [],
    stock_quantity: input.stock_quantity ?? 25,
    created_at: "2026-07-01T09:00:00.000000Z",
  };
}

export const mockProducts: Product[] = [
  buildProduct({
    id: 1,
    name: "Bouilloire Hisense",
    description: "Bouilloire électrique 1.7L, arrêt automatique, résistance inox.",
    base_price: 10000,
    is_promotion: true,
    promo_price: 7500,
    reference: "HIS-BLR-17",
    category_id: 5,
    brand_id: 1,
  }),
  buildProduct({
    id: 2,
    name: "Caméra Hikvision",
    description: "Caméra de surveillance dôme, vision nocturne, résistante aux intempéries.",
    base_price: 46700,
    is_promotion: true,
    promo_price: 35000,
    reference: "HIK-CAM-DM2",
    category_id: 4,
    brand_id: 2,
  }),
  buildProduct({
    id: 3,
    name: "Modem WIFI LTE 5G",
    description: "Modem 4G/5G, débit jusqu'à 300 Mbps, jusqu'à 32 appareils connectés.",
    base_price: 25000,
    is_promotion: false,
    reference: "TND-MDM-5G",
    category_id: 2,
    brand_id: 3,
  }),
  buildProduct({
    id: 4,
    name: "Routeur Tenda",
    description: "Routeur WiFi double bande, portée étendue, configuration simplifiée.",
    base_price: 18500,
    is_promotion: false,
    reference: "TND-RTR-AC10",
    category_id: 2,
    brand_id: 3,
  }),
  buildProduct({
    id: 5,
    name: "Baie informatique",
    description: "Baie de brassage 19 pouces, 12U, ventilation intégrée.",
    base_price: 10000,
    is_promotion: true,
    promo_price: 7500,
    reference: "GEN-BAI-12U",
    category_id: 3,
    brand_id: 5,
  }),
  buildProduct({
    id: 6,
    name: "Ordinateur portable",
    description: "Laptop 15.6\", Intel Core i5, 8 Go RAM, 512 Go SSD.",
    base_price: 46700,
    is_promotion: true,
    promo_price: 35000,
    reference: "HP-LAP-15I5",
    category_id: 3,
    brand_id: 5,
  }),
  buildProduct({
    id: 7,
    name: "Smartphone Galaxy",
    description: "Écran 6.5\", 128 Go de stockage, double SIM, appareil photo 50MP.",
    base_price: 89000,
    is_promotion: false,
    reference: "SMS-PHN-A15",
    category_id: 1,
    brand_id: 6,
  }),
  buildProduct({
    id: 8,
    name: "Clé USB 64 Go",
    description: "Clé USB 3.0 haute vitesse, compacte, compatible tous ports.",
    base_price: 4000,
    is_promotion: false,
    reference: "GEN-USB-64",
    category_id: 3,
    brand_id: 5,
  }),
  buildProduct({
    id: 9,
    name: "Fer à repasser",
    description: "Fer à repasser vapeur, semelle céramique, 2000W.",
    base_price: 12000,
    is_promotion: false,
    reference: "HIS-FER-2000",
    category_id: 5,
    brand_id: 1,
  }),
  buildProduct({
    id: 10,
    name: "Cuisinière 4 feux",
    description: "Cuisinière à gaz 4 feux, allumage électronique, four intégré.",
    base_price: 95000,
    is_promotion: false,
    reference: "HIS-CUI-4F",
    category_id: 5,
    brand_id: 1,
  }),
  buildProduct({
    id: 11,
    name: "Télévision 43\" 4K",
    description: "Smart TV 43 pouces, résolution 4K UHD, HDR, ports HDMI x3.",
    base_price: 145000,
    is_promotion: true,
    promo_price: 109000,
    reference: "HIS-TV-43UHD",
    category_id: 5,
    brand_id: 1,
  }),
  buildProduct({
    id: 12,
    name: "Téléphone fixe",
    description: "Téléphone filaire de bureau, écran LCD, mains libres.",
    base_price: 8500,
    is_promotion: false,
    reference: "GEN-TEL-FIX",
    category_id: 1,
    brand_id: 4,
  }),
];

export const saleProducts = mockProducts.filter((p) => p.is_promotion);
export const popularProducts = [mockProducts[1], mockProducts[5], mockProducts[6], mockProducts[10]];
export const recommendedProducts = [mockProducts[2], mockProducts[3], mockProducts[7], mockProducts[8]];
