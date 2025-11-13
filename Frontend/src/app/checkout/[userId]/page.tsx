'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

interface CartItem {
    id: number;
    product: {
        id: number;
        name: string;
        price: number;
        imageUrl: string;
    };
    quantity: number;
}

interface CheckoutData {
    fullName: string;
    email: string;
    phone: string;
    shippingAddress: string;
    items: Array<{
        productId: number;
        quantity: number;
        price: number;
    }>;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { userId } = useParams();
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        shippingAddress: '',
    });
    const [errors, setErrors] = useState<Partial<typeof formData>>({});

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    useEffect(() => {
        fetchCartItems();
    }, []);

    const fetchCartItems = async () => {
        try {
            console.log('Fetching cart for user:', userId);
            const response = await fetch(`${API_URL}/api/cart/${userId}`);
            if (response.ok) {
                const data = await response.json();
                console.log('Cart items loaded:', data);
                setCartItems(data);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    };

    const calculateShipping = () => {
        const subtotal = calculateSubtotal();
        if (subtotal === 0) return 0;
        if (subtotal > 100) return 0;
        return 9.99;
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateShipping();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name as keyof typeof formData]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined,
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<typeof formData> = {};

        if (!formData.fullName.trim()) {
            newErrors.fullName = 'Full name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10,15}$/.test(formData.phone.replace(/\D/g, ''))) {
            newErrors.phone = 'Phone number is invalid';
        }

        if (!formData.shippingAddress.trim()) {
            newErrors.shippingAddress = 'Shipping address is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCheckout = async () => {
        console.log('=== Starting Checkout ===');

        // Validate form first
        if (!validateForm()) {
            const firstError = Object.keys(errors)[0];
            if (firstError) {
                const element = document.querySelector(`[name="${firstError}"]`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Check if cart is empty
        if (cartItems.length === 0) {
            toast.error('Your cart is empty. Please add items before checking out.');
            return;
        }

        setLoading(true);

        try {
            // Prepare checkout data with cart items
            const checkoutData: CheckoutData = {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                shippingAddress: formData.shippingAddress,
                items: cartItems.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    price: item.product.price
                }))
            };

            console.log('Sending checkout request:', checkoutData);

            const response = await fetch(`${API_URL}/api/orders/checkout/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(checkoutData),
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Checkout failed. Please try again.';
                try {
                    const errorData = await response.text();
                    console.error('Error response:', errorData);
                    if (errorData) {
                        errorMessage = errorData;
                    }
                } catch (e) {
                    console.error('Could not parse error response');
                }
                throw new Error(errorMessage);
            }

            const order = await response.json();
            console.log('Order created successfully:', order);

            // Show success message
            toast.success(`Đặt hàng thành công!`);
        } catch (error) {
            console.error('Lỗi thanh toán:', error);

            if (error instanceof Error) {
                toast.error(`Thanh toán thất bại`);
            } else {
                toast.error('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0 && !loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center mt-15">
                <div className="max-w-md mx-auto">
                    <svg className="w-24 h-24 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Giỏ hàng của bạn trống</h2>
                    <p className="text-gray-600 mb-6">Vui lòng thêm sản phẩm vào giỏ hàng trước khi thanh toán.</p>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 text-white px-8 py-3 cursor-pointer rounded-lg hover:bg-blue-700 transition font-semibold"
                    >
                        Tiếp tục mua sắm
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 mt-15 text-gray-900">
            <ToastContainer />
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Thanh toán</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Shipping Information */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-xl font-semibold mb-6 flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Thông tin giao hàng
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Họ và tên <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.fullName ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="Nguyễn Văn A"
                                    />
                                    {errors.fullName && (
                                        <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="nguyenvana@gmail.com"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Số điện thoại <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="+84 912 345 678"
                                    />
                                    {errors.phone && (
                                        <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Địa chỉ giao hàng <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="shippingAddress"
                                        value={formData.shippingAddress}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none ${errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        placeholder="123 Đường Chính, Hà Nội, Việt Nam"
                                    />
                                    {errors.shippingAddress && (
                                        <p className="text-red-500 text-sm mt-1">{errors.shippingAddress}</p>
                                    )}
                                </div>
                            </div>

                            {/* Payment Method Info */}
                            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>
                                        <h3 className="font-semibold text-blue-900 mb-1">Thanh toán khi nhận hàng (COD)</h3>
                                        <p className="text-sm text-blue-800">
                                            Thanh toán bằng tiền mặt khi đơn hàng được giao đến tận cửa nhà bạn.
                                            Vui lòng chuẩn bị đúng số tiền cho nhân viên giao hàng.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
                            <h2 className="text-xl font-semibold mb-4 flex items-center">
                                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Tóm tắt đơn hàng ({cartItems.length} sản phẩm)
                            </h2>

                            {/* Cart Items */}
                            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-2">
                                {cartItems.map((item) => (
                                    <div key={item.id} className="flex gap-3 pb-3 border-b">
                                        <div className="relative w-16 h-16 flex-shrink-0 bg-gray-100 rounded">
                                            <Image
                                                src={item.product.imageUrl || '/placeholder.png'}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{item.product.name}</p>
                                            <p className="text-gray-600 text-sm">Số lượng: {item.quantity}</p>
                                            <p className="text-gray-500 text-xs">${item.product.price.toFixed(2)} each</p>
                                        </div>
                                        <p className="font-semibold text-sm whitespace-nowrap">
                                            ${(item.product.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Price Breakdown */}
                            <div className="space-y-2 border-t pt-4">
                                <div className="flex justify-between text-gray-600">
                                    <span>Tạm tính</span>
                                    <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Phí vận chuyển</span>
                                    <span className="font-medium">
                                        {calculateShipping() === 0 ? 'MIỄN PHÍ' : `$${calculateShipping().toFixed(2)}`}
                                    </span>
                                </div>
                                {calculateSubtotal() < 100 && calculateSubtotal() > 0 && (
                                    <p className="text-xs text-green-600">
                                        💡 Thêm ${(100 - calculateSubtotal()).toFixed(2)} nữa để được miễn phí vận chuyển!
                                    </p>
                                )}
                                <hr className="my-2" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Tổng cộng</span>
                                    <span className="text-blue-600">${calculateTotal().toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <button
                                onClick={handleCheckout}
                                disabled={loading || cartItems.length === 0}
                                className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Đặt hàng - COD
                                    </>
                                )}
                            </button>

                            <button
                                onClick={() => router.push(`/cart/${userId}`)}
                                className="w-full mt-3 cursor-pointer bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200"
                            >
                                Quay lại giỏ hàng
                            </button>

                            {/* Security Badge */}
                            <div className="mt-6 text-center">
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-2">
                                    <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 1l6 3v5c0 4.5-3 8-6 10-3-2-6-5.5-6-10V4l6-3z" clipRule="evenodd" />
                                    </svg>
                                    Thanh toán an toàn
                                </div>
                                <p className="text-xs text-gray-500">
                                    Thông tin của bạn được mã hóa và bảo mật
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}