import DealCountdown from "@/components/deal-countdown";
import IconBoxes from "@/components/icon-boxes";
import ProductCarousel from "@/components/shared/product/product-carousel";
import ProductList from "@/components/shared/product/product-list";
import ViewAllProductsButton from "@/components/view-all-products-button";
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

      <ViewAllProductsButton />

      <IconBoxes />

      <DealCountdown />
    </>
  );
};

export default HomePage;
