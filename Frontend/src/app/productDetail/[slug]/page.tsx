'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import axios, { AxiosError } from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Cookies from 'js-cookie';
import { Star, ShoppingCart, ArrowLeftFromLine, TrendingUp, Package, Shield, Truck } from 'lucide-react';
import ToggleFavorite from '../../../../components/toggleFavoriteProduct';
import Link from 'next/link';

interface Product {
    id: number;
    slug: string;
    title: string;
    price: number;
    description: string;
    discount: number;
    views: number;
    rating: number;
    url: string;
    category: string;
    imageUrl: string;
    createdAt: string;
}

export default function ProductDetailPage() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;
    const params = useParams();
    const router = useRouter();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [selectedSize, setSelectedSize] = useState('');
    const [addingToCart, setAddingToCart] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${DOMAIN}/api/products/detail/${params.slug}`);
                if (!response.ok) throw new Error('Product not found');
                const data = await response.json();
                setProduct(data);
            } catch (error) {
                console.error('Error fetching product:', error);
                toast.error('Không thể tải sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        if (params.slug) {
            fetchProduct();
        }
    }, [params.slug, DOMAIN]);

    const calculateDiscountedPrice = (price: number, discount: number) => {
        return price - (price * discount / 100);
    };

    const handleAddToCart = async () => {
        // Get userId from cookie
        const cookie = Cookies.get('user');

        const userId = cookie ? JSON.parse(cookie).id : null;

        if (!userId) {
            toast.error('Vui lòng đăng nhập để thêm vào giỏ hàng');
            router.push('/taikhoan');
            return;
        }

        if (!selectedSize) {
            toast.warning('Vui lòng chọn kích thước');
            return;
        }

        if (!product) return;

        try {
            setAddingToCart(true);

            await axios.post(`${DOMAIN}/api/cart/add`, {
                userId: parseInt(userId),
                productId: product.id,
                quantity: quantity
            });

            toast.success('Đã thêm vào giỏ hàng!');

            // Optional: Refresh cart count in navbar
            window.dispatchEvent(new Event('cartUpdated'));

        } catch (error: unknown) {
            console.error('Error adding to cart:', error);
            toast.error((error as AxiosError<{ error: string }>)?.response?.data?.error || 'Không thể thêm vào giỏ hàng');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h2>
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const discountedPrice = calculateDiscountedPrice(product.price, product.discount);

    return (
        <div className="min-h-screen bg-gray-50 py-8 text-black">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={3}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <nav className="mb-6 text-sm">
                    <ol className="flex items-center space-x-2">
                        <li><Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link></li>
                        <li className="text-gray-400">/</li>
                        <li><Link href="/products" className="text-gray-500 hover:text-gray-700">Products</Link></li>
                        <li className="text-gray-400">/</li>
                        <li className="text-gray-900 font-medium">{product.category}</li>
                    </ol>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-2xl shadow-sm p-8">
                    {/* Product Image Section */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                            <Image
                                src={product.imageUrl || '/placeholder.jpg'}
                                alt={product.title}
                                fill
                                className="object-cover"
                                priority
                            />
                            {product.discount > 0 && (
                                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                    -{product.discount}% OFF
                                </div>
                            )}
                            <div className="absolute top-4 right-4 bg-white px-2 rounded-full shadow-lg hover:bg-gray-50">
                                <ToggleFavorite productId={product.id.toString()} />
                            </div>
                        </div>
                    </div>

                    {/* Product Info Section */}
                    <div className="space-y-6">
                        <div>
                            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full font-semibold mb-2">
                                {product.category}
                            </span>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>

                            {/* Rating and Views */}
                            <div className="flex items-center space-x-4 mb-4">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-5 h-5 ${i < Math.floor(product.rating)
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-300'
                                                }`}
                                        />
                                    ))}
                                    <span className="ml-2 text-gray-600 font-medium">{product.rating.toFixed(1)}</span>
                                </div>
                                <div className="flex items-center text-gray-500">
                                    <TrendingUp className="w-4 h-4 mr-1" />
                                    <span className="text-sm">{product.views} views</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex items-baseline space-x-3 mb-6">
                                <span className="text-4xl font-bold text-gray-900">
                                    {discountedPrice.toLocaleString('vi-VN')}đ
                                </span>
                                {product.discount > 0 && (
                                    <span className="text-xl text-gray-500 line-through">
                                        {product.price.toLocaleString('vi-VN')}đ
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border-t border-b border-gray-200 py-4">
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Mô tả</h3>
                            <p className="text-gray-600 leading-relaxed">{product.description}</p>
                        </div>

                        {/* Size Selection */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Chọn kích thước</h3>
                            <div className="grid grid-cols-5 gap-2">
                                {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`cursor-pointer py-3 px-4 border-2 rounded-lg font-medium transition-all ${selectedSize === size
                                            ? 'border-blue-600 bg-blue-50 text-blue-600'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quantity */}
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">Số lượng</h3>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="cursor-pointer w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center font-bold text-gray-700"
                                >
                                    -
                                </button>
                                <span className="text-lg font-semibold w-12 text-center">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="cursor-pointer w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center font-bold text-gray-700"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className={`cursor-pointer w-full py-4 rounded-xl font-semibold transition-colors flex items-center justify-center space-x-2 ${addingToCart
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white`}
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>{addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}</span>
                            </button>
                            <button className="cursor-pointer w-full border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-2"
                                onClick={() => router.back()}>
                                <ArrowLeftFromLine className="w-5 h-5" />
                                <span>Xem sản phẩm khác</span>
                            </button>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                            <div className="text-center">
                                <Truck className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                <p className="text-xs font-medium text-gray-900">Miễn phí vận chuyển</p>
                                <p className="text-xs text-gray-500">Đơn trên 500k</p>
                            </div>
                            <div className="text-center">
                                <Shield className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                <p className="text-xs font-medium text-gray-900">Thanh toán an toàn</p>
                                <p className="text-xs text-gray-500">100% bảo mật</p>
                            </div>
                            <div className="text-center">
                                <Package className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                                <p className="text-xs font-medium text-gray-900">Đổi trả dễ dàng</p>
                                <p className="text-xs text-gray-500">Trong 30 ngày</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}