'use client';

import { usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Input } from "../ui/input";

const AdminSearch = () => {
  const pathname = usePathname();
  const formActionUrl = pathname.includes('/admin/orders')
    ? '/admin/orders'
    : pathname.includes('/admin/products')
      ? '/admin/products'
      : '/admin/users';

  const searchParams = useSearchParams();
  const [queryValue, setQueryValue] = useState(searchParams.get('query') || '');

  useEffect(() => {
    setQueryValue(searchParams.get('query') || '');
  }, [searchParams])

  return (
    <form action={formActionUrl} method="GET">
      <Input
        type="search"
        placeholder="Search..."
        name="query"
        value={queryValue}
        onChange={(e) => setQueryValue(e.target.value)}
        className="md:width-[100px] lg:width-[300px]" 
      />
      <button className="sr-only" type="submit" />
    </form>
  );
};

export default AdminSearch;
