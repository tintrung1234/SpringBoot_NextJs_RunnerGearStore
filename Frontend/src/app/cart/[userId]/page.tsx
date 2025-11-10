'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

interface Product {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
    description: string;
}

interface CartItem {
    id: number;
    product: Product;
    quantity: number;
}

export default function CartPage() {
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;

    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCartItems();
    }, [userId]);

    const fetchCartItems = async () => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:8080/api/cart/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch cart items');
            const data = await response.json();
            setCartItems(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (cartItemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;

        // Optimistic update
        setCartItems(prev =>
            prev.map(item =>
                item.id === cartItemId ? { ...item, quantity: newQuantity } : item
            )
        );

        try {
            const response = await fetch(`http://localhost:8080/api/cart/${cartItemId}/quantity`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ quantity: newQuantity }),
            });

            if (!response.ok) {
                throw new Error('Failed to update quantity');
            }
        } catch (err) {
            // Revert on error
            fetchCartItems();
            console.error('Error updating quantity:', err);
        }
    };

    const removeItem = async (cartItemId: number) => {
        // Optimistic update
        setCartItems(prev => prev.filter(item => item.id !== cartItemId));

        try {
            const response = await fetch(`http://localhost:8080/api/cart/${cartItemId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove item');
            }
        } catch (err) {
            // Revert on error
            fetchCartItems();
            console.error('Error removing item:', err);
        }
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    };

    const calculateTax = () => {
        return calculateSubtotal() * 0.1; // 10% tax
    };

    const calculateTotal = () => {
        return calculateSubtotal() + calculateTax();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading your cart...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-600">Error: {error}</div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-gray-600 mb-8">Add some running gear to get started!</p>
                <button
                    onClick={() => router.push('/products')}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow">
                            {cartItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 p-6 border-b last:border-b-0"
                                >
                                    {/* Product Image */}
                                    <div className="relative w-24 h-24 flex-shrink-0">
                                        <Image
                                            src={item.product.imageUrl || '/placeholder.jpg'}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover rounded"
                                        />
                                    </div>

                                    {/* Product Details */}
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-lg">{item.product.name}</h3>
                                        <p className="text-gray-600 text-sm mt-1">
                                            {item.product.description}
                                        </p>
                                        <p className="text-blue-600 font-bold mt-2">
                                            ${item.product.price.toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Quantity Controls */}
                                    <div className="flex items-center gap-2 text-black">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                                            disabled={item.quantity <= 1}
                                        >
                                            -
                                        </button>
                                        <span className="w-12 text-center font-semibold">
                                            {item.quantity}
                                        </span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="w-8 h-8 flex items-center justify-center border rounded hover:bg-gray-100"
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* Item Total */}
                                    <div className="text-right">
                                        <p className="font-bold text-lg">
                                            ${(item.product.price * item.quantity).toFixed(2)}
                                        </p>
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-red-600 hover:text-red-800 ml-4"
                                    >
                                        <svg
                                            className="w-6 h-6"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-4 text-black">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span className="font-semibold">
                                        ${calculateSubtotal().toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax (10%)</span>
                                    <span className="font-semibold">
                                        ${calculateTax().toFixed(2)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-semibold text-green-600">FREE</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between text-lg">
                                    <span className="font-bold">Total</span>
                                    <span className="font-bold text-blue-600">
                                        ${calculateTotal().toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/checkout/${userId}`)}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition mb-3"
                            >
                                Proceed to Checkout
                            </button>

                            <button
                                onClick={() => router.push('/products')}
                                className="w-full bg-gray-100 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
                            >
                                Continue Shopping
                            </button>

                            <div className="mt-6 text-sm text-gray-600">
                                <p className="flex items-center gap-2 mb-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Free shipping on orders over $50
                                </p>
                                <p className="flex items-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    30-day return policy
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}