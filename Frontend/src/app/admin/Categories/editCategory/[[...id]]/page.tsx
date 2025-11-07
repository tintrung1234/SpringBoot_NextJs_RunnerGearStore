'use client'

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import axios from "axios";
import { useParams } from "next/navigation";

interface CateType {
    _id: string;
    title: string;
}

export default function CategoryForm() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const [isEdit, setIsEdit] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [formData, setFormData] = useState({ title: "" });

    const params = useParams();
    const categoryId = params.id as string;
    const [categories, setCategories] = useState<CateType[]>([]);

     useEffect(() => {
        if (categoryId) {
            setSelectedCategoryId(categoryId);
        }
    }, [categoryId]);

    useEffect(() => {
        const id = categoryId || selectedCategoryId;
        if (id) {

            setIsEdit(true);
            axios.get(`${DOMAIN}/api/categories/detail/${id}`).then((res) => {
                const p = res.data;
                if (!p) {
                    toast.error("Không tìm thấy danh mục");
                    return;
                }

                setFormData({
                    title: p.title || "",
                });
            });
        }

    }, []);

    useEffect(() => {
        // Luôn fetch toàn bộ product khi vào trang
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${DOMAIN}/api/categories/`);
                setCategories(res.data);
            } catch (err) {
                console.error("Lỗi khi tải danh mục:", err);
            }
        };

        fetchProducts();
    }, [DOMAIN]); // Chạy 1 lần

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async () => {
        try {
            const payload = { title: formData.title };

            const toastId = toast.loading(isEdit ? "Đang cập nhật danh mục..." : "Đang đăng danh mục...");

            if (isEdit && selectedCategoryId) {
                await axios.put(`${DOMAIN}/api/categories/update/${selectedCategoryId}`, payload);
                toast.dismiss(toastId);
                toast.success("Cập nhật danh mục thành công!");
            } else {
                // ✅ CREATE new product
                await axios.post(`${DOMAIN}/api/categories/create`, payload);
                toast.dismiss(toastId);
                toast.success("Đăng bài thành công!");
            }

            // Reset state
            setFormData({
                title: "",
            });
            setSelectedCategoryId("");
            setIsEdit(false);
        } catch (err) {
            console.error(err);
            toast.error("Lỗi khi gửi dữ liệu.");
        }
    };

    const handleDelete = async () => {
        if (!selectedCategoryId) return;

        const confirmed = window.confirm("Bạn có chắc chắn muốn xoá danh mục này?");
        if (!confirmed) return;

        try {
            const toastId = toast.loading("Đang xoá danh mục...");

            await axios.delete(`${DOMAIN}/api/categories/delete/${selectedCategoryId}`);

            toast.dismiss(toastId);
            toast.success("Xoá danh mục thành công!");

            // Reset form and edit state
            setSelectedCategoryId("");
            setIsEdit(false);
            setFormData({
                title: "",
            });
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Lỗi khi xoá danh mục.");
        }
    };

    return (
        <>
            <ToastContainer />

            <div className="flex justify-center space-x-8 font-bold text-center mt-5 mb-4 text-black">
                <span
                    className={`cursor-pointer ${!isEdit && "underline"}`}
                    onClick={() => {
                        setIsEdit(false);
                        setSelectedCategoryId("");
                        setFormData({ title: "" });
                    }}
                >
                    Thêm Danh Mục
                </span>
                <span
                    className={`cursor-pointer ${isEdit && "underline"}`}
                    onClick={() => setIsEdit(true)}
                >
                    Sửa Danh Mục
                </span>
            </div>

            <div className="bg-gray-100 rounded p-6 space-y-4 max-w-6xl mx-auto text-black mb-14">
                {isEdit ? (
                    <div>
                        <label className="font-bold">Chọn danh mục</label>
                        <select
                            className="w-full p-2 mt-1 rounded bg-white"
                            value={selectedCategoryId}
                            onChange={(e) => setSelectedCategoryId(e.target.value)}
                        >
                            <option value="">-- Chọn --</option>
                            {categories.map((category) => (
                                <option key={category._id} value={category._id}>
                                    {category.title}
                                </option>
                            ))}
                        </select>

                        <div className="mt-4">
                            <label className="font-bold">Tên danh mục mới</label>
                            <input
                                className="w-full p-2 mt-1 rounded bg-white"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Tên danh mục"
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <label className="font-bold">Tên danh mục</label>
                        <input
                            className="w-full p-2 mt-1 rounded bg-white"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Tên danh mục"
                        />
                    </div>
                )}
                {/* Button group  */}
                <div className="flex justify-center w-full">
                    <div className="text-center">
                        <button onClick={handleSubmit} className="bg-yellow-400 rounded px-4 py-2 font-bold cursor-pointer hover:bg-yellow-600">Lưu</button>
                    </div>
                    {isEdit && selectedCategoryId && (
                        <div className="text-center ml-3">
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 text-white rounded px-4 py-2 font-bold hover:bg-red-700 cursor-pointer"
                            >
                                Xoá danh mục
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
