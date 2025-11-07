'use client'

import React, { useEffect, useState } from 'react';
import SearchBox from '../../../components/SearchBox';
import Image from 'next/image';
import ic_star from '../../../public/assets/img/ic_star.png'
import thumb from '../../../public/assets/img/thumb.png';
import axios from 'axios';
import { toast } from 'react-toastify';
import Breadcrumb from '../../../components/BreadCrumb';

interface ProductType {
    imageUrl: string;
    title: string;
    description: string;
    price: number;
    views?: number;
    rating?: number;
    URL: string;
}

export default function SoSanh() {
    const [top2Products, setTop2Products] = useState<ProductType[]>([]);
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    useEffect(() => {
        const getTop2Products = async () => {
            try {
                const response = await axios.get(`${DOMAIN}/api/products/top2product`);
                setTop2Products(response.data);
            } catch (error) {
                toast.error("Không thể tải dữ liệu bài giảm giá!");
                console.error("Error fetching top products:", error);
            }
        };
        getTop2Products();
    }, []);

    const SuggestedProduct = ({ product }: { product: ProductType }) => {
        const { imageUrl, title, description, price, views = 0, rating = 5, URL } = product;

        return (
            <div className="flex sm:flex-row items-start space-x-2 sm:space-x-3 lg:space-x-4 mb-4 sm:mb-5 lg:mb-6 cursor-pointer"
                onClick={() => window.open(URL || "_blank")}>
                {/* Hình ảnh */}
                <div className="relative bg-gray-300 rounded-lg shrink-0 w-24 h-24 sm:w-40 sm:h-24 lg:w-36 lg:h-36">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-cover rounded-lg"
                        />
                    ) : null}
                </div>

                {/* Thông tin sản phẩm */}
                <div className="flex-1 w-full">
                    <div className="flex justify-between text-gray-400 text-xs sm:text-sm lg:text-base mb-1 sm:mb-2">
                        <span>Views: {views}</span>
                        <span className="flex items-center text-yellow-500">
                            <Image src={ic_star} alt="Star icon" width={20} height={20} className="mr-1" />
                            {rating}
                        </span>
                    </div>
                    <h2 className="font-bold text-xs sm:text-sm lg:text-base text-black mb-1 sm:mb-2">{title}</h2>
                    <p className="text-[0.6rem] sm:text-xs lg:text-sm text-gray-700 mb-1 sm:mb-2 break-words line-clamp-2 text-muted">
                        Mô tả:
                        <br />
                        <span dangerouslySetInnerHTML={{ __html: description }} />
                    </p>
                    <p className="text-xs sm:text-sm lg:text-base font-bold text-red-600">
                        Giá tiền: {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div className="mt-16 sm:mt-20 lg:mt-20 px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12 lg:mb-14 w-full max-w-screen-xl flex flex-col mx-auto">
            <Breadcrumb />

            <div className="mt-3 relative banner-yellow w-full flex flex-col sm:flex-row items-center justify-between px-4 sm:px-10 lg:px-20 py-6 sm:py-8 lg:py-10 rounded-2xl">
                <h1
                    data-aos="fade-right"
                    data-aos-duration="1000"
                    data-aos-easing="ease-in-out"
                    className="text-xl sm:text-2xl lg:text-3xl text-black font-bold text-center sm:text-start w-full sm:w-1/2 lg:w-[24vw] mb-4 sm:mb-0"
                >
                    Nhập tên sản phẩm mà bạn muốn mua
                </h1>
                <div className="absolute top-10 right-[3vw] w-[30vw] h-9 mt-4 sm:mt-6 lg:mt-8 px-4 sm:px-6 lg:px-8 hidden xl:block 2xl:block">
                    <SearchBox />
                </div>
            </div>

            <div className="w-full mt-4 sm:mt-6 lg:mt-8 px-4 sm:px-6 lg:px-8 block xl:hidden 2xl:hidden">
                <SearchBox />
            </div>

            <div
                className="p-3 sm:p-4 lg:p-6"
                data-aos="fade-right"
                data-aos-duration="600"
                data-aos-easing="ease-in-out"
            >
                <h2 className="text-sm sm:text-base lg:text-lg font-semibold flex items-center mb-3 sm:mb-4 text-black">
                    <Image src={thumb} alt="Thumb icon" width={30} height={30} className="mr-2 sm:mr-3 mt-1 sm:mt-2 mb-1" />
                    Sản phẩm đề xuất
                </h2>

                {top2Products.map((product, index) => (
                    <SuggestedProduct key={index} product={product} />
                ))}
            </div>
        </div>
    );
}
