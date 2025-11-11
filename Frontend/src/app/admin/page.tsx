'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import Link from 'next/link';
import {
    FaBox,
    FaNewspaper,
    FaEye,
    FaChartLine
} from 'react-icons/fa';

interface Stats {
    totalProducts: number;
    totalPosts: number;
    totalProductViews: number;
    totalPostViews: number;
}

interface Product {
    id: string;
    title: string;
    image_url: string;
    price: number;
    views: number;
    slug: string;
}

interface Post {
    id: string;
    title: string;
    imageUrl: string;
    views: number;
    slug: string;
    createdAt: string;
}

export default function AdminDashboard() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const [stats, setStats] = useState<Stats>({
        totalProducts: 0,
        totalPosts: 0,
        totalProductViews: 0,
        totalPostViews: 0
    });
    const [recentProducts, setRecentProducts] = useState<Product[]>([]);
    const [recentPosts, setRecentPosts] = useState<Post[]>([]);
    const [topProducts, setTopProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!DOMAIN) return;

        const fetchData = async () => {
            try {
                const [statsRes, productsRes, postsRes, topRes] = await Promise.all([
                    axios.get(`${DOMAIN}/api/dashboard/stats`),
                    axios.get(`${DOMAIN}/api/dashboard/recent-products`),
                    axios.get(`${DOMAIN}/api/dashboard/recent-posts`),
                    axios.get(`${DOMAIN}/api/dashboard/top-products`)
                ]);

                setStats(statsRes.data);
                setRecentProducts(productsRes.data);
                setRecentPosts(postsRes.data);
                setTopProducts(topRes.data);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                toast.error('Không thể tải dữ liệu dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [DOMAIN]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <ToastContainer />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-600 mt-2">Tổng quan quản lý cửa hàng</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm">Tổng sản phẩm</p>
                            <h3 className="text-3xl font-bold mt-2">{stats.totalProducts}</h3>
                        </div>
                        <FaBox className="text-5xl text-blue-200 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm">Tổng bài viết</p>
                            <h3 className="text-3xl font-bold mt-2">{stats.totalPosts}</h3>
                        </div>
                        <FaNewspaper className="text-5xl text-green-200 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm">Lượt xem sản phẩm</p>
                            <h3 className="text-3xl font-bold mt-2">{stats.totalProductViews}</h3>
                        </div>
                        <FaEye className="text-5xl text-purple-200 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-orange-100 text-sm">Lượt xem bài viết</p>
                            <h3 className="text-3xl font-bold mt-2">{stats.totalPostViews}</h3>
                        </div>
                        <FaChartLine className="text-5xl text-orange-200 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Recent Products */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Sản phẩm mới nhất</h2>
                        <Link href="/admin/Products" className="text-blue-600 hover:text-blue-800 text-sm">
                            Xem tất cả →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentProducts.map((product) => (
                            <div key={product.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                                <div className="relative w-16 h-16 flex-shrink-0">
                                    <Image
                                        src={product.image_url || '/placeholder.png'}
                                        alt={product.title}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/admin/Products/editProducts/${product.slug}`}>
                                        <h3 className="font-semibold text-gray-800 truncate hover:text-blue-600">
                                            {product.title}
                                        </h3>
                                    </Link>
                                    <p className="text-sm text-gray-600">
                                        {product.price.toLocaleString('vi-VN')}đ
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {product.views} views
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Posts */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Bài viết mới nhất</h2>
                        <Link href="/admin/Posts" className="text-blue-600 hover:text-blue-800 text-sm">
                            Xem tất cả →
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {recentPosts.map((post) => (
                            <div key={post.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
                                <div className="relative w-16 h-16 flex-shrink-0">
                                    <Image
                                        src={post.imageUrl || '/placeholder.png'}
                                        alt={post.title}
                                        fill
                                        className="object-cover rounded"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Link href={`/admin/posts/${post.slug}`}>
                                        <h3 className="font-semibold text-gray-800 truncate hover:text-blue-600">
                                            {post.title}
                                        </h3>
                                    </Link>
                                    <p className="text-xs text-gray-500">
                                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                                    </p>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {post.views} views
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Top sản phẩm được xem nhiều nhất</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {topProducts.map((product) => (
                        <Link
                            key={product.id}
                            href={`/admin/Products/editProducts/${product.slug}`}
                            className="group"
                        >
                            <div className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                                <div className="relative w-full h-40">
                                    <Image
                                        src={product.image_url || '/placeholder.png'}
                                        alt={product.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition"
                                    />
                                </div>
                                <div className="p-3">
                                    <h3 className="font-semibold text-sm text-gray-800 truncate group-hover:text-blue-600">
                                        {product.title}
                                    </h3>
                                    <div className="flex items-center justify-between mt-2">
                                        <p className="text-sm text-blue-600 font-bold">
                                            {product.price.toLocaleString('vi-VN')}đ
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {product.views} views
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}