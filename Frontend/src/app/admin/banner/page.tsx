'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import ImagePostDropzone from "../../../../components/ImagePostDropzone";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import Cookies from "js-cookie";

interface bannerType {
    _id: string;
    imageUrl: string;
}
export default function Admin_EditBanner() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const [token, setToken] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState("");
    const [preview, setPreview] = useState("");
    const [uploading, setUploading] = useState(false);
    const [banners, setBanners] = useState<bannerType[]>([]);

    useEffect(() => {
        // Ensure token is read from client only
        const t = Cookies.get("token");
        setToken(t ??null);
    }, []);

    useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(imageFile);
        } else {
            setPreview(
                "https://res.cloudinary.com/daeorkmlh/image/upload/v1750835215/No-Image-Placeholder.svg_v0th8g.png"
            );
        }
    }, [imageFile]);

    const fetchBanners = async () => {
        try {
            const res = await axios.get(`${DOMAIN}/api/banner`);
            setBanners(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error("Fetch banners failed", err);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleSubmit = async () => {
        if (!imageFile) {
            setImageError("Hãy chọn ảnh trước khi tải lên.");
            toast.error("Hãy chọn ảnh trước khi tải lên.");
            return;
        }

        if (banners.length >= 3) {
            toast.warning("You can only have 3 banners.");
            return;
        }

        if (!token) {
            toast.error("No token found!");
            return;
        }

        const data = new FormData();
        data.append("image", imageFile);

        try {
            setUploading(true);
            await axios.post(`${DOMAIN}/api/banner/create`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setImageFile(null);
            setImageError("");
            fetchBanners(); // refresh list
            toast.success("Cập nhật banner thành công!");
        } catch (err) {
            console.error("Upload failed:", err);
            toast.error("Cập nhật banner thất bại.");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc muốn xóa không?")) return;
        try {
            await axios.delete(`${DOMAIN}/api/banner/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchBanners();
            toast.success("Xóa banner thành công!");
        } catch (err) {
            toast.error("Xóa banner thất bại!");
        }
    };

    return (
        <div className="p-6 mx-auto">
            <ToastContainer />
            <h2 className="text-2xl font-bold mb-4">Add New Banner</h2>

            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {banners.map((banner) => (
                    <div
                        key={banner._id}
                        className="border rounded p-2 relative shadow-md"
                    >
                        <div className="relative w-full h-40">
                            <Image
                                fill
                                src={banner.imageUrl}
                                alt="Banner"
                                className="object-cover rounded"
                            />
                        </div>
                        <div className="mt-2 flex gap-2">
                            <button
                                onClick={() => handleDelete(banner._id)}
                                className="bg-red-500 hover:bg-red-600 px-3 cursor-pointer py-1 rounded text-sm text-white"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Image Upload */}
            <div className="p-3">
                <label className="block font-semibold text-[24px]">Image</label>
                <ImagePostDropzone
                    setAvatarFile={setImageFile}
                    setPreview={(url: string | ArrayBuffer | null) => setPreview(url ? String(url) : "")}
                    setAvatarError={setImageError}
                />

                {preview && (
                    <div className="mt-4 flex items-center w-60 h-60">
                        <div className="relative w-full h-full">
                            <Image
                                fill
                                src={preview}
                                alt="Preview"
                                className="object-cover rounded"
                            />
                        </div>
                    </div>
                )}

                {imageError && (
                    <p className="text-red-500 text-sm mt-2">{imageError}</p>
                )}
            </div>

            <button
                onClick={handleSubmit}
                disabled={uploading || banners.length >= 3}
                className={`mt-4 px-6 py-2 flex mx-auto rounded text-white cursor-pointer ${banners.length >= 3
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                    }`}
            >
                {uploading ? "Uploading..." : "Upload Banner"}
            </button>

            {banners.length >= 3 && (
                <p className="text-red-600 mt-2 text-center">⚠️ Only 3 banners allowed.</p>
            )}
        </div>
    );
}
