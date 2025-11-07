'use client'

import { ToastContainer } from "react-toastify";
import Image from "next/image";
import ToggleFavorite from "./toggleFavoriteProduct";

// Props interface
interface ProductProps {
  id: string;
  category: string;
  title: string;
  price: number | string;
  imageUrl: string;
  URL: string
}

const Products = ({ id, category, title, price, imageUrl, URL }: ProductProps) => {
  return (
    <div
      className="flex flex-col space-x-4 mb-6 cursor-pointer border border-gray-300 p-2 transition-shadow duration-300"
      data-aos="fade-right"
      onClick={() => window.open(URL, "_blank")}
    >
      <ToastContainer />
      <div className="overflow-hidden w-full">
        <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Product image"
              fill
              className="object-cover hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm">
              No image found
            </div>
          )}
        </div>

      </div>
      <div className="mt-2">
        <span className="text-stone-600 text-sm font-semibold">
          {category}
        </span>
        <div className='flex sm:flex-row justify-between items-center mt-3 mb-2'>
          <ToggleFavorite productId={id} productTitle={title} />
        </div>

        <div className="font-bold flex text-xs mt-1">
          <p className="mr-2 text-black">Giá tiền:</p>
          <p className="text-red-500">{Number(price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
        </div>
      </div>
    </div>
  );
};

export default Products;
