'use client'

import React, { useState, useEffect } from 'react';
import { IoMdHeartEmpty, IoMdHeart } from 'react-icons/io';
import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

interface User {
    _id: string;
    username: string;
    favoritesPost: string[];
}

interface FavoriteTogglePost {
    postId: string;
}

export default function ToggleFavoritePostDetail({ postId }: FavoriteTogglePost) {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;
    const token = Cookies.get('token');

    const [user, setUser] = useState<User | null>(null);
    const [favorite, setFavorite] = useState<string[]>([]);

    // Lấy user từ cookie khi mount
    useEffect(() => {
        const rawUser = Cookies.get('user');
        try {
            const parsedUser = rawUser ? JSON.parse(decodeURIComponent(rawUser)) : null;
            setUser(parsedUser);
            setFavorite(parsedUser?.favoritesPost || []);
        } catch (err) {
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
            const response = await axios.post(
                `${DOMAIN}/api/user/favorites/post`,
                { postId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            const updatedFavorites: string[] = response.data.favoritesPost;
            setFavorite(updatedFavorites);

            const updatedUser: User = { ...user, favoritesPost: updatedFavorites };
            Cookies.set('user', encodeURIComponent(JSON.stringify(updatedUser)));
            setUser(updatedUser); // cập nhật lại state luôn
        } catch (err) {
            toast.error('Lỗi khi thêm sản phẩm vào danh sách yêu thích.');
            console.error(err);
        }
    };

    const isPostFavorite = favorite.includes(postId);

    return (
        <>
            <ToastContainer />
            <div className='flex sm:flex-row justify-between items-center mt-3 mb-2'
                onClick={() => (window.location.href = `/blogDetail/${encodeURIComponent(postId)}`)}
            >
                <div
                    onClick={(e) => {
                        e.stopPropagation(); // Ngăn sự kiện lan lên thẻ cha
                        toggle(); // Gọi hàm toggle yêu thích
                    }}
                    className='cursor-pointer transition-colors duration-300'
                >
                    {isPostFavorite ? (
                        <IoMdHeart className='w-7 h-7 text-red-500 transition-colors duration-200' />
                    ) : (
                        <IoMdHeartEmpty className='w-7 h-7 text-gray-600 hover:text-red-500 transition-colors duration-200' />
                    )}
                </div>
            </div>
        </>
    )
}