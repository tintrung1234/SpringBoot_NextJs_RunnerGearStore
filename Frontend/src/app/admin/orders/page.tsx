'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import {
    Package,
    Search,
    Filter,
    Eye,
    Trash2,
    Edit,
    Download,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

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
    orderNumber: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
    fullName: string;
    email: string;
    phone: string;
    shippingAddress: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    orderItems: OrderItem[];
}

export default function AdminOrdersPage() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;
    const router = useRouter();

    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [dateFilter, setDateFilter] = useState('ALL');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 10;

    // Edit state
    const [editStatus, setEditStatus] = useState('');

    useEffect(() => {
        // Check if user is admin
        const user = Cookies.get('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            if (parsedUser.role !== 'Admin') {
                toast.error('Bạn không có quyền truy cập trang này');
                router.push('/');
                return;
            }
        } else {
            router.push('/login');
            return;
        }

        fetchOrders();
    }, []);

    useEffect(() => {
        filterOrders();
    }, [orders, searchTerm, statusFilter, dateFilter]);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${DOMAIN}/api/orders/all`);
            setOrders(response.data);
            setFilteredOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Không thể tải danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const filterOrders = () => {
        let filtered = [...orders];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(order =>
                order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                order.phone.includes(searchTerm)
            );
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(order => order.status === statusFilter);
        }

        // Date filter
        if (dateFilter !== 'ALL') {
            const now = new Date();
            filtered = filtered.filter(order => {
                const orderDate = new Date(order.createdAt);
                const diffTime = Math.abs(now.getTime() - orderDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (dateFilter) {
                    case 'TODAY':
                        return diffDays === 0;
                    case 'WEEK':
                        return diffDays <= 7;
                    case 'MONTH':
                        return diffDays <= 30;
                    default:
                        return true;
                }
            });
        }

        setFilteredOrders(filtered);
        setCurrentPage(1);
    };

    const handleUpdateStatus = async () => {
        if (!selectedOrder) return;

        try {
            await axios.put(
                `${DOMAIN}/api/orders/${selectedOrder.id}/status?status=${editStatus}`
            );
            toast.success('Cập nhật trạng thái thành công');
            fetchOrders();
            setShowEditModal(false);
        } catch (error) {
            toast.error('Không thể cập nhật trạng thái');
        }
    };

    const handleDeleteOrder = async (orderId: number) => {
        if (!confirm('Bạn có chắc muốn xóa đơn hàng này?')) return;

        try {
            await axios.delete(`${DOMAIN}/api/orders/${orderId}`);
            toast.success('Đã xóa đơn hàng');
            fetchOrders();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                toast.error(error?.response?.data || 'Không thể xóa đơn hàng');
            } else {
                toast.error('Không thể xóa đơn hàng');
            }
        }
    };

    const exportToCSV = () => {
        const headers = ['Mã đơn', 'Khách hàng', 'Email', 'SĐT', 'Tổng tiền', 'Trạng thái', 'Ngày tạo'];
        const csvData = filteredOrders.map(order => [
            order.id,
            order.fullName,
            order.email,
            order.phone,
            order.totalAmount,
            order.status,
            new Date(order.createdAt).toLocaleDateString('vi-VN')
        ]);

        const csv = [
            headers.join(','),
            ...csvData.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orders_${new Date().toISOString()}.csv`;
        link.click();
    };

    const getStatusColor = (status: string) => {
        const statusMap: { [key: string]: string } = {
            'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-300',
            'PROCESSING': 'bg-blue-100 text-blue-800 border-blue-300',
            'SHIPPED': 'bg-purple-100 text-purple-800 border-purple-300',
            'DELIVERED': 'bg-green-100 text-green-800 border-green-300',
            'CANCELLED': 'bg-red-100 text-red-800 border-red-300'
        };
        return statusMap[status] || 'bg-gray-100 text-gray-800 border-gray-300';
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

    // Pagination
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const totalRevenue = filteredOrders.reduce((sum, order) =>
        order.status !== 'CANCELLED' ? sum + order.totalAmount : sum, 0
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 mt-3">
            <ToastContainer />

            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đơn hàng</h1>
                    <p className="text-gray-600">Tổng quan và quản lý tất cả đơn hàng</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Tổng đơn hàng</p>
                                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                            </div>
                            <Package className="w-10 h-10 text-blue-500" />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Chờ xử lý</p>
                                <p className="text-2xl font-bold text-yellow-600">
                                    {orders.filter(o => o.status === 'PENDING').length}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                                <span className="text-yellow-600 font-bold">!</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Hoàn thành</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {orders.filter(o => o.status === 'DELIVERED').length}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <span className="text-green-600 font-bold">✓</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Doanh thu</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {(totalRevenue / 1000000).toFixed(1)}M
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold">₫</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm mã đơn, tên, email, SĐT..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="cursor-pointer w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Tất cả trạng thái</option>
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="PROCESSING">Đang xử lý</option>
                                <option value="SHIPPED">Đang giao</option>
                                <option value="DELIVERED">Đã giao</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </select>
                        </div>

                        {/* Date Filter */}
                        <div>
                            <select
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="cursor-pointer w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="ALL">Tất cả thời gian</option>
                                <option value="TODAY">Hôm nay</option>
                                <option value="WEEK">7 ngày qua</option>
                                <option value="MONTH">30 ngày qua</option>
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={fetchOrders}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Làm mới
                        </button>
                        <button
                            onClick={exportToCSV}
                            className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Xuất CSV
                        </button>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Mã đơn
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Khách hàng
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Liên hệ
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tổng tiền
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ngày tạo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentOrders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                                            Không tìm thấy đơn hàng nào
                                        </td>
                                    </tr>
                                ) : (
                                    currentOrders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 text-black">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {order.id}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {order.fullName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{order.email}</div>
                                                <div className="text-sm text-gray-500">{order.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-bold text-blue-600">
                                                    {order.totalAmount.toLocaleString('vi-VN')}đ
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setShowDetailModal(true);
                                                        }}
                                                        className="cursor-pointer text-blue-600 hover:text-blue-900"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedOrder(order);
                                                            setEditStatus(order.status);
                                                            setShowEditModal(true);
                                                        }}
                                                        className="cursor-pointer text-green-600 hover:text-green-900"
                                                        title="Sửa trạng thái"
                                                    >
                                                        <Edit className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOrder(order.id)}
                                                        className="cursor-pointer text-red-600 hover:text-red-900"
                                                        title="Xóa"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="cursor-pointer relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Trước
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="cursor-pointer ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Sau
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Hiển thị <span className="font-medium">{indexOfFirstOrder + 1}</span> đến{' '}
                                        <span className="font-medium">{Math.min(indexOfLastOrder, filteredOrders.length)}</span> trong{' '}
                                        <span className="font-medium">{filteredOrders.length}</span> kết quả
                                    </p>
                                </div>
                                <div>
                                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentPage === 1}
                                            className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronLeft className="w-5 h-5" />
                                        </button>
                                        {[...Array(totalPages)].map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrentPage(idx + 1)}
                                                className={`cursor-pointer relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === idx + 1
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {idx + 1}
                                            </button>
                                        ))}
                                        <button
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                            className="cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Chi tiết đơn hàng # {selectedOrder.id}
                                </h2>
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="cursor-pointer text-gray-400 hover:text-gray-600"
                                >
                                    <span className="text-2xl">×</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3 text-gray-900">Thông tin khách hàng</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Tên:</span> {selectedOrder.fullName}</p>
                                        <p><span className="font-medium">Email:</span> {selectedOrder.email}</p>
                                        <p><span className="font-medium">SĐT:</span> {selectedOrder.phone}</p>
                                        <p><span className="font-medium">Địa chỉ:</span> {selectedOrder.shippingAddress}</p>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold mb-3 text-gray-900">Thông tin đơn hàng</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Mã đơn:</span> {selectedOrder.id}</p>
                                        <p><span className="font-medium">Ngày tạo:</span> {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}</p>
                                        <p>
                                            <span className="font-medium">Trạng thái:</span>{' '}
                                            <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedOrder.status)}`}>
                                                {getStatusText(selectedOrder.status)}
                                            </span>
                                        </p>
                                        <p><span className="font-medium">Tổng tiền:</span> <span className="text-blue-600 font-bold">{selectedOrder.totalAmount.toLocaleString('vi-VN')}đ</span></p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold mb-3 text-gray-900">Sản phẩm</h3>
                                <div className="space-y-3">
                                    {selectedOrder.orderItems?.map((item) => (
                                        <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                                            <div className="relative w-20 h-20 flex-shrink-0">
                                                <Image
                                                    src={item.product.image_url || '/placeholder.png'}
                                                    alt={item.product.title}
                                                    fill
                                                    className="object-cover rounded"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-sm text-gray-900">{item.product.title}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {item.price.toLocaleString('vi-VN')}đ x {item.quantity}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">
                                                    {(item.price * item.quantity).toLocaleString('vi-VN')}đ
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Status Modal */}
            {showEditModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            Cập nhật trạng thái đơn hàng
                        </h2>
                        <p className="text-sm text-gray-600 mb-4">
                            Đơn hàng: # {selectedOrder.id}
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trạng thái mới
                            </label>
                            <select
                                value={editStatus}
                                onChange={(e) => setEditStatus(e.target.value)}
                                className="cursor-pointer w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="PENDING">Chờ xử lý</option>
                                <option value="PROCESSING">Đang xử lý</option>
                                <option value="SHIPPED">Đang giao</option>
                                <option value="DELIVERED">Đã giao</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowEditModal(false)}
                                className="cursor-pointer flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="cursor-pointer flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Cập nhật
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}