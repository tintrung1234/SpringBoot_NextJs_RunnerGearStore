'use client'

import { useEffect, useState, useRef } from "react";
import ic_dropdown_black from '../../../../public/assets/img/ic_dropdown_black.png';
import SearchBox from "../../../../components/SearchBox";
import "./DanhMuc.css"
import arrow from "../../../../public/assets/img/left.png"
// import Breadcrumb from "../components/BreadCrumb";
import ToggleFavorite from "../../../../components/toggleFavoriteProduct";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Breadcrumb from "../../../../components/BreadCrumb";

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    views: number;
    rating: number;
    imageUrl: string;
    URL: string;
}

interface Category {
    _id: string;
    title: string;
}

interface Props {
    categoryName: string;
    categories: Category[];
    products: Product[];
}

export default function DanhMucClient({ categoryName, categories, products }: Props) {

    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 21;
    const router = useRouter();

    // Dùng state để đồng bộ dữ liệu
    const [displayProducts, setDisplayProducts] = useState<Product[]>(products);
    const [selectedCategory, setSelectedCategory] = useState<string>(categoryName);

    useEffect(() => {
        // Mỗi khi categoryName hoặc products từ server thay đổi
        setDisplayProducts(products);
        setSelectedCategory(categoryName);
        setCurrentPage(1); // reset trang khi đổi danh mục
    }, [categoryName, products]);

    // Paging 
    const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentItems = displayProducts.slice(startIndex, startIndex + itemsPerPage);
    const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

    // Xap sep 
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [sortOption, setSortOption] = useState<string>('');

    const handleSort = (option: string) => {
        setSortOption(option);
        setIsOpen(false);

        const sortedProducts = [...displayProducts];
        if (option === 'asc') {
            sortedProducts.sort((a, b) => a.price - b.price);
        } else if (option === 'desc') {
            sortedProducts.sort((a, b) => b.price - a.price);
        }

        setDisplayProducts(sortedProducts);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="mt-24 px-4 sm:px-6 mb-14">
            <div className="flex flex-col lg:flex-row mt-4">
                {/* Category */}
                <div
                    data-aos="fade-right"
                    data-aos-duration="600"
                    data-aos-easing="ease-in-out"
                    className="w-full lg:w-[20vw] border-r-0 lg:border-r lg:border-black pr-0 lg:pr-2">
                    <h2 className="text-[20px] font-bold text-black mb-4 mt-4">Danh Mục</h2>
                    {categories.map((category) => (
                        <div
                            key={category._id || category.title}
                            onClick={() => {
                                if (category.title !== selectedCategory) {
                                    router.push(`/danhmuc/${encodeURIComponent(category.title)}`);
                                }
                            }}
                            className={`p-3 category_button text-black cursor-pointer mb-1 transition-color duration-300
                            ${selectedCategory === category.title ? "category_selected" : ""}`}>
                            <h3 className="font-bold text-[12px]">{category.title}</h3>
                        </div>
                    ))}
                </div>
                {/* Products */}
                <div className="w-full lg:w-[80vw] flex flex-wrap justify-start px-2 mt-2">
                    <div className="flex flex-col sm:flex-row items-center w-full justify-end space-y-3 sm:space-y-0 sm:space-x-5">
                        <div className="flex items-center justify-between w-full ml-3" ref={dropdownRef}>
                            <div className="ml-3">
                                <Breadcrumb />
                            </div>
                            <div className="flex flex-row">
                                <div className="flex items-center cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                                    <button className="btn font-bold text-[16px] text-black mr-1">
                                        Sắp xếp
                                    </button>
                                    <Image src={ic_dropdown_black} alt="dropdown" className="w-[7px] h-[5px] mt-1" />
                                </div>
                                <div className="relative">
                                    {isOpen && (
                                        <div className="absolute right-0 mt-6 w-44 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                            <div className="py-1">
                                                <button
                                                    onClick={() => handleSort('asc')}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Giá tăng dần
                                                </button>
                                                <button
                                                    onClick={() => handleSort('desc')}
                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                >
                                                    Giá giảm dần
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className='h-[5vh] w-full sm:w-[20vw] flex items-center justify-end mb-2'>
                            <SearchBox />
                        </div>
                    </div>
                    {currentItems.length === 0 ? (
                        <div className="text-black w-full justify-center h-full items-center flex ">Không có sản phẩm</div>
                    ) : (
                        currentItems.map(product => {
                            return (
                                <div
                                    key={product._id}
                                    className="w-full sm:w-[48%] lg:w-[calc(80vw/4-1.9rem)] cursor-pointer mx-[0.2vw] border border-gray-300 p-3 hover:shadow-lg transition-shadow duration-300 mb-4 rounded-[25px]"
                                    onClick={() => window.open(product.URL, "_blank")}
                                >
                                    <div className="relative overflow-hidden w-full h-[35vh] rounded-[25px]">
                                        <Image
                                            src={product.imageUrl}
                                            fill
                                            className="object-cover rounded-[25px] hover:scale-110 transition-transform duration-300"
                                            alt={product.title}
                                        />
                                    </div>
                                    <ToggleFavorite productId={product._id} productTitle={product.title} />
                                    <div className="font-bold flex text-[12px] mt-1">
                                        <p className="mr-2 text-black">Giá tiền:</p>
                                        <p className="text-red-500">{Number(product.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                                    </div>
                                    <div className='flex items-center mt-4 px-2'>
                                        <button type="button" className="w-full text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium cursor-pointer text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 rounded-lg dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700">Mua Ngay</button>
                                    </div>
                                </div>
                            )
                        }))}
                </div>
            </div>
            <div className="flex w-full justify-end mt-4">
                <div className="flex flex-wrap p-4 justify-center">
                    <div className="flex justify-center items-center space-x-2 text-black">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className="px-1 py-1 border rounded-full disabled:opacity-50 disabled:cursor-default"
                            disabled={currentPage === 1}
                        >
                            <Image src={arrow} height={23} className="h-[23px]" alt="prev" />
                        </button>
                        {pages.map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-3 py-1 border rounded-full cursor-pointer ${page === currentPage ? 'bg-gray-500 text-white' : ''}`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className="px-1 py-1 border rounded-full disabled:opacity-50 disabled:cursor-default"
                            disabled={currentPage === totalPages}
                        >
                            <Image src={arrow} height={23} className="h-[23px] rotate-180" alt="next" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
