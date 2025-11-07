'use client'

import React, { useState } from 'react';
import { IoMdHeartEmpty, IoMdHeart } from 'react-icons/io';
import axios from 'axios';
import Cookies from 'js-cookie'
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

interface User {
    _id: string;
    username: string;
    favoritesProduct: string[];
    // Add other user fields if needed
}

interface FavoriteToggleProduct {
    productId: string;
    productTitle: string;
}

export default function ToggleFavorite({ productId, productTitle }: FavoriteToggleProduct) {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN
    const token = Cookies.get('token')

    const rawUser = Cookies.get('user');

    let user: User | null = null;
    try {
        user = rawUser ? JSON.parse(decodeURIComponent(rawUser)) : null;
    } catch (err) {
        user = null;
    }

    const [favorite, setFavorite] = useState<string[]>(user?.favoritesProduct || []);


    const toggle = async () => {
        if (!token || !user) {
            toast.warning('Vui lòng đăng nhập để thêm vào yêu thích.');
            return;
        }
        try {
            const response = await axios.post(
                `${DOMAIN}/api/user/favorites/product`,
                { productId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const updatedFavorites: string[] = response.data.favoritesProduct;
            setFavorite(updatedFavorites);

            const updatedUser: User = { ...user, favoritesProduct: updatedFavorites };

            Cookies.set('user', encodeURIComponent(JSON.stringify(updatedUser)));
        } catch (err) {
            toast.error('Lỗi khi thêm sản phẩm vào danh sách yêu thích.');
            console.error(err);
        }
    }

    const isProductFavorite = favorite.includes(productId);

    return (
        <>
            <ToastContainer />
            <div className='flex sm:flex-row justify-between w-full items-center mt-3 mb-2'>
                <h2 className="text-black font-bold text-[18px] line-clamp-1 text-muted">{productTitle}</h2>
                <div onClick={(e) => {
                    e.stopPropagation(); // Ngăn sự kiện lan lên thẻ cha
                    toggle(); // Gọi hàm toggle yêu thích
                }} className='cursor-pointer transition-colors duration-300'>
                    {isProductFavorite ? (
                        <IoMdHeart className='w-7 h-7 text-red-500 transition-colors duration-200' />
                    ) : (
                        <IoMdHeartEmpty className='w-7 h-7 text-gray-600 hover:text-red-500 transition-colors duration-200' />
                    )}
                </div>
            </div>
        </>
    )
}