'use client'
import ToggleFavorite from './toggleFavoriteProduct';
import React, { useRef } from 'react';
import Image from 'next/image';
import { GoChevronLeft } from "react-icons/go";
import { GoChevronRight } from "react-icons/go";

type Category = {
    title: string;
};

interface Product {
    id: string;
    slug: string;
    title: string;
    description: string;
    price: number | string;
    views: number;
    rating: number;
    imageUrl: string;
    URL: string;
}

interface ScrollProductProps {
    categories?: Category[]; // cho phép undefined
    productsByCategory?: Record<string, Product[]>; // cho phép undefined
}

export default function ScrollProduct({
    categories = [], // fallback mảng rỗng
    productsByCategory = {}, // fallback object rỗng
}: ScrollProductProps) {

    const DOMAIN = process.env.NEXT_PUBLIC_URLWEBSITE

    const scrollRefs = useRef<Record<string, HTMLDivElement | null>>({});

    const scrollLeft = (key: string) => {
        scrollRefs.current[key]?.scrollBy({
            left: -window.innerWidth,
            behavior: 'smooth',
        });
    };

    const scrollRight = (key: string) => {
        scrollRefs.current[key]?.scrollBy({
            left: window.innerWidth,
            behavior: 'smooth',
        });
    };

    // Nếu không có category thì không render gì
    if (categories.length === 0) {
        return <p className="text-center text-gray-500">Không có sản phẩm để hiển thị</p>;
    }

    return (
        <>
            {categories.map((category, idx) => {
                const catTitle = category?.title ?? "";
                const products = Array.isArray(productsByCategory?.[catTitle])
                    ? productsByCategory[catTitle]
                    : [];

                return (
                    <div key={idx} className='px-5 mb-10'
                        data-aos="fade-right"
                        data-aos-duration="1000"
                        data-aos-easing="ease-in-out">
                        <div className='flex justify-between items-center mb-5'
                        >
                            <h2 className='text-black sm:text-2xl lg:text-3xl  font-bold'>{category.title}</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => scrollLeft(category.title)}
                                    className="bg-gray-300 w-10 h-10 sm:w-12 sm:h-12 rounded-full justify-center flex items-center pr-1 cursor-pointer hover:bg-gray-400 group focus:bg-black"
                                >
                                    <GoChevronLeft className="text-[30px] text-gray-800 group-focus:invert" />
                                </button>
                                <button
                                    onClick={() => scrollRight(category.title)}
                                    className="bg-gray-300 w-10 h-10 sm:w-12 sm:h-12 rounded-full justify-center flex items-center cursor-pointer hover:bg-gray-400 group focus:bg-black focus:text-white"
                                >
                                    <GoChevronRight className="text-[30px] text-gray-800 group-focus:invert font-thin" />
                                </button>
                            </div>
                        </div>

                        {/* Product list */}
                        <div
                            data-aos="fade-up"
                            data-aos-duration="600"
                            data-aos-easing="ease-in-out"
                            ref={(el) => {
                                if (el) scrollRefs.current[category.title] = el;
                            }}
                            className="overflow-x-auto no-scrollbar cursor-pointer scroll-smooth transition ease-in-out duration-300">
                            <div className="flex w-fit space-x-4">
                                {(productsByCategory[category.title] || []).map((product) => {
                                    return (
                                        <div
                                            key={product.id}
                                            className="xl:w-[calc(90vw/5-1rem)] lg:w-[calc(90vw/5-1rem)] md:w-[calc(90vw/4-1rem)] sm:w-[calc(90vw-1rem)] flex-shrink-0 border border-gray-300 outline w-full sm:w-[calc(97vw/2-2rem)] justify-between rounded-[25px] cursor-pointer p-3"
                                            onClick={() => window.open(`${DOMAIN}/productDetail/${product.slug}`, '_blank')}
                                        >

                                            <div className="overflow-hidden rounded-[25px]">
                                                {product.imageUrl ? (
                                                    <div className="relative h-56 rounded-[25px] overflow-hidden">
                                                        <Image
                                                            src={product.imageUrl}
                                                            alt={product.title}

                                                            fill
                                                            className="object-cover hover:scale-110 transition-transform duration-300"
                                                        />
                                                    </div>) : (
                                                    <div className=" h-64 bg-gray-200 flex items-center justify-center rounded-[25px]">
                                                        <span className="text-gray-500 text-sm">Không có ảnh</span>
                                                    </div>
                                                )}
                                            </div>

                                            <ToggleFavorite
                                                productId={product.id}
                                                productTitle={product.title} />
                                            <div className="font-bold flex text-sm sm:text-base mt-1">
                                                <p className="mr-2 text-black">Giá tiền:</p>
                                                <p className="text-red-500">{Number(product.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                                            </div>
                                            <div className='flex items-center mt-4 px-2'>
                                                <button type="button" className="w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium cursor-pointer text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 rounded-lg dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                                                    onClick={() => window.open(`${DOMAIN}/productDetail/${product.slug}`, '_blank')}>Mua Ngay</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className='w-full text-end'>
                            <a className='text-black mr-8 text-lg cursor-pointer hover:underline'
                                href={`/danhmuc/${encodeURIComponent(category.title)}`}
                            >Xem tất cả</a>
                        </div>
                    </div>
                );
            })}
        </>
    );
}