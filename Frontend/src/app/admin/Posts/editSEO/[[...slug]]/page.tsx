'use client';

import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { useParams } from 'next/navigation';

// Define interfaces
interface PostType {
    id: string;
    title: string;
    category: string;
    views: number;
    imageUrl: string;
    content: string;
    description: string;
    createdAt: Date;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    slug: string;
}

interface FormData {
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    slug: string;
}

export default function PostForm() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;
    const params = useParams();
    const postSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug || '';

    const [formTab, setFormTab] = useState<'Create' | 'Edit' | 'SEO'>('Create');
    const [selectedPostSlug, setSelectedPostSlug] = useState<string>('');
    const [formData, setFormData] = useState<FormData>({
        metaTitle: "",
        metaDescription: "",
        metaKeywords: "",
        slug: "",
    });

    const [postsState, setPostsState] = useState<PostType[]>([]);

    useEffect(() => {
        if (postSlug) {
            setSelectedPostSlug(postSlug);
        }
    }, [postSlug]);

    // Fetch post details
    useEffect(() => {
        if (postSlug || selectedPostSlug) {
            const slug = postSlug || selectedPostSlug;
            setFormTab('Edit');
            axios
                .get<PostType>(`${DOMAIN}/api/posts/detail/${slug}`)
                .then((res) => {
                    const p = res.data;
                    if (!p) {
                        toast.error('Không tìm thấy bài viết');
                        return;
                    }

                    setFormData({
                        metaTitle: p.metaTitle || '',
                        metaDescription: p.metaDescription || '',
                        metaKeywords: p.metaKeywords || '',
                        slug: p.slug || '',
                    });
                })
                .catch((err) => {
                    console.error('Fetch post failed:', err);
                    toast.error('Lỗi khi tải bài viết');
                });
        } else {
            setFormTab('Create');
            setFormData({
                metaTitle: '',
                metaDescription: '',
                metaKeywords: '',
                slug: ''
            });
        }
    }, [postSlug, selectedPostSlug, DOMAIN]);

    // Fetch all posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const response = await axios.get<PostType[]>(`${DOMAIN}/api/posts`);
                setPostsState(response.data);
            } catch (error) {
                console.error('Lỗi khi tải bài viết:', error);
                toast.error('Không thể tải danh sách bài viết');
            }
        };
        fetchPosts();
    }, []);

    // Update form data when selecting a post in Edit or SEO mode
    useEffect(() => {
        const selectedPost = postsState.find((p) => p.slug === selectedPostSlug);
        if (selectedPost) {
            setFormData({
                metaTitle: selectedPost.metaTitle || '',
                metaDescription: selectedPost.metaDescription || '',
                metaKeywords: selectedPost.metaKeywords || "",
                slug: selectedPost.slug || "",
            });
        }
    }, [formTab, selectedPostSlug, postsState]);

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            data.append('metaTitle', formData.metaTitle);
            data.append('metaDescription', formData.metaDescription);
            data.append('metaKeywords', formData.metaKeywords);
            data.append('slug', formData.slug);
            const toastSlug = toast.loading('Đang cập nhật SEO...');

            await axios.put(`${DOMAIN}/api/posts/update/${selectedPostSlug}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.dismiss(toastSlug);
            toast.success('Cập nhật bài viết thành công!');

            // Reset state
            setFormData({
                metaTitle: '',
                metaDescription: '',
                metaKeywords: '',
                slug: ''
            });

            setSelectedPostSlug('');
            setFormTab('Create');
        } catch (err) {
            console.error('Submit error:', err);
            toast.dismiss();
            toast.error('Lỗi khi gửi dữ liệu.');
        }
    };


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <>
            <ToastContainer />
            <div className="mt-6 p-4 border rounded bg-white shadow-sm">
                <h2 className="text-lg font-bold mb-4 text-black">SEO Metadata</h2>
                <div>
                    {postSlug && (
                        <span>Không được chọn bài viết khác</span>
                    )}
                </div>
                <select
                    className="w-full p-2 mt-1 rounded bg-white"
                    disabled={!!postSlug}
                    value={postSlug || selectedPostSlug}
                    onChange={(e) => setSelectedPostSlug(e.target.value)}
                >
                    <option value="">-- Chọn --</option>
                    {postsState.map((post) => (
                        <option key={post.id} value={post.slug}>
                            {post.title}
                        </option>
                    ))}
                </select>

                <div className="mb-4">
                    <label className="font-bold block mb-2">Meta Title</label>
                    <input
                        className="w-full p-2 rounded bg-white border border-gray-300"
                        name="metaTitle"
                        value={formData.metaTitle || ""}
                        onChange={handleChange}
                        placeholder="Meta title cho Google"
                    />
                </div>

                <div className="mb-4">
                    <label className="font-bold block mb-2">Meta Description</label>
                    <textarea
                        className="w-full p-2 rounded bg-white border border-gray-300"
                        name="metaDescription"
                        value={formData.metaDescription || ""}
                        onChange={handleChange}
                        placeholder="Tóm tắt bài viết (dưới 160 ký tự)"
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label className="font-bold block mb-2">Meta URL (SLUG)</label>
                    <textarea
                        className="w-full p-2 rounded bg-white border border-gray-300"
                        name="slug"
                        value={formData.slug || ""}
                        onChange={handleChange}
                        placeholder="Ví dụ: ten-bai-viet"
                    ></textarea>
                </div>

                <div className="mb-4">
                    <label className="font-bold block mb-2">Meta Keywords</label>
                    <input
                        className="w-full p-2 rounded bg-white border border-gray-300"
                        name="metaKeywords"
                        value={formData.metaKeywords || ""}
                        onChange={handleChange}
                        placeholder="ví dụ: react, seo, blog, bài viết"
                    />
                </div>
            </div>

            {/* Button group  */}
            <div className="flex justify-center w-full mt-2">
                <div className="text-center">
                    <button onClick={handleSubmit} className="bg-yellow-400 rounded px-4 py-2 font-bold cursor-pointer hover:bg-yellow-600">Lưu</button>
                </div>
            </div>
        </>
    );
}
