'use client';

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImagesProps {
  images: string[];
};

const ProductImages = ({ images }: ProductImagesProps) => {
  const [current, setCurrent] = useState(0);
  return (
    <div className="space-y-4">
      <Image
        className="min-h-[300px] object-cover object-center"
        height={1000}
        width={1000}
        src={images[current]}
        alt={'product image'}
      />
      <div className="flex">
       {images.map((image, index) => (
        <div
          key={image}
          className={cn('border mr-2 cursor-pointer hover:border-orange-600', current === index && 'border-orange-500')}
          onClick={() => setCurrent(index)}
        >
          <Image
            height={100}
            width={100}
            src={image}
            alt={'image'}
          />
        </div>
       ))}
      </div>
    </div>
  );
};

export default ProductImages;
