'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";
import { formUrlQuery } from "@/lib/utils";

interface PaginationProps {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

const Pagination = ({ page, totalPages, urlParamName }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClick = (type: string) => {
    const pageValue = type === 'next'
      ? Number(page) + 1
      : Number(page) - 1;
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || 'page',
      value: pageValue.toString(),
    });
    router.push(newUrl);
  };

  return (
    <div className="flex gap-2 mt-4">
      <Button
        className="w-28"
        disabled={Number(page) <= 1}
        variant={'outline'}
        size={'lg'}
        onClick={() => handleClick('prev')}
      >
        Previous
      </Button>

      <Button
        className="w-28"
        disabled={Number(page) >= totalPages}
        variant={'outline'}
        size={'lg'}
        onClick={() => handleClick('next')}
      >
        Next
      </Button>
    </div>
  );
};

export default Pagination;
