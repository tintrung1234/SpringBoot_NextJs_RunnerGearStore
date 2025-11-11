'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PostType {
    id: string;
    title: string;
    category: string;
    image_url: string;
    views: number;
    content: string;
    description: string;
    slug: string;
    created_at: Date
}

export default function Admin_ShowAllPosts() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const router = useRouter();
    const [posts, setPosts] = useState<PostType[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 10;
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        post: PostType | null;
    }>({
        visible: false,
        x: 0,
        y: 0,
        post: null,
    });

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get(`${DOMAIN}/api/posts`);
                setPosts(response.data);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            }
        };

        fetchPosts();

        // Hide context menu when clicking elsewhere
        const handleClick = () => setContextMenu({ ...contextMenu, visible: false });
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);

    }, []);

    const handleRightClick = (e: React.MouseEvent, post: PostType) => {
        e.preventDefault();
        setContextMenu({
            visible: true,
            x: e.pageX,
            y: e.pageY,
            post,
        });
    };

    const handleEdit = () => {
        if (!contextMenu.post) return;
        router.push(
            `/admin/Posts/editPosts/${contextMenu.post.slug}`
        );
    };

    const handleEditSEO = () => {
        if (!contextMenu.post) return;
        router.push(
            `/admin/Posts/editSEO/${contextMenu.post.slug}`
        );
    };

    const [searchTerm, setSearchTerm] = useState("");

    const filteredPosts = posts.filter((post) =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    // Hàm chuyển trang
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 text-black">
            <h2 className="text-2xl font-bold mb-4">Tất cả bài viết</h2>

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
                {currentPosts.map((post) => (
                    <div
                        key={post.id}
                        className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
                        onContextMenu={(e) => handleRightClick(e, post)}
                    >
                        <div className='relative w-full h-40'>
                            {post.image_url ? (
                                <Image
                                    fill
                                    src={post.image_url}
                                    alt={post.title}
                                    className="object-cover rounded"
                                />
                            ) : <span>Không có hình ảnh</span>}
                        </div>
                        <h3 className="text-lg font-bold mt-2">{post.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1"
                            dangerouslySetInnerHTML={{ __html: post.description }}></p>
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
                    <button
                        className="block w-full text-left px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        onClick={handleEditSEO}
                    >
                        🔍 Chỉnh sửa SEO
                    </button>
                </div>
            )}
        </div>
    );
}
