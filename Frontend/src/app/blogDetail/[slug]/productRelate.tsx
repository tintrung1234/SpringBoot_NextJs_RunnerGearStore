'use client'

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ToggleFavorite from "../../../../components/toggleFavoriteProduct";
import Image from "next/image";

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number | string;
    category: string
    views: number;
    rating: number;
    imageUrl: string;
    URL: string;
}

export default function ProductRelate({ categoryName }: { categoryName: string }) {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const fetchAllProducts = async () => {
            // Only proceed if post and category are available
            if (!categoryName) return;

            try {
                const res = await axios.get(
                    `${DOMAIN}/api/products/category/${encodeURIComponent(categoryName)}`
                );
                setProducts(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error(error);
                toast.error("Không thể tải dữ liệu sản phẩm.");
            }
        };

        fetchAllProducts();
    }, [DOMAIN, categoryName]);


    return (
        <div className={`px-4 lg:w-1/5 sm:w-full`}>
            <h2 className={`text-xl font-bold mb-4 text-black text-black`}>Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-1">
                {products.length === 0 ? (<div className="text-black">Không có sản phẩm tương tự</div>) :
                    (products.slice(0, 5).map((Product, index) => (
                        <div
                            className="flex flex-col w-[calc(1/4vw/2-1rem)] space-x-4 mb-2 cursor-pointer border border-gray-300 p-2 hover:shadow-lg transition-shadow duration-300"
                            data-aos="fade-right"
                            key={index}
                            onClick={() => window.open(Product.URL, "_blank")}
                        >
                            <div className="w-full h-20 relative bg-gray-100 flex items-center justify-center text-sm text-gray-500">
                                {Product.imageUrl ? (
                                    <Image
                                        src={Product.imageUrl}
                                        alt="Product image"
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                ) : (
                                    <span>Không có hình ảnh</span>
                                )}
                            </div>

                            <div className="mt-2">
                                <span className="text-stone-600 text-sm font-semibold">
                                    {Product.category}
                                </span>
                                <ToggleFavorite productId={Product._id} productTitle={Product.title} />
                                <div className="font-bold flex text-xs mt-1">
                                    <p className="mr-2 text-black">Giá tiền:</p>
                                    <p className="text-red-500">{Number(Product.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                                </div>
                            </div>
                        </div>
                    )))}
            </div>
        </div>
    )
}
