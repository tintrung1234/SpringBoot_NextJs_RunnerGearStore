'use client'
import React, { useEffect, useRef, useState } from "react";
import './NavBar.css';
import UserIcon from '../public/assets/img/User.png';
import ic_dropdown from '../public/assets/img/ic_dropdown.png';
import axios from "axios";
import SearchBox from "./SearchBox";
import Link from "next/link";
import Image from "next/image";

const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

type Category = {
    _id: string;
    title: string;
};

export default function NavBar() {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(`${DOMAIN}/api/categories`);
                setCategories(response.data);
            } catch (error) {
                console.error("Lỗi khi tải danh mục:", error);
            }
        };

        fetchCategories();
    }, []);

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

    useEffect(() => {
        const handleScroll = () => {
            const navbar = document.getElementById('navbar');
            if (navbar) {
                if (window.scrollY > 10) {
                    navbar.classList.add('squares');
                    navbar.classList.remove('mt-2');
                } else {
                    navbar.classList.remove('squares');
                    navbar.classList.add('mt-2');
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    return (
        <div className="w-full flex justify-center z-20 px-4 sm:px-6 lg:px-8">
            <nav id="navbar" className="navbar mt-2 fixed content-center flex color-black items-center px-4 sm:px-5 lg:px-6 rounded-[15px] w-full max-full transition-all duration-500 ease-in-out shadow-xl z-9990">
                <div className="flex w-full items-center justify-between">
                    <Link href="/" className="text-white text-lg sm:text-xl lg:text-2xl font-bold textcss cursor-pointer hover:scale-110 transition-transform duration-300">DealHawk</Link>
                    <div className="sm:hidden">
                        <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                    <div className={`flex-col sm:flex-row items-center text-xs w-full sm:w-auto justify-end space-y-2 sm:space-y-0 sm:space-x-4 lg:space-x-6 ${isMobileMenuOpen ? 'flex' : 'hidden sm:flex'} mt-4 sm:mt-0 bg-gray-900 sm:bg-transparent p-4 sm:p-0 rounded-lg sm:rounded-none absolute sm:static top-10 left-0 right-0 sm:top-auto sm:left-auto`}>
                        <div className="relative h-8 w-40 ml-3 flex items-center justify-end transition-all duration-300 focus-within:w-60">
                            <SearchBox type="1" />
                        </div>

                        {/* Dropdown */}
                        <div className="relative inline-block text-left" ref={dropdownRef}>
                            <div className="flex items-center" onClick={() => setIsOpen(!isOpen)}>
                                <button className="btn text-sm text-xs sm:text-sm text-white cursor-pointer mr-1">
                                    Danh mục
                                </button>
                                <Image src={ic_dropdown} alt="dropdown" className="cursor-pointer w-[7px] h-[5px] mt-1" />
                            </div>
                            {isOpen && (
                                <div className="absolute right-0 mt-3 w-44 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                    <div className="py-1">
                                        {categories.map((category, idx) => (
                                            <a
                                                key={idx}
                                                href={`/danhmuc/${encodeURIComponent(category.title)}`}
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-[15px] sm:text-[16px]"
                                            >
                                                {category.title}
                                            </a>
                                        ))}

                                    </div>
                                </div>
                            )}
                        </div>
                        <a href="/topdeal" className="btn text-sm sm:text-sm  text-white cursor-pointer">Top Deal</a>
                        <a href="/DeXuat" className="btn text-xs sm:text-sm  text-white cursor-pointer">Đề xuất</a>
                        <a href="/blog" className="btn text-xs sm:text-sm  text-white cursor-pointer">Blog</a>
                        <a href="/taikhoan" className="btn text-xs sm:text-sm  text-white cursor-pointer flex items-center">
                            <Image src={UserIcon} alt="userimage" className="w-4 h-4 sm:w-5 sm:h-5 inline-block mr-1 sm:mr-2" />
                        </a>
                    </div>
                </div>
            </nav>
        </div>
    );
}