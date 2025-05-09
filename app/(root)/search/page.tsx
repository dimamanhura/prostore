import ProductCard from "@/components/shared/product/product-card";
import { Button } from "@/components/ui/button";
import { getAllProducts, getAllCategories } from "@/lib/actions/product.action";
import { cn } from "@/lib/utils";
import Link from "next/link";

const prices = [
  {
    name: '$0 to $50',
    value: '0-50',    
  },
  {
    name: '$51 to $100',
    value: '51-100',    
  },
  {
    name: '$101 to $200',
    value: '101-200',    
  },
  {
    name: '$201 to $500',
    value: '201-500',    
  },
  {
    name: '$501 to $1000',
    value: '501-1000',    
  },
];

const ratings = [1, 2, 3, 4];

const sortOrders = ['newest', 'lowest', 'highest', 'rating'];

export const generateMetadata = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price: string;
    rating: string;
    sort: string;
    page: string;
  }>
}) => {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
  } = await props.searchParams;

  const isQuerySet = q && q !== 'all' && q.trim() !== '';
  const isCategorySet = category && category !== 'all' && category.trim() !== '';
  const isPriceSet = price && price !== 'all' && price.trim() !== '';
  const isRatingSet = rating && rating !== 'all' && rating.trim() !== '';

  if (isQuerySet || isCategorySet || isPriceSet || isRatingSet) {
    return {
      title: `
        Search ${isQuerySet ? q : ''}
        ${isCategorySet ? `: Category ${category}` : ''}
        ${isPriceSet ? `: Price ${price}` : ''}
        ${isRatingSet ? `: Rating ${rating}` : ''}
      `, 
    };
  }

  return {
    title: 'Search Products',
  };
};

const SearchPage = async (props: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    price: string;
    rating: string;
    sort: string;
    page: string;
  }>
}) => {
  const {
    q = 'all',
    category = 'all',
    price = 'all',
    rating = 'all',
    sort = 'newest',
    page = '1',
  } = await props.searchParams;

  const getFilterUrl = ({
    categoryFilterValue,
    sortFilterValue,
    priceFilterValue,
    ratingFilterValue,
    pageFilterValue,
  }: {
    categoryFilterValue?: string;
    sortFilterValue?: string;
    priceFilterValue?: string;
    ratingFilterValue?: string;
    pageFilterValue?: string;
  }) => {
    const params = { q, category, price, rating, sort, page };

    if (categoryFilterValue) {
      params.category = categoryFilterValue;
    }

    if (sortFilterValue) {
      params.sort = sortFilterValue;
    }

    if (priceFilterValue) {
      params.price = priceFilterValue;
    }

    if (ratingFilterValue) {
      params.rating = ratingFilterValue;
    }

    if (pageFilterValue) {
      params.page = pageFilterValue;
    }

    return `/search?${new URLSearchParams(params).toString()}`;
  };

  const products = await getAllProducts({
    query: q,
    category,
    price,
    rating,
    sort,
    page: Number(page) || 1,
  });

  const categories = await getAllCategories();

  return (
    <div className="grid md:grid-cols-5 md:gap-5">
      <div className="filter-links">
        {/* Category */}
        <div className="text-xl mb-2 mt-3">Category</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={cn(`${(category === 'all' || category === '') && 'font-bold'}`)}
                href={getFilterUrl({ categoryFilterValue: 'all'})}
              >
                Any
              </Link>
            </li>
            {categories.map(c => (
              <li key={c.category}>
                <Link
                  className={cn(`${category === c.category && 'font-bold'}`)}
                  href={getFilterUrl({ categoryFilterValue: c.category })}
                >
                  {c.category}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Price */}
        <div className="text-xl mb-2 mt-8">Price</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={cn(`${(price === 'all' || price === '') && 'font-bold'}`)}
                href={getFilterUrl({ priceFilterValue: 'all'})}
              >
                Any
              </Link>
            </li>
            {prices.map(priceValue => (
              <li key={priceValue.value}>
                <Link
                  className={cn(`${price === priceValue.value && 'font-bold'}`)}
                  href={getFilterUrl({ priceFilterValue: priceValue.value })}
                >
                  {priceValue.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {/* Rating */}
        <div className="text-xl mb-2 mt-8">Rating</div>
        <div>
          <ul className="space-y-1">
            <li>
              <Link
                className={cn(`${(rating === 'all' || rating === '') && 'font-bold'}`)}
                href={getFilterUrl({ ratingFilterValue: 'all'})}
              >
                Any
              </Link>
            </li>
            {ratings.map(ratingValue => (
              <li key={ratingValue}>
                <Link
                  className={cn(`${rating === ratingValue.toString() && 'font-bold'}`)}
                  href={getFilterUrl({ ratingFilterValue: ratingValue.toString() })}
                >
                  {`${ratingValue.toString()} starts & up`}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="md:col-span-4 space-y-4">
        <div className="flex-between flex-col md:flex-row my-4">
          <div className="flex items-center">
            { q !== 'all' && q !== '' &&  `Query: ${q}` }
            { category !== 'all' && category !== '' &&  ` Category: ${category}` }
            { price !== 'all' && price !== '' &&  ` Price: ${price}` }
            { rating !== 'all' && rating !== '' &&  ` Rating: ${rating} starts & up` }
            &nbsp;
            { (q !== 'all' && q !== '' ) 
              || (category !== 'all' && category !== '')
              || (price !== 'all' && price !== '')
              || (rating !== 'all' && rating !== '') ? (
                <Button variant={'link'} asChild>
                  <Link href={'/search'}>Clear</Link>
                </Button>
              ) : (
                null
              )
            }
          </div>
          <div>
            Sort by{' '}
            {sortOrders.map(s => (
              <Link
                key={s}
                href={getFilterUrl({ sortFilterValue: s })}
                className={cn(`mx-2 ${sort === s && 'font-bold'}`)}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {products.data.length === 0 && (
            <div>No Products Found</div>
          )}
          {products.data.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
