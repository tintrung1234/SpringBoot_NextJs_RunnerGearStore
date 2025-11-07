'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import image_user from '../../../public/assets/img/image_user.png';
import ic_saved from '../../../public/assets/img/ic_saved.png';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { IoCloseCircleOutline } from "react-icons/io5";
import { Eye, EyeOff } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import Cookies from 'js-cookie';

interface User {
    email?: string;
    username?: string;
    role?: string;
    photoUrl?: string;
    favoritesProduct?: string[];
    favoritesPost?: string[];
    token?: string;
}

interface Product {
    _id: string;
    title: string;
    URL: string;
}

interface Post {
    _id: string;
    title: string;
    slug: string;
}

const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN ?? '';

function isTokenExpired(token: string) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch (e) {
        return true;
    }
}

export default function TaiKhoan() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const rawUser = Cookies.get('user');
        try {
            const decodedUser = rawUser ? decodeURIComponent(rawUser) : null;
            const userData = decodedUser ? JSON.parse(decodedUser) : null;
            setUser(userData);
        } catch (err) {
            console.error('Error decoding or parsing user cookie:', err);
            setUser(null);
        }

        const storedToken = Cookies.get('token');
        setToken(storedToken ?? null);
    }, []);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');

    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const passwordFormRef = useRef<HTMLDivElement | null>(null);

    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [favoritesProduct, setFavoritesProduct] = useState<Product[]>([]);
    const [favoritesPost, setFavoritesPost] = useState<Post[]>([]);

    useEffect(() => {
        if (!user?.favoritesProduct?.length) return;

        axios
            .get(`${DOMAIN}/api/products/search`, {
                params: { ids: user.favoritesProduct.join(',') },
            })
            .then((res) => setFavoritesProduct(res.data))
            .catch((err) => console.error("Error loading favorite products:", err));
    }, [user]);

    useEffect(() => {
        if (!user?.favoritesPost?.length) return;

        axios
            .get(`${DOMAIN}/api/posts/search`, {
                params: { ids: user.favoritesPost.join(',') },
            })
            .then((res) => setFavoritesPost(res.data))
            .catch((err) => console.error("Error loading favorite posts:", err));
    }, [user]);

    const handleRemoveFromFavoritePost = async (postId: string) => {
        if (!token) return;

        try {
            const res = await axios.post(
                `${DOMAIN}/api/user/favorites/post`,
                { postId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedUser = { ...user, favoritesPost: res.data.favoritesPost };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setFavoritesPost((prev) => prev.filter((p) => (p as { _id: string })._id !== postId));
        } catch (err) {
            console.error("Error removing post from wishlist:", err);
        }
    };

    const handleRemoveFromFavoriteProduct = async (productId: string) => {
        if (!token) return;

        try {
            const res = await axios.post(
                `${DOMAIN}/api/user/favorites/product`,
                { productId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedUser = { ...user, favoritesProduct: res.data.favoritesProduct };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setFavoritesProduct((prev) => prev.filter((p) => (p as { _id: string })._id !== productId));
        } catch (err) {
            console.error("Error removing product from wishlist:", err);
        }
    };

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (showPasswordForm && passwordFormRef.current && !passwordFormRef.current.contains(event.target as Node)) {
                setShowPasswordForm(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showPasswordForm]);

    const [showUpdateForm, setShowUpdateForm] = useState(false);
    const updateFormRef = useRef<HTMLDivElement | null>(null);
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (user) {
            setEmail(user.email || '');
            setUsername(user.username || '');
        }
    }, [user]);

    const [isWatching, setIsWatching] = useState(false); // false = xem sản phẩm, true = xem blog

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (showUpdateForm && updateFormRef.current && !updateFormRef.current.contains(event.target as Node)) {
                setShowUpdateForm(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showUpdateForm]);

    axios.interceptors.request.use((config) => {
        const t = Cookies.get('token');
        if (!t || isTokenExpired(t)) {
            Cookies.remove('token');
            Cookies.remove('user');
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            window.location.href = "/login";
            throw new axios.Cancel("Token expired");
        }
        if (t) config.headers.Authorization = `Bearer ${t}`;
        return config;
    });

    const handleUpdateUser = async () => {
        if (!token || !user) return;

        try {
            const res = await axios.put(
                `${DOMAIN}/api/user/update`,
                { email, username, role: user.role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedUser = res.data.user;
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
            toast.success("Cập nhật thông tin thành công!");
        } catch (err) {
            toast.error("Lỗi cập nhật thông tin!");
            console.error(err);
        }
    };

    const handleChangePassword = async () => {
        if (!token) return;

        const toastId = toast.loading("Đang đổi mật khẩu...");

        if (newPassword !== confirmNewPassword) {
            toast.dismiss(toastId);
            return toast.error("Mật khẩu không khớp!");
        }

        try {
            await axios.put(
                `${DOMAIN}/api/user/change-password`,
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.dismiss(toastId);
            toast.success("Đổi mật khẩu thành công!");
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        } catch (error) {
            toast.dismiss(toastId);
            const err = error as AxiosError<{ message?: string }>;
            toast.error(err.response?.data?.message || "Lỗi đổi mật khẩu");
        }
    };

    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("user");
        router.push("/login");
    };

    return (
        <div className='mt-24 px-4 sm:px-6 mb-14 w-full'>

            <ToastContainer />
            <div className='w-full flex justify-center'>
                <h1 className='text-[24px] text-black justify-center mb-7 font-bold text-shadow-lg'>Quản lý tài khoản</h1>
            </div>

            <div className='flex justify-center'>
                <div className='bg-gradient-to-r from-cyan-200 to-indigo-300 inset-shadow-sm p-5 rounded-t-[4vw] flex flex-col sm:flex-row items-center'>
                    <div className='w-45 h-44 bg-black/10 flex justify-center items-center rounded-full sm:mr-15 sm:ml-5'>
                        <Image src={user?.photoUrl || image_user} className='w-40 h-40 relative' alt='user' />
                    </div>
                    <div
                        className='mt-4 sm:mt-0 sm:ml-5 flex flex-col justify-center'
                        data-aos="fade-right"
                        data-aos-duration="1000"
                        data-aos-easing="ease-in-out">
                        <h1 className='text-[24px] justify-center mb-3 font-bold'>Xin chào {user?.username || "Người dùng"}!</h1>
                        <h3 className='text-[18px] justify-start mb-3 font-bold flex '>Email: {user?.email || "email@example.com"}</h3>
                        <p className='mb-1 text-[12px] font-bold'>Thao tác</p>
                        <div className='border border-white flex flex-col sm:flex-row justify-center items-center rounded-[1vw] p-3 space-y-2 sm:space-y-0 sm:space-x-2'>
                            <button className="p-3 yellow text-black cursor-pointer transition-color duration-300 w-30 rounded-lg"
                                onClick={() => setShowPasswordForm(!showPasswordForm)}>
                                <h3 className="font-bold text-[10px]">Đổi mật khẩu</h3>
                            </button>
                            <button className="px-3 py-1 blue text-black cursor-pointer transition-color duration-300 w-30 rounded-lg"
                                onClick={() => setShowUpdateForm(true)}>
                                <h3 className="font-bold text-[10px]">Chỉnh sửa thông tin</h3>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="p-3 red cursor-pointer transition-color duration-300 w-30 rounded-lg">
                                <h3 className="font-bold text-[10px]">Đăng xuất</h3>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex justify-center w-full'>
                <div
                    data-aos="fade-up"
                    data-aos-duration="600"
                    data-aos-easing="ease-in-out"
                    className='border border-gray-300 bg-gray-100 rounded-[1vw] p-5 w-full max-w-4xl'>
                    <div className='flex items-center mb-3'>
                        <Image src={ic_saved} className='w-8 h-8' alt='saved' />
                        <span
                            className={`cursor-pointer ${!isWatching && "bg-gray-200 rounded-lg p-2"} ml-4 text-[14px] justify-center font-bold text-black`}
                            onClick={() => { setIsWatching(false) }}
                        >
                            Sản phẩm yêu thích
                        </span>
                        {/* <span className='text-black ml-2'>|</span> */}
                        <span
                            className={`cursor-pointer ${isWatching && "bg-gray-200 rounded-lg p-2"} text-[14px] ml-4 font-bold text-black`}
                            onClick={() => setIsWatching(true)}
                        >
                            Blog yêu thích
                        </span>
                    </div>
                    {isWatching ? (
                        favoritesPost.length === 0 ? (
                            <div className="text-center text-gray-500">
                                <span>Không có blog nào trong danh sách yêu thích.</span>
                            </div>
                        ) : (
                            favoritesPost.map((post, index) => {
                                return (
                                    <div key={index} className="bg-white w-full rounded-lg mt-4 flex flex-col sm:flex-row justify-between items-center p-3 space-y-2 sm:space-y-0">
                                        <h3 className="text-[18px] font-bold text-black">{post.title}</h3>
                                        <div className='flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3'>
                                            <h3 className='text-[14px] justify-center font-bold text-black underline cursor-pointer'
                                                onClick={() => (window.location.href = `/blogDetail/${encodeURIComponent(post.slug)}`)}
                                            >Xem chi tiết</h3>
                                            <button className="px-2 py-1 red cursor-pointer transition-color duration-300 rounded-lg"
                                                onClick={() => handleRemoveFromFavoritePost(post._id)}>
                                                <h3 className="font-bold text-[14px]">Xóa</h3>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )
                    ) : (
                        favoritesProduct.length === 0 ? (
                            <div className="text-center text-gray-500">
                                <span>Không có sản phẩm nào trong danh sách yêu thích.</span>
                            </div>
                        ) : (
                            favoritesProduct.map((product, index) => (
                                <div key={index} className="bg-white w-full rounded-lg mt-4 flex flex-col sm:flex-row justify-between items-center p-3">
                                    <h3 className="text-[18px] font-bold text-black">{product.title}</h3>
                                    <div className='flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3'>
                                        <h3 className='text-[14px] justify-center font-bold text-black underline cursor-pointer'
                                            onClick={() => window.open(product.URL || "_blank")}>Xem chi tiết</h3>
                                        <button className="px-2 py-1 red cursor-pointer transition-color duration-300 rounded-lg"
                                            onClick={() => handleRemoveFromFavoriteProduct(product._id)}>
                                            <h3 className="font-bold text-[14px]">Xóa</h3>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    )}
                </div>
            </div>
            {
                showPasswordForm && (
                    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                        <div ref={passwordFormRef} className='mt-4 w-full pt-4 text-black absolute z-9999 top-35 bg-white rounded-lg p-3 max-w-3xl mx-auto'>
                            <button onClick={() => setShowPasswordForm(false)} className='flex w-full justify-end'><IoCloseCircleOutline className='w-7 h-7 cursor-pointer hover:text-red-700' /></button>
                            <div className='mb-2'>
                                <label className='block text-sm font-semibold mb-1'>Mật khẩu cũ</label>
                                <div className='relative'>
                                    <input
                                        className='w-full border border-gray-300 focus-within:outline-2 focus-within:outline-solid outline-none bg-white text-black font-bold placeholder-gray-400 text-[12px] p-2 mt-2 mb-4 pr-10'
                                        type={showPassword ? 'text' : 'password'}
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Nhập mật khẩu cũ"
                                    />
                                    <span
                                        className='absolute right-3 top-[18px] cursor-pointer'
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <Eye className='text-black' size={18} /> : <EyeOff className='text-black' size={18} />}
                                    </span>
                                </div>
                            </div>
                            <div className='mb-2'>
                                <label className='block text-sm font-semibold mb-1'>Mật khẩu mới</label>
                                <div className='relative'>
                                    <input
                                        className='w-full border border-gray-300 focus-within:outline-2 focus-within:outline-solid outline-none bg-white text-black font-bold placeholder-gray-400 text-[12px] p-2 mt-2 mb-4 pr-10'
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        type={showPassword2 ? 'text' : 'password'}
                                        placeholder="fwe@#%..."
                                    />
                                    <span
                                        className='absolute right-3 top-[18px] cursor-pointer'
                                        onClick={() => setShowPassword2(!showPassword2)}
                                    >
                                        {showPassword2 ? <Eye className='text-black' size={18} /> : <EyeOff className='text-black' size={18} />}
                                    </span>
                                </div>

                            </div>
                            <h3 className='text-[14px] font-bold'>Nhập lại mật khẩu mới</h3>
                            <div className='relative'>
                                <input
                                    name="confirmPassword"
                                    value={confirmNewPassword}
                                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    placeholder="fwe@#%..."
                                    className='w-full border border-gray-300 focus-within:outline-2 focus-within:outline-solid outline-none bg-white text-black font-bold placeholder-gray-400 text-[12px] p-2 mt-2 mb-4 pr-10'
                                />
                                <span
                                    className='absolute right-3 top-[18px] cursor-pointer'
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <Eye className='text-black' size={18} /> : <EyeOff className='text-black' size={18} />}
                                </span>
                            </div>
                            <div className='flex justify-end'>
                                <button
                                    onClick={handleChangePassword}
                                    className='mt-2 bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-bold'
                                >
                                    Xác nhận đổi mật khẩu
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Form update user information */}
            {
                showUpdateForm && (
                    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                        <div
                            ref={updateFormRef}
                            className='mt-4 w-full pt-4 text-black absolute z-9999 top-35 bg-white rounded-lg p-3 max-w-3xl mx-auto'
                        >
                            <button
                                onClick={() => setShowUpdateForm(false)}
                                className='flex w-full justify-end'
                            >
                                <IoCloseCircleOutline className='w-7 h-7 cursor-pointer hover:text-red-700' />
                            </button>

                            <h2 className='text-lg font-bold mb-4'>Cập nhật thông tin</h2>

                            <div className='mb-2'>
                                <label className='block text-sm font-semibold mb-1'>Email</label>
                                <input
                                    type="email"
                                    className='w-full border border-gray-300 outline-none bg-white text-black font-bold placeholder-gray-400 text-[12px] p-2 mt-2 mb-4'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email"
                                />
                            </div>

                            <div className='mb-2'>
                                <label className='block text-sm font-semibold mb-1'>Tên người dùng</label>
                                <input
                                    type="text"
                                    className='w-full border border-gray-300 outline-none bg-white text-black font-bold placeholder-gray-400 text-[12px] p-2 mt-2 mb-4'
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Tên người dùng"
                                />
                            </div>

                            <div className='flex justify-end'>
                                <button
                                    onClick={handleUpdateUser}
                                    className='mt-2 bg-blue-500 hover:bg-blue-600 cursor-pointer text-white px-4 py-2 rounded-lg text-sm font-bold'
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
