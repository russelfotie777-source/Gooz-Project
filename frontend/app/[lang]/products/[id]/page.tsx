import { notFound } from "next/navigation";
import ProductPage from "@/components/ProductPage/ProductPage";
import { getProduct, getProducts } from "@/lib/api";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const product = await getProduct(Number(id)).catch(() => null);
  if (!product) notFound();

  // The main product above already has to succeed (404s otherwise) — a
  // failure on this secondary call is not worth taking down a page that
  // otherwise loaded fine; just show it with no recommendations.
  const otherProducts = await getProducts({ per_page: 8 }).catch(() => []);
  const recommendedProducts = otherProducts.filter((p) => p.id !== product.id).slice(0, 4);

  return <ProductPage product={product} recommendedProducts={recommendedProducts} />;
}
