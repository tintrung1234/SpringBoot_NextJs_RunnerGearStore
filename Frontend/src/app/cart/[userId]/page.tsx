'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import Link from 'next/link';
import { FaTrash, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa';
import { useParams } from 'next/navigation';
import router from 'next/router';

interface CartItem {
    id: number;
    product: {
        id: number;
        title: string;
        image_url: string;
        price: number;
        slug: string;
        discount: number;
    };
    quantity: number;
}

export default function CartPage() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;
    const params = useParams();
    const userId = params.userId as string;

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        if (!DOMAIN || !userId) return;

        const fetchCart = async () => {
            try {
                const response = await axios.get(`${DOMAIN}/api/cart/${userId}`);
                setCartItems(response.data);
            } catch (error) {
                console.error('Error fetching cart:', error);
                toast.error('Không thể tải giỏ hàng');
            } finally {
                setLoading(false);
            }
        };

        fetchCart();
    }, [DOMAIN, userId]);

    const updateQuantity = async (cartItemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        try {
            await axios.put(`${DOMAIN}/api/cart/${cartItemId}/quantity`, {
                quantity: newQuantity
            });

            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === cartItemId
                        ? { ...item, quantity: newQuantity }
                        : item
                )
            );
            toast.success('Cập nhật số lượng thành công');
        } catch (error) {
            console.error('Error updating quantity:', error);
            toast.error('Không thể cập nhật số lượng');
        }
    };

    const removeItem = async (cartItemId: number) => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

        try {
            await axios.delete(`${DOMAIN}/api/cart/${cartItemId}`);
            setCartItems(prevItems => prevItems.filter(item => item.id !== cartItemId));
            toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
        } catch (error) {
            console.error('Error removing item:', error);
            toast.error('Không thể xóa sản phẩm');
        }
    };

    const calculateItemTotal = (item: CartItem) => {
        const price = item.product.price;
        const discount = item.product.discount || 0;
        const discountedPrice = price - (price * discount / 100);
        return discountedPrice * item.quantity;
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
    };

    const calculateDiscount = () => {
        return cartItems.reduce((total, item) => {
            const originalPrice = item.product.price * item.quantity;
            const discountedPrice = calculateItemTotal(item);
            return total + (originalPrice - discountedPrice);
        }, 0);
    };

    const shippingFee = cartItems.length > 0 ? 30000 : 0;
    const total = calculateSubtotal() + shippingFee;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Đang tải...</div>
            </div>
        );
    }

    if (!userId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <FaShoppingCart className="text-6xl text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Vui lòng đăng nhập</h2>
                <p className="text-gray-600 mb-4">Bạn cần đăng nhập để xem giỏ hàng</p>
                <Link href="/taikhoan" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Đăng nhập
                </Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <ToastContainer />
                <FaShoppingCart className="text-6xl text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Giỏ hàng trống</h2>
                <p className="text-gray-600 mb-4">Bạn chưa có sản phẩm nào trong giỏ hàng</p>
                <Link href="/" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Tiếp tục mua sắm
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-15 text-gray-800 text-black">
            <ToastContainer />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
                    <p className="text-gray-600 mt-2">
                        Bạn có {cartItems.length} sản phẩm trong giỏ hàng
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => {
                            const discountedPrice = item.product.price - (item.product.price * (item.product.discount || 0) / 100);

                            return (
                                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Product Image */}
                                        <Link href={`/productDetail/${item.product.slug}`} className="relative w-full sm:w-32 h-32 flex-shrink-0">
                                            <Image
                                                src={item.product.image_url || '/placeholder.png'}
                                                alt={item.product.title}
                                                fill
                                                className="object-cover rounded-lg"
                                            />
                                            {item.product.discount > 0 && (
                                                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                                                    -{item.product.discount}%
                                                </div>
                                            )}
                                        </Link>

                                        {/* Product Info */}
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <Link href={`/productDetail/${item.product.slug}`}>
                                                    <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 line-clamp-2">
                                                        {item.product.title}
                                                    </h3>
                                                </Link>

                                                <div className="mt-2">
                                                    {item.product.discount > 0 ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xl font-bold text-red-600">
                                                                {discountedPrice.toLocaleString('vi-VN')}đ
                                                            </span>
                                                            <span className="text-sm text-gray-500 line-through">
                                                                {item.product.price.toLocaleString('vi-VN')}đ
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-xl font-bold text-gray-900">
                                                            {item.product.price.toLocaleString('vi-VN')}đ
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between mt-4">
                                                <div className="flex items-center border border-gray-300 rounded-lg">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                        className="cursor-pointer px-3 py-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaMinus className="text-sm" />
                                                    </button>
                                                    <span className="px-4 py-2 font-semibold">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                        className="cursor-pointer px-3 py-2 hover:bg-gray-100"
                                                    >
                                                        <FaPlus className="text-sm" />
                                                    </button>
                                                </div>

                                                <button
                                                    onClick={() => removeItem(item.id)}
                                                    className="cursor-pointer text-red-600 hover:text-red-800 flex items-center gap-2"
                                                >
                                                    <FaTrash />
                                                    <span className="hidden sm:inline">Xóa</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Item Total (Desktop) */}
                                        <div className="hidden sm:flex flex-col items-end justify-between">
                                            <div className="text-xl font-bold text-gray-900">
                                                {calculateItemTotal(item).toLocaleString('vi-VN')}đ
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm tắt đơn hàng</h2>

                            <div className="space-y-3 mb-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính:</span>
                                    <span>{calculateSubtotal().toLocaleString('vi-VN')}đ</span>
                                </div>

                                {calculateDiscount() > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Giảm giá:</span>
                                        <span>-{calculateDiscount().toLocaleString('vi-VN')}đ</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển:</span>
                                    <span>{shippingFee.toLocaleString('vi-VN')}đ</span>
                                </div>

                                <div className="border-t pt-3 mt-3">
                                    <div className="flex justify-between text-xl font-bold text-gray-900">
                                        <span>Tổng cộng:</span>
                                        <span className="text-blue-600">{total.toLocaleString('vi-VN')}đ</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    href={`/checkout/${userId}`}
                                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Thanh toán
                                </Link>

                                <Link
                                    href="/"
                                    className="block w-full text-center bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Tiếp tục mua sắm
                                </Link>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <div className="flex items-start gap-2 text-sm text-gray-600">
                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Miễn phí đổi trả trong 30 ngày</span>
                                </div>
                                <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                                    <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span>Giao hàng nhanh 2-3 ngày</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}