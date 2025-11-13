'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import image_user from '../../../public/assets/img/image_user.png';
import ic_saved from '../../../public/assets/img/ic_saved.png';
import { useRouter } from 'next/navigation';
import axios, { AxiosError } from 'axios';
import { toast } from 'react-toastify';
import { IoCloseCircleOutline } from "react-icons/io5";
import { Eye, EyeOff, Package, ShoppingBag } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import Cookies from 'js-cookie';

interface User {
    id?: string;
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
    slug: string;
}

interface Post {
    _id: string;
    title: string;
    slug: string;
}

interface OrderItem {
    id: number;
    product: {
        id: number;
        title: string;
        image_url: string;
        price: number;
    };
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    fullName: string;
    email: string;
    phone: string;
    shippingAddress: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    orderItems: OrderItem[];
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
    const [activeTab, setActiveTab] = useState<'products' | 'posts' | 'orders'>('products');

    // Order states
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderDetail, setShowOrderDetail] = useState(false);

    useEffect(() => {
        const rawUser = Cookies.get('user');
        const userId = Cookies.get('userId');

        try {
            const parsedUser = rawUser ? JSON.parse(rawUser) : null;
            if (parsedUser && userId) {
                parsedUser.id = userId;
            }
            setUser(parsedUser);
        } catch (err) {
            console.error("Error parsing user:", err);
        }

        const storedToken = Cookies.get('token');

        if (!storedToken || isTokenExpired(storedToken)) {
            Cookies.remove('token');
            Cookies.remove('user');
            Cookies.remove('userId');
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
            router.push('/login');
            return;
        }

        setToken(storedToken ?? null);
    }, [router]);

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

    // Fetch orders
    useEffect(() => {
        if (!user?.id || activeTab !== 'orders') return;

        const fetchOrders = async () => {
            setLoadingOrders(true);
            try {
                const response = await axios.get(`${DOMAIN}/api/orders/user/${user.id}`);
                setOrders(response.data);
            } catch (error) {
                console.error("Error loading orders:", error);
                toast.error("Không thể tải lịch sử đơn hàng");
            } finally {
                setLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [user, activeTab]);

    console.log("User favorites:", user?.favoritesProduct, user?.favoritesPost);

    useEffect(() => {
        if (!user?.favoritesProduct?.length) return;

        axios
            .get(`${DOMAIN}/api/products/by-ids`, {
                params: { ids: user.favoritesProduct.join(',') },
            })
            .then((res) => setFavoritesProduct(res.data))
            .catch((err) => console.error("Error loading favorite products:", err));
    }, [user]);

    console.log('favoritesPost:', favoritesPost);
    console.log('favoritesProduct:', favoritesProduct);

    useEffect(() => {
        if (!user?.favoritesPost?.length) return;

        axios
            .get(`${DOMAIN}/api/posts/by-ids`, {
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
            Cookies.set('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setFavoritesPost((prev) => prev.filter((p) => p._id !== postId));
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
            Cookies.set('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setFavoritesProduct((prev) => prev.filter((p) => p._id !== productId));
        } catch (err) {
            console.error("Error removing product from wishlist:", err);
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;

        try {
            await axios.delete(`${DOMAIN}/api/orders/${orderId}`);
            toast.success('Đã hủy đơn hàng');
            setOrders(orders.filter(order => order.id !== orderId));
        } catch (error) {
            const err = error as AxiosError<{ message?: string }>;
            toast.error(err.response?.data?.message || 'Không thể hủy đơn hàng');
        }
    };

    const getStatusColor = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'PROCESSING': 'bg-blue-100 text-blue-800',
            'SHIPPED': 'bg-purple-100 text-purple-800',
            'DELIVERED': 'bg-green-100 text-green-800',
            'CANCELLED': 'bg-red-100 text-red-800'
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'Chờ xử lý',
            'PROCESSING': 'Đang xử lý',
            'SHIPPED': 'Đang giao',
            'DELIVERED': 'Đã giao',
            'CANCELLED': 'Đã hủy'
        };
        return statusMap[status] || status;
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

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (showUpdateForm && updateFormRef.current && !updateFormRef.current.contains(event.target as Node)) {
                setShowUpdateForm(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showUpdateForm]);

    const handleUpdateUser = async () => {
        if (!token || !user) return;

        try {
            const res = await axios.put(
                `${DOMAIN}/api/user/update`,
                { email, username, role: user.role },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedUser = res.data.user;
            Cookies.set("user", JSON.stringify(updatedUser));
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
        Cookies.remove("userId");
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
                        <Image src={user?.photoUrl || image_user} className='w-40 h-40 relative' alt='user' width={160} height={160} />
                    </div>
                    <div className='mt-4 sm:mt-0 sm:ml-5 flex flex-col justify-center'>
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
                <div className='border border-gray-300 bg-gray-100 rounded-[1vw] p-5 w-full max-w-4xl'>
                    {/* Tab Navigation */}
                    <div className='flex items-center mb-4 border-b border-gray-300 pb-2'>
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`flex items-center gap-2 px-4 cursor-pointer py-2 font-bold text-[14px] transition-all ${activeTab === 'products'
                                ? 'bg-blue-500 text-white rounded-lg'
                                : 'text-gray-700 hover:bg-gray-200 rounded-lg'
                                }`}
                        >
                            <ShoppingBag size={18} />
                            Sản phẩm yêu thích
                        </button>

                        <button
                            onClick={() => setActiveTab('posts')}
                            className={`flex items-center gap-2 px-4 cursor-pointer py-2 ml-2 font-bold text-[14px] transition-all ${activeTab === 'posts'
                                ? 'bg-blue-500 text-white rounded-lg'
                                : 'text-gray-700 hover:bg-gray-200 rounded-lg'
                                }`}
                        >
                            <Image src={ic_saved} className='w-5 h-5' alt='saved' />
                            Blog yêu thích
                        </button>

                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex items-center gap-2 px-4 cursor-pointer py-2 ml-2 font-bold text-[14px] transition-all ${activeTab === 'orders'
                                ? 'bg-blue-500 text-white rounded-lg'
                                : 'text-gray-700 hover:bg-gray-200 rounded-lg'
                                }`}
                        >
                            <Package size={18} />
                            Đơn hàng
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'orders' ? (
                        <div>
                            {loadingOrders ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                                    <span>Bạn chưa có đơn hàng nào.</span>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="bg-white rounded-lg p-4 shadow-sm">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">
                                                        Đơn hàng #{order.id}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                                    </p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </div>

                                            <div className="border-t border-gray-200 pt-3 mb-3">
                                                <p className="text-sm text-gray-600">
                                                    Tổng tiền: <span className="font-bold text-blue-600 text-lg">
                                                        {order.totalAmount.toLocaleString('vi-VN')}đ
                                                    </span>
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    Sản phẩm: {order.orderItems?.length || 0} món
                                                </p>
                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowOrderDetail(true);
                                                    }}
                                                    className="flex-1 bg-blue-500 cursor-pointer
                                                     hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                                >
                                                    Xem chi tiết
                                                </button>
                                                {order.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order.id)}
                                                        className="bg-red-500 cursor-pointer hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                                                    >
                                                        Hủy đơn
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeTab === 'posts' ? (
                        favoritesPost.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <span>Không có blog nào trong danh sách yêu thích.</span>
                            </div>
                        ) : (
                            favoritesPost.map((post, index) => (
                                <div key={index} className="bg-white w-full rounded-lg mt-4 flex flex-col sm:flex-row justify-between items-center p-3 space-y-2 sm:space-y-0">
                                    <h3 className="text-[18px] font-bold text-black">{post.title}</h3>
                                    <div className='flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3'>
                                        <h3 className='text-[14px] justify-center font-bold text-black underline cursor-pointer'
                                            onClick={() => (window.location.href = `/blogDetail/${encodeURIComponent(post.slug)}`)}>
                                            Xem chi tiết
                                        </h3>
                                        <button className="px-2 py-1 red cursor-pointer transition-color duration-300 rounded-lg"
                                            onClick={() => handleRemoveFromFavoritePost(post._id)}>
                                            <h3 className="font-bold text-[14px]">Xóa</h3>
                                        </button>
                                    </div>
                                </div>
                            ))
                        )
                    ) : (
                        favoritesProduct.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <span>Không có sản phẩm nào trong danh sách yêu thích.</span>
                            </div>
                        ) : (
                            favoritesProduct.map((product, index) => (
                                <div key={index} className="bg-white w-full rounded-lg mt-4 flex flex-col sm:flex-row justify-between items-center p-3">
                                    <h3 className="text-[18px] font-bold text-black">{product.title}</h3>
                                    <div className='flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-3'>
                                        <h3 className='text-[14px] justify-center font-bold text-black underline cursor-pointer'
                                            onClick={() => (window.location.href = `/productDetail/${encodeURIComponent(product.slug)}`)}>
                                            Xem chi tiết
                                        </h3>
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

            {/* Order Detail Modal */}
            {showOrderDetail && selectedOrder && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto text-black'>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className='text-xl font-bold text-gray-900'>
                                Chi tiết đơn hàng #{selectedOrder.id}
                            </h2>
                            <button onClick={() => setShowOrderDetail(false)}>
                                <IoCloseCircleOutline className='w-7 h-7 cursor-pointer hover:text-red-700' />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h3 className="font-semibold mb-2">Thông tin giao hàng</h3>
                                <p className="text-sm text-gray-700">Tên: {selectedOrder.fullName}</p>
                                <p className="text-sm text-gray-700">Email: {selectedOrder.email}</p>
                                <p className="text-sm text-gray-700">SĐT: {selectedOrder.phone}</p>
                                <p className="text-sm text-gray-700">Địa chỉ: {selectedOrder.shippingAddress}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3">Sản phẩm</h3>
                                {selectedOrder.orderItems?.map((item) => (
                                    <div key={item.id} className="flex gap-4 mb-3 p-3 bg-gray-50 rounded-lg">
                                        <div className="relative w-20 h-20">
                                            <Image
                                                src={item.product.image_url || '/placeholder.png'}
                                                alt={item.product.title}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm">{item.product.title}</h4>
                                            <p className="text-sm text-gray-600">
                                                {item.price.toLocaleString('vi-VN')}đ x {item.quantity}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">
                                                {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng cộng:</span>
                                    <span className="text-blue-600">
                                        {selectedOrder.totalAmount.toLocaleString('vi-VN')}đ
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Password Form */}
            {showPasswordForm && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                    <div ref={passwordFormRef} className='mt-4 w-full pt-4 text-black bg-white rounded-lg p-6 max-w-lg mx-4'>
                        <button onClick={() => setShowPasswordForm(false)} className='flex w-full justify-end'>
                            <IoCloseCircleOutline className='w-7 h-7 cursor-pointer hover:text-red-700' />
                        </button>
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
            )}

            {/* Update Form */}
            {showUpdateForm && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                    <div ref={updateFormRef} className='mt-4 w-full pt-4 text-black bg-white rounded-lg p-6 max-w-lg mx-4'>
                        <button onClick={() => setShowUpdateForm(false)} className='flex w-full justify-end'>
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
            )}
        </div>
    );
}   