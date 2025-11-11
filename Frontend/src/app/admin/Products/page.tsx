'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProductType {
    id: string;
    image_slug: string;
    title: string;
    description: string;
    discount: number;
    price: number;
    views?: number;
    rating?: number;
    slug?: string;
}

export default function Admin_ShowAllProducts() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const router = useRouter();
    const [products, setProducts] = useState<ProductType[]>([]);
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        product: ProductType | null;
    }>({
        visible: false,
        x: 0,
        y: 0,
        product: null,
    });
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 10;

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(`${DOMAIN}/api/products`);
                setProducts(response.data);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            }
        };
        fetchProducts();

        // Hide context menu when clicking elsewhere
        const handleClick = () => setContextMenu({ ...contextMenu, visible: false });
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);

    }, []);

    const handleRightClick = (e: React.MouseEvent, product: ProductType) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            product,
        });
    };

    const handleEdit = () => {
        if (!contextMenu.product) return;
        router.push(
            `/admin/Products/editProducts/${contextMenu.product.id}`
        );
    };

    const [searchTerm, setSearchTerm] = useState('');

    const filteredProducts = products.filter((product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const indexOfLastPost = currentPage * productsPerPage;
    const indexOfFirstPost = indexOfLastPost - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstPost, indexOfLastPost);

    // Hàm chuyển trang
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 text-black">
            <h2 className="text-2xl font-bold mb-4">Tất cả sản phẩm</h2>

            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm bài viết theo tiêu đề..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full md:w-1/2 px-4 py-2 border rounded focus:outline-none"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {currentProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
                        onContextMenu={(e) => handleRightClick(e, product)}
                    >
                        <div className='relative w-full h-40'>
                            {product.image_slug ? (
                                <Image
                                    fill
                                    src={product.image_slug}
                                    alt={product.title}
                                    className="object-cover rounded"
                                />
                            ) : <span>Không có hình ảnh</span>}
                        </div>
                        <h3 className="text-lg font-bold mt-2">{product.title}</h3>
                        <p className="text-red-500 font-semibold">{product.price}₫</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1"
                            dangerouslySetInnerHTML={{ __html: product.description }}></p>
                    </div>
                ))}
            </div>

            {/* Pagination controls */}
            <div className="flex justify-center items-center mt-6 space-x-2">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                >
                    Trang trước
                </button>

                {/* Hiển thị số trang */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 border rounded hover:bg-gray-100 cursor-pointer ${currentPage === page ? 'bg-gray-300 font-bold' : ''
                            }`}
                    >
                        {page}
                    </button>
                ))}

                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
                >
                    Trang sau
                </button>
            </div>
            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className="absolute z-50 bg-white border border-gray-300 shadow-md rounded p-2"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        className="block w-full text-left px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        onClick={handleEdit}
                    >
                        ✏️ Chỉnh sửa
                    </button>
                </div>
            )}
        </div>
    );
}
