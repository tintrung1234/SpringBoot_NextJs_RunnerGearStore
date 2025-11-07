'use client'
import React, { useState, useEffect } from 'react';
import arrow from "../../../public/assets/img/left.png";
import ic_star from '../../../public/assets/img/ic_star.png'
import axios from 'axios';
import ToggleFavorite from '../../../components/toggleFavoriteProduct';
import Image from 'next/image';
import Breadcrumb from '../../../components/BreadCrumb';

const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number | string;
    views: number;
    rating: number;
    imageUrl: string;
    URL: string;
}

export default function TopDeal() {
    const [Products, setProducts] = useState<Product[]>([]);

    // Fetch top Products
    useEffect(() => {
        const getDiscountProducts = async () => {
            try {
                const response = await axios.get(
                    `${DOMAIN}/api/products/getdiscountproducts`
                );
                setProducts(response.data);
            } catch (error) {
                console.error("Error fetching top blog:", error);
            }
        };
        getDiscountProducts();
    }, []);

    // Paging
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 12;

    const totalPages = Math.ceil(Products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = Products.slice(startIndex, startIndex + itemsPerPage);

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    return (
        <div className='mt-16 sm:mt-20 lg:mt-24'>
            <div className="ml-[2vw]">
                <Breadcrumb />
            </div>
            <div className='px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12 lg:mb-14 w-full max-w-screen-xl flex flex-col mx-auto'>
                <h1 className='text-xl sm:text-2xl lg:text-3xl text-black mb-3 sm:mb-4 lg:mb-5 font-bold text-shadow-lg text-center'>
                    TOP GIẢM GIÁ HÀNG TUẦN
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 p-4 sm:p-6">
                    {currentItems.map(product => {
                        return (
                            <div
                                key={product._id}
                                className='border border-gray-300 rounded-2xl sm:rounded-3xl cursor-pointer shadow-md hover:shadow-lg transition-shadow duration-300'
                                data-aos="fade-up"
                                data-aos-duration="600"
                                data-aos-easing="ease-in-out"
                            >
                                <div className=''
                                    onClick={() => window.open(product.URL || "_blank")}>
                                    <div className='w-full h-40 relative'>
                                        {product.imageUrl ? (
                                            <Image
                                                fill
                                                src={product.imageUrl}
                                                className="sm:h-48 lg:h-56 object-cover rounded-t-2xl sm:rounded-t-3xl"
                                                alt={product.title}
                                            />
                                        ) :
                                            <span>Không có hình ảnh</span>
                                        }
                                    </div>
                                    <div className='flex justify-between px-3 sm:px-4 lg:px-5 items-center mt-2 sm:mt-3 mb-1 sm:mb-2'>
                                        <div className='flex'>
                                            <h2 className='text-gray-400 font-bold text-xs sm:text-sm lg:text-base mr-1 sm:mr-2'>Views:</h2>
                                            <h2 className='text-gray-400 font-bold text-xs sm:text-sm lg:text-base'>{product.views || '0'}</h2>
                                        </div>
                                        <div className='flex items-center'>
                                            <div className='relative w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mr-1'>
                                                <Image fill src={ic_star} alt="Star icon" />
                                            </div>
                                            <h2 className='text-black font-bold text-sm sm:text-base lg:text-lg'>{product.rating}</h2>
                                        </div>
                                    </div>
                                    <div className='px-5'>
                                        <ToggleFavorite productId={product._id} productTitle={product.title} />
                                    </div>
                                    <div className="font-bold flex text-xs sm:text-sm lg:text-base mt-1 sm:mt-2 px-3 sm:px-4 lg:px-5 mb-2 sm:mb-3">
                                        <p className="mr-1 sm:mr-2 text-black">Giá tiền:</p>
                                        <p className="text-red-500">{Number(product.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                                    </div>
                                    <div className='flex items-center mt-4 px-6 w-full'>
                                        <button type="button" className="w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium cursor-pointer text-sm px-5 py-2.5 mb-4 dark:bg-gray-800 rounded-lg dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Mua Ngay</button>
                                    </div>
                                </div>

                            </div>
                        )
                    })}
                </div>
                <div className="flex w-full justify-center">
                    <div className="flex justify-center items-center space-x-1 sm:space-x-2 p-4 sm:p-6">
                        {/* Previous Button */}
                        <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            className="p-1 sm:p-2 border border-gray-300 rounded-full disabled:opacity-50 disabled:cursor-default cursor-pointer hover:bg-gray-100 transition-colors duration-300"
                            disabled={currentPage === 1}
                            aria-label="Previous page"
                        >
                            <div className="relative w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6">
                                <Image src={arrow} alt="Previous page" fill className="object-contain" />
                            </div>
                        </button>

                        {/* Page Numbers */}
                        {pages.map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-2 py-1 text-sm sm:px-3 sm:py-1 lg:px-4 lg:py-2 border border-gray-300 rounded-full transition-colors duration-300 ${page === currentPage
                                    ? 'bg-gray-500 text-white cursor-default'
                                    : 'hover:bg-gray-100 cursor-pointer text-black'
                                    }`}
                                aria-current={page === currentPage ? 'page' : undefined}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next Button */}
                        <button
                            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                            className="p-1 sm:p-2 border border-gray-300 rounded-full disabled:opacity-50 disabled:cursor-default cursor-pointer hover:bg-gray-100 transition-colors duration-300"
                            disabled={currentPage === totalPages}
                            aria-label="Next page"
                        >
                            <div className="relative w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 rotate-180">
                                <Image src={arrow} alt="Next page" fill className="object-contain" />
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
}