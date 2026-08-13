import Header from "@/components/Header/Header";
import BottomNav from "@/components/BottomNav/BottomNav";
import CategoryList from "@/components/CategoryList/CategoryList";
import HeroSection from "@/components/HeroSection/HeroSection";
import ProductSection from "@/components/ProductSection/ProductSection";
import CatalogueSection from "@/components/CatalogueSection/CatalogueSection";
import PromoBanner from "@/components/PromoBanner/PromoBanner";
import BrandsSection from "@/components/BrandsSection/BrandsSection";
import Footer from "@/components/Footer/Footer";
import { getCategories, getBrands, getProducts } from "@/lib/api";
import styles from "./HomePage.module.css";

export default async function HomePage() {
  const [categories, brands, products] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts({ per_page: 50 }),
  ]);

  const saleProducts = products.filter((p) => p.is_promotion);
  const popularProducts = products.slice(0, 4);
  const recommendedProducts = products.slice(4, 8);

  return (
    <div className={styles.page}>
      <Header cartCount={2} />

      <main className={styles.main}>
        <CategoryList categories={categories} />

        <HeroSection categories={categories} />

        <ProductSection title="En Solde" products={saleProducts} cardLayout="row" />

        <ProductSection title="Produits Populaire" products={popularProducts} cardLayout="row" />

        <CatalogueSection products={products} categories={categories} />

        <PromoBanner />

        <ProductSection
          title="Les bonnes affaires pour vous"
          products={saleProducts}
          cardLayout="column"
        />

        <BrandsSection brands={brands} />

        <ProductSection
          title="Les produits recommandés"
          products={recommendedProducts}
          cardLayout="column"
        />
      </main>

      <Footer />

      <BottomNav />
    </div>
  );
}
