import { notFound } from "next/navigation";
import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import HeroSection from "@/components/HeroSection/HeroSection";
import ProductSection from "@/components/ProductSection/ProductSection";
import CategoryResults from "@/components/CategoryResults/CategoryResults";
import PromoBanner from "@/components/PromoBanner/PromoBanner";
import Footer from "@/components/Footer/Footer";
import { getCategories, getProducts } from "@/lib/api";
import styles from "./CategoryPage.module.css";

interface CategoryPageProps {
  categorySlug: string;
}

// Figma: desktop node 975:3578, mobile node 117:84. Reuses the same header/
// hero/footer chrome as HomePage — only the CategoryResults section (price
// filter + sort + the category's own products) is new.
export default async function CategoryPage({ categorySlug }: CategoryPageProps) {
  const categories = await getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) notFound();

  const [categoryProducts, otherProducts] = await Promise.all([
    getProducts({ category_id: category.id, per_page: 50 }),
    getProducts({ per_page: 8 }),
  ]);

  const bestSellers = categoryProducts.slice(0, 4);
  const recommendedProducts = otherProducts
    .filter((p) => p.category?.id !== category.id)
    .slice(0, 4);

  return (
    <div className={styles.page}>
      <Header cartCount={2} />

      <main className={styles.main}>
        <HeroSection categories={categories} />

        <ProductSection titleKey="bestSellersTitle" products={bestSellers} cardLayout="row" />

        <CategoryResults categoryName={category.name} products={categoryProducts} />

        <PromoBanner />

        <ProductSection
          titleKey="recommendedTitle"
          products={recommendedProducts}
          cardLayout="column"
        />
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
}
