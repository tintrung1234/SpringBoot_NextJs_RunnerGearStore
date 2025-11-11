'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import ImagePostDropzone from '../../../../components/ImagePostDropzone';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import Cookies from 'js-cookie';

interface Asset {
    id: string;
    image_url: string;
}

export default function Admin_EditAssets() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;
    const token = Cookies.get('token');

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string>('');
    const [preview, setPreview] = useState<string>('');
    const [uploading, setUploading] = useState<boolean>(false);
    const [assets, setAssets] = useState<Asset[]>([]);

    useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(imageFile);
        } else {
            setPreview(
                'https://res.cloudinary.com/daeorkmlh/image/upload/v1750835215/No-Image-Placeholder.svg_v0th8g.png'
            );
        }
    }, [imageFile]);

    const fetchAssets = async () => {
        try {
            const res = await axios.get<Asset[]>(`${DOMAIN}/api/assets`);
            setAssets(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error('Fetch Assets failed', err);
            toast.error('Không thể tải danh sách tài sản');
        }
    };

    useEffect(() => {
        if (DOMAIN) {
            fetchAssets();
        }
    }, [DOMAIN]);

    const handleSubmit = async () => {
        if (!imageFile) {
            setImageError('Hãy chọn ảnh trước khi tải lên.');
            toast.error('Hãy chọn ảnh trước khi tải lên.');
            return;
        }

        if (!token) {
            toast.error('Không tìm thấy token!');
            return;
        }

        const data = new FormData();
        data.append('file', imageFile); // Changed from 'image' to 'file'

        try {
            setUploading(true);
            const toastId = toast.loading('Đang tải lên...');

            await axios.post(`${DOMAIN}/api/assets`, data, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    // Don't set Content-Type - let axios handle it
                },
            });

            toast.dismiss(toastId);
            toast.success('Cập nhật tài sản thành công!');

            setImageFile(null);
            setImageError('');
            setPreview(
                'https://res.cloudinary.com/daeorkmlh/image/upload/v1750835215/No-Image-Placeholder.svg_v0th8g.png'
            );
            fetchAssets();
        } catch (err: unknown) {
            console.error('Upload failed:', err);
            toast.error(axios.isAxiosError(err) ? err?.response?.data?.message || 'Cập nhật tài sản thất bại.' : 'Cập nhật tài sản thất bại.');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa không?')) return;

        try {
            const toastId = toast.loading('Đang xóa...');

            await axios.delete(`${DOMAIN}/api/assets/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            toast.dismiss(toastId);
            toast.success('Xóa hình ảnh thành công!');
            fetchAssets();
        } catch (err: unknown) {
            console.error('Delete failed:', err);
            toast.error(axios.isAxiosError(err) ? err?.response?.data?.message || 'Xóa hình ảnh thất bại.' : 'Xóa hình ảnh thất bại.');
        }
    };

    return (
        <div className="p-6 mx-auto">
            <ToastContainer />
            <h2 className="text-2xl font-bold mb-4">Thêm tài sản mới</h2>

            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {assets.map((asset) => (
                    <div
                        key={asset.id}
                        className="border rounded p-2 relative shadow-md"
                    >
                        <div className='w-full h-40 relative'>
                            <Image
                                fill
                                src={asset.image_url}
                                alt="Assets Image"
                                className="object-cover rounded"
                            />
                        </div>
                        <div className="mt-2 flex gap-2">
                            <button
                                onClick={() => handleDelete(asset.id)}
                                className="bg-red-500 hover:bg-red-600 px-3 cursor-pointer py-1 rounded text-sm text-white"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-3">
                <label className="block font-semibold text-[24px]">Hình ảnh</label>
                <ImagePostDropzone
                    setAvatarFile={setImageFile}
                    setPreview={(url: string | ArrayBuffer | null) => setPreview(url ? String(url) : "")}
                    setAvatarError={setImageError}
                />

                {preview && (
                    <div className="mt-4 flex items-center w-60 h-60">
                        <div className='w-full h-full relative'>
                            <Image
                                fill
                                src={preview}
                                alt="Preview"
                                className="object-cover rounded w-full h-full"
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
                disabled={uploading}
                className={`mt-4 px-6 py-2 cursor-pointer flex mx-auto rounded text-white bg-blue-600 hover:bg-blue-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
            >
                {uploading ? 'Đang tải lên...' : 'Tải lên'}
            </button>
        </div>
    );
}