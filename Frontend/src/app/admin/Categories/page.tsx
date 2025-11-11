'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface CategoryType {
    id: string;
    title: string;
}

export default function Admin_ShowAllCategories() {
    const router = useRouter();
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const [categories, setCategories] = useState<CategoryType[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const categoriesPerPage = 10;
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        category: CategoryType | null;
    }>({
        visible: false,
        x: 0,
        y: 0,
        category: null,
    });

    useEffect(() => {
        const fetchcategories = async () => {
            try {
                const response = await axios.get(`${DOMAIN}/api/categories`);
                setCategories(response.data);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            }
        };

        fetchcategories();
        // Hide context menu when clicking elsewhere
        const handleClick = () => setContextMenu({ ...contextMenu, visible: false });
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);

    }, []);

    const handleRightClick = (e: React.MouseEvent, category: CategoryType) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            category,
        });
    };

    const handleEdit = () => {
        if (!contextMenu.category) return;
        router.push(
            `/admin/Categories/editCategory/${contextMenu.category.id}`
        );
    };

    // Tính tổng số trang
    const totalPages = Math.ceil(categories.length / categoriesPerPage);

    // Lấy danh sách sản phẩm cho trang hiện tại
    const indexOfLastCategory = currentPage * categoriesPerPage;
    const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage;
    const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);

    // Hàm chuyển trang
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 text-black">
            <h2 className="text-2xl font-bold mb-4">Tất cả danh mục</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {currentCategories.map((category) => (
                    <div
                        key={category.id}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
                        onContextMenu={(e) => handleRightClick(e, category)}
                    >
                        <h3 className="text-lg font-bold mt-2">{category.title}</h3>
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
