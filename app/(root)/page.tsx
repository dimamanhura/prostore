import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import { getFeaturedProducts, getLatestProducts } from "@/lib/actions/product.action";

const HomePage = async () => {
  const latestProducts = await getLatestProducts();
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      {featuredProducts?.length > 0 && (
        <ProductCarousel
          featuredProducts={featuredProducts}
        />
      )}
      <ProductList
        data={latestProducts}
        title="Newest Arrivals"
      />
    </>
  );
};

export default HomePage;
