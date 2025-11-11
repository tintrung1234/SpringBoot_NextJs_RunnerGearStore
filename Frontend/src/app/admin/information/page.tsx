'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

interface InfoType {
    id: string;
    email: string;
    phoneNumber: number;
}

export default function Admin_EditInformation() {
    const [info, setInfo] = useState<InfoType | null>(null);
    const [formData, setFormData] = useState({
        email: "",
        phoneNumber: "",
    });

    // Fetch info nếu có
    const fetchInformation = async () => {
        try {
            const res = await axios.get(`${DOMAIN}/api/information`);
            if (res.data && res.data.length > 0) {
                const first = res.data[0];
                setInfo(first);
                setFormData({
                    email: first.email || "",
                    phoneNumber: first.phoneNumber?.toString() || "",
                });
            }
        } catch (err) {
            console.error(err);
            toast.error("Không thể lấy dữ liệu.");
        }
    };

    useEffect(() => {
        fetchInformation();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleCreate = async () => {
        try {
            const token = Cookies.get("token");
            await axios.post(`${DOMAIN}/api/information`, {
                ...formData,
                phoneNumber: Number(formData.phoneNumber),
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Tạo thông tin thành công!");
            fetchInformation();
        } catch (err) {
            toast.error("Tạo thông tin thất bại.");
        }
    };

    const handleUpdate = async () => {
        try {
            const token = Cookies.get("token");
            await axios.put(`${DOMAIN}/api/information/${info?.id}`, {
                ...formData,
                phoneNumber: Number(formData.phoneNumber),
            }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Cập nhật thông tin thành công.");
            fetchInformation();
        } catch (err) {
            toast.error("Cập nhật thất bại.");
        }
    };

    const handleDelete = async () => {
        if (!confirm("Bạn có chắc muốn xóa không?")) return;
        try {
            const token = Cookies.get("token");
            await axios.delete(`${DOMAIN}/api/information/${info?.id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Xóa thông tin thành công.");
            setInfo(null);
            setFormData({ email: "", phoneNumber: "" });
        } catch (err) {
            toast.error("Xóa thông tin thất bại.");
        }
    };

    return (
        <div className="p-6 max-w-xl mx-auto border rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Information</h2>

            <label className="block font-semibold mt-4">Email</label>
            <input
                type="email"
                name="email"
                className="w-full border rounded px-3 py-2 mt-1"
                value={formData.email}
                onChange={handleChange}
            />

            <label className="block font-semibold mt-4">Phone Number</label>
            <input
                type="text"
                name="phoneNumber"
                className="w-full border rounded px-3 py-2 mt-1"
                value={formData.phoneNumber}
                onChange={handleChange}
            />

            <div className="flex gap-4 mt-6">
                {!info ? (
                    <button
                        onClick={handleCreate}
                        className="bg-green-600 text-white px-4 py-2 rounded cursor-pointer"
                    >
                        Create
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handleUpdate}
                            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            Update
                        </button>
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 text-white px-4 py-2 rounded cursor-pointer"
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>

            <ToastContainer />
        </div>
    );
}
