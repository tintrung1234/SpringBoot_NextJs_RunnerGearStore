'use client'

import React, { useState, useEffect } from 'react';
import { IoMdHeartEmpty, IoMdHeart } from 'react-icons/io';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

interface User {
    id: number;
    username: string;
    email?: string;
    role?: string;
    favoritesPost?: string[];
    favoritesProduct: string[];
}

interface FavoriteToggleProduct {
    productId: string;
    productTitle?: string;
}

export default function ToggleFavorite({ productId, productTitle }: FavoriteToggleProduct) {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [favorite, setFavorite] = useState<string[]>([]);

    // Get user and token from cookies
    useEffect(() => {
        const storedToken = Cookies.get('token');
        const rawUser = Cookies.get('user');

        setToken(storedToken || null);

        try {
            const parsedUser = rawUser ? JSON.parse(rawUser) : null;
            setUser(parsedUser);
            setFavorite(parsedUser?.favoritesProduct || []);
        } catch (err) {
            console.error('Error parsing user:', err);
            setUser(null);
            setFavorite([]);
        }
    }, []);

    const toggle = async () => {
        if (!token || !user) {
            toast.warning('Vui lòng đăng nhập để thêm vào yêu thích.');
            return;
        }

        try {
            // Ensure productId is a string
            const productIdString = String(productId);

            const response = await axios.put(
                `${DOMAIN}/api/users/${user.id}/toggle-product`,
                { productId: productIdString },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Handle response from UserDTO
            const updatedFavorites: string[] = response.data.favoritesProduct || [];

            // Update state first
            setFavorite(updatedFavorites);

            // Update user in cookie - preserve all existing user data
            const updatedUser: User = {
                ...user,
                id: response.data.id,
                username: response.data.username,
                email: response.data.email || user.email,
                role: response.data.role || user.role,
                favoritesPost: response.data.favoritesPost || user.favoritesPost || [],
                favoritesProduct: updatedFavorites,
            };

            Cookies.set('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            // Show success message - compare strings
            if (updatedFavorites.includes(productIdString)) {
                toast.success('Đã thêm vào yêu thích!');
            } else {
                toast.info('Đã xóa khỏi yêu thích!');
            }
        } catch (err: unknown) {
            console.error('Error toggling favorite:', err);
            if (axios.isAxiosError(err)) {
                toast.error(err?.response?.data?.message || 'Lỗi khi cập nhật yêu thích.');
            } else {
                toast.error('Lỗi khi cập nhật yêu thích.');
            }
        }
    };

    // Ensure string comparison
    const isProductFavorite = favorite.includes(String(productId));

    return (
        <>
            <ToastContainer />
            <div className='flex sm:flex-row justify-between w-full items-center mt-3 mb-2'>
                <h2 className="text-black font-bold text-[18px] line-clamp-1 text-muted">
                    {productTitle}
                </h2>
                <div
                    onClick={(e) => {
                        e.stopPropagation();
                        toggle();
                    }}
                    className='cursor-pointer transition-colors duration-300 p-1 hover:bg-gray-100 rounded-full'
                >
                    {isProductFavorite ? (
                        <IoMdHeart className='w-7 h-7 text-red-500 transition-colors duration-200' />
                    ) : (
                        <IoMdHeartEmpty className='w-7 h-7 text-gray-600 hover:text-red-500 transition-colors duration-200' />
                    )}
                </div>
            </div>
        </>
    );
}