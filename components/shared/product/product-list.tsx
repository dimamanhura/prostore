import { Product } from "@/types";
import ProductCard from "./product-card";

interface ProductListProps {
  data: Product[];
  title?: string;
};

const ProductList = ({ data, title }: ProductListProps) => {
  return (
    <div className="my-10">
      <h2 className="h2-bold mb-4">{title}</h2>
      { data.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {
            data.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
              />
            ))
          }
        </div>
      ) : (
        <p>No Products found</p>
      ) }
    </div>
  );
};

export default ProductList;
