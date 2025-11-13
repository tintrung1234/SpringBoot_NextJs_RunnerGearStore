'use client'

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { FaUserEdit } from "react-icons/fa";
import { BsCart4 } from "react-icons/bs";
import { MdOutlineDashboard } from "react-icons/md";
import { IoIosLogOut, IoMdInformationCircleOutline } from "react-icons/io";
import { AiOutlinePicture } from "react-icons/ai";
import { IoIosArrowDown } from "react-icons/io";
import { FaImages } from "react-icons/fa6";
import { IoBagCheckOutline } from "react-icons/io5";
import clsx from 'clsx';
import Cookies from 'js-cookie';

const navItems = [
    { path: '/admin', label: 'Dashboard', icon: <MdOutlineDashboard /> },
    { path: '/admin/orders', label: 'Orders', icon: <IoBagCheckOutline /> },
    { path: '/admin/user', label: 'User', icon: <FaUserEdit /> },
    { path: '/admin/banner', label: 'Banner', icon: <AiOutlinePicture /> },
    { path: '/admin/information', label: 'Information', icon: <IoMdInformationCircleOutline /> },
    { path: '/admin/assets', label: 'Assets', icon: <FaImages /> },
];

export default function Sidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const [showProductSubnav, setShowProductSubnav] = useState(false);
    const [showCategorySubnav, setShowCategorySubnav] = useState(false);
    const [showPostSubnav, setShowPostSubnav] = useState(false);

    useEffect(() => {
        setShowProductSubnav(pathname.startsWith('/admin/Products'));
        setShowCategorySubnav(pathname.startsWith('/admin/Categories'));
        setShowPostSubnav(pathname.startsWith('/admin/Posts'));
    }, [pathname]);

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("user");
        router.push("/login");
    };

    const linkClass = (active: boolean) =>
        clsx(
            'px-4 py-2 rounded flex items-center text-left font-medium text-l',
            active ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-black'
        );

    const subLinkClass = (active: boolean) =>
        clsx(
            'px-4 py-2 rounded text-left font-medium',
            active ? 'bg-gray-300 text-black' : 'hover:bg-gray-200 text-black'
        );


    return (
        <div className="w-64 bg-white border-r p-6 space-y-4 shadow min-h-screen">

            <nav className="flex flex-col space-y-2">
                {navItems.map((item) => (
                    <Link key={item.path} href={item.path} className={linkClass(pathname === item.path)}>
                        <div className="mr-2">{item.icon}</div>
                        {item.label}
                    </Link>
                ))}

                {/* 📂 Products with subnav */}
                <button
                    onClick={() => setShowProductSubnav((prev) => !prev)}
                    className="px-4 py-2 rounded text-left flex items-center font-medium hover:bg-gray-200 text-black w-full cursor-pointer"
                >
                    <BsCart4 className='mr-2' /> Sản phẩm <IoIosArrowDown className='mt-1 ml-2' />
                </button>

                {showProductSubnav && (
                    <div className="ml-4 flex flex-col space-y-1 text-l">
                        <Link href="/admin/Products" className={subLinkClass(pathname === '/admin/Products')}>
                            📋 Tất cả sản phẩm
                        </Link>
                        <Link href="/admin/Products/editProducts" className={subLinkClass(pathname === '/admin/Products/editProducts')}>
                            ✏️ Thêm / Sửa
                        </Link>
                    </div>
                )}

                {/* 🗂️ Danh mục */}
                <button
                    onClick={() => setShowCategorySubnav((prev) => !prev)}
                    className="px-4 py-2 flex items-center rounded text-left font-medium hover:bg-gray-200 text-black w-full cursor-pointer"
                >
                    🗂️ Danh mục <IoIosArrowDown className='mt-1 ml-2' />
                </button>
                {showCategorySubnav && (
                    <div className="ml-4 flex flex-col space-y-1 text-l">
                        <Link href="/admin/Categories" className={subLinkClass(pathname === '/admin/Categories')}>
                            📁 Tất cả danh mục
                        </Link>
                        <Link href="/admin/Categories/editCategory" className={subLinkClass(pathname === '/admin/Categories/editCategory')}>
                            ➕ Thêm / Sửa
                        </Link>
                    </div>
                )}


                {/* 📝 Bài viết */}
                <button
                    onClick={() => setShowPostSubnav((prev) => !prev)}
                    className="px-4 py-2 rounded flex items-center text-left font-medium hover:bg-gray-200 text-black w-full cursor-pointer"
                >
                    📝 Bài viết <IoIosArrowDown className='mt-1 ml-2' />
                </button>
                {showPostSubnav && (
                    <div className="ml-4 flex flex-col space-y-1 text-l">
                        <Link href="/admin/Posts" className={subLinkClass(pathname === '/admin/Posts')}>
                            📃 Tất cả bài viết
                        </Link>
                        <Link href="/admin/Posts/editPosts" className={subLinkClass(pathname === '/admin/Posts/editPosts')}>
                            🆕 Đăng bài
                        </Link>
                        <Link href="/admin/Posts/editSEO" className={subLinkClass(pathname === '/admin/Posts/editSEO')}>
                            🔍 Chỉnh SEO
                        </Link>
                    </div>
                )}
                <div className="flex flex-col space-y-1 text-l">
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded text-left font-medium hover:bg-gray-200 flex items-center text-black cursor-pointer"><IoIosLogOut className='mr-2' />Đăng xuất</button>
                </div>
            </nav>
        </div>
    );
}
