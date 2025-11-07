'use client';

import { useState, useEffect, useRef } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import axios from 'axios';
import ImagePostDropzone from '../../../../../../components/ImagePostDropzone';
import 'react-toastify/dist/ReactToastify.css';
import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';
import sanitizeHtml from 'sanitize-html';
import Image from 'next/image';
import { GoChevronLeft } from "react-icons/go";
import { GoChevronRight } from "react-icons/go";

// Dynamically import RichTextEditor with SSR disabled
const RichTextEditor = dynamic(() => import('@/app/admin/Admin_components/RichEditor'), {
    ssr: false,
});

// Define interfaces
interface PostType {
    _id: string;
    title: string;
    category: string;
    views: number;
    imageUrl: string;
    content: string;
    description: string;
    createdAt: Date;
    slug: string;
}

interface AssetsType {
    _id: string;
    imageUrl: string;
}

interface FormData {
    title: string;
    description: string;
    category: string;
    views: number | string;
    content: string;
    imageUrl: string;
    slug: string;
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    product: AssetsType | null;
}

interface RichTextEditorRef {
    insertImage: (url: string) => void;
}

interface CategoryType {
    _id: string;
    title: string;
}

const DEFAULT_IMAGE =
    'https://res.cloudinary.com/daeorkmlh/image/upload/v1750835215/No-Image-Placeholder.svg_v0th8g.png';

export default function PostForm() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;
    const params = useParams();
    const postSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug || '';



    const [formTab, setFormTab] = useState<'Create' | 'Edit' | 'SEO'>('Create');
    const [selectedPostSlug, setSelectedPostSlug] = useState<string>('');
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        category: '',
        views: 0,
        content: '',
        imageUrl: '',
        slug: '',
    });
    const [postsState, setPostsState] = useState<PostType[]>([]);
    const [assets, setAssets] = useState<AssetsType[]>([]);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        product: null,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageError, setImageError] = useState<string>('');
    const [preview, setPreview] = useState<string>(DEFAULT_IMAGE);

    const editorRef = useRef<RichTextEditorRef>(null);
    const scrollRefs = useRef<{ [key: string]: HTMLDivElement }>({});

    const [categories, setCategories] = useState<CategoryType[]>([]);

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
                    const p = res.data; // lấy thẳng từ res.data
                    if (!p) {
                        toast.error('Không tìm thấy bài viết');
                        return;
                    }

                    // Xử lý content & description đã sanitize
                    const sanitizedContent = sanitizeHtml(p.content || '', {
                        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe']),
                        allowedAttributes: {
                            img: ['src', 'alt'],
                            a: ['href', 'target'],
                            '*': ['style', 'class'],
                        },
                    });

                    const sanitizedDescription = sanitizeHtml(p.description || '', {
                        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['p', 'br']),
                        allowedAttributes: {
                            a: ['href', 'target'],
                            '*': ['style', 'class'],
                        },
                    });

                    setFormData({
                        title: p.title || '',
                        description: sanitizedDescription,
                        category: p.category || '',
                        views: p.views || 0,
                        content: sanitizedContent,
                        imageUrl: p.imageUrl || '',
                        slug: p.slug || '',
                    });

                    setPreview(p.imageUrl || DEFAULT_IMAGE);
                })
                .catch((err) => {
                    console.error('Fetch post failed:', err);
                    toast.error('Lỗi khi tải bài viết');
                });
        } else {
            setFormTab('Create');
            setFormData({
                title: '',
                description: '',
                category: '',
                views: 0,
                content: '',
                imageUrl: '',
                slug: '',
            });
            setPreview(DEFAULT_IMAGE);
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

    // Fetch assets
    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await axios.get<AssetsType[]>(`${DOMAIN}/api/assets`);
                setAssets(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                console.error('Fetch Assets failed:', err);
                toast.error('Không thể tải danh sách tài sản');
            }
        };
        fetchAssets();

        const handleClick = () => setContextMenu({ ...contextMenu, visible: false });
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, [contextMenu]);

    // Fetch categories
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get<CategoryType[]>(`${DOMAIN}/api/categories`);
                setCategories(response.data);
            } catch (error) {
                console.error('Lỗi khi tải danh mục:', error);
                toast.error('Không thể tải danh mục bài viết');
            }
        };
        fetchCategories();
    }, []);

    // Update form data when selecting a post in Edit or SEO mode
    useEffect(() => {
        if ((formTab === 'Edit' || formTab === 'SEO') && selectedPostSlug) {
            const selectedPost = postsState.find((p) => p.slug === selectedPostSlug);
            if (selectedPost) {
                const sanitizedContent = sanitizeHtml(selectedPost.content, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'iframe']),
                    allowedAttributes: {
                        img: ['src', 'alt'],
                        a: ['href', 'target'],
                        '*': ['style', 'class'],
                    },
                });
                const sanitizedDescription = sanitizeHtml(selectedPost.description, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['p', 'br']),
                    allowedAttributes: {
                        a: ['href', 'target'],
                        '*': ['style', 'class'],
                    },
                });
                setFormData({
                    title: selectedPost.title || '',
                    description: sanitizedDescription,
                    views: selectedPost.views ?? 0,
                    category: selectedPost.category || '',
                    content: sanitizedContent,
                    imageUrl: selectedPost.imageUrl || '',
                    slug: selectedPost.slug,
                });
                setPreview(selectedPost.imageUrl || DEFAULT_IMAGE);
            }
        }
    }, [formTab, selectedPostSlug, postsState]);

    // Handle image preview
    useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(imageFile);
        } else {
            setPreview(formData.imageUrl || DEFAULT_IMAGE);
        }
    }, [imageFile, formData.imageUrl]);

    const handleRightClick = (e: React.MouseEvent, product: AssetsType) => {
        e.preventDefault();
        setContextMenu({ visible: true, x: e.pageX, y: e.pageY, product });
    };

    const handleInsertToEditor = () => {
        const url = contextMenu.product?.imageUrl;
        if (url && editorRef.current) {
            editorRef.current.insertImage(url);
            toast.success('Đã chèn ảnh vào nội dung!');
            setContextMenu({ ...contextMenu, visible: false });
        } else {
            toast.error('Không thể chèn ảnh!');
        }
    };

    const handleChangeDescription = (value: string) => {
        setFormData((prev) => ({ ...prev, description: value }));
    };

    const handleChangeContent = (value: string) => {
        setFormData((prev) => ({ ...prev, content: value }));
    };

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            data.append('uid', 'test');
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('views', formData.views.toString());
            data.append('content', formData.content);
            data.append('category', formData.category);
            data.append('slug', formData.slug);
            if (imageFile) {
                data.append('image', imageFile);
            }

            const toastSlug = toast.loading(formTab === 'Edit' ? 'Đang cập nhật bài...' : 'Đang đăng bài...');

            if (formTab === 'Edit' && selectedPostSlug) {
                await axios.put(`${DOMAIN}/api/posts/update/${selectedPostSlug}`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.dismiss(toastSlug);
                toast.success('Cập nhật bài viết thành công!');
            } else {
                await axios.post(`${DOMAIN}/api/posts/create`, data, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.dismiss(toastSlug);
                toast.success('Đăng bài thành công!');
            }

            // Reset state
            setFormData({
                title: '',
                description: '',
                views: 0,
                content: '',
                category: '',
                imageUrl: '',
                slug: '',
            });
            setImageFile(null);
            setPreview(DEFAULT_IMAGE);
            setSelectedPostSlug('');
            setFormTab('Create');
        } catch (err) {
            console.error('Submit error:', err);
            toast.dismiss();
            toast.error('Lỗi khi gửi dữ liệu.');
        }
    };

    const handleDelete = async () => {
        if (!selectedPostSlug) return;

        const confirmed = window.confirm('Bạn có chắc chắn muốn xoá bài viết này?');
        if (!confirmed) return;

        try {
            const toastSlug = toast.loading('Đang xoá bài...');
            await axios.delete(`${DOMAIN}/api/posts/delete/${selectedPostSlug}`);
            toast.dismiss(toastSlug);
            toast.success('Xoá bài viết thành công!');

            // Reset form and edit state
            setSelectedPostSlug('');
            setFormTab('Create');
            setFormData({
                title: '',
                description: '',
                views: 0,
                content: '',
                category: '',
                imageUrl: '',
                slug: '',
            });
            setImageFile(null);
            setPreview(DEFAULT_IMAGE);
        } catch (error) {
            console.error('Delete error:', error);
            toast.error('Lỗi khi xoá bài viết.');
        }
    };

    const scrollLeft = (key: string) => {
        scrollRefs.current[key]?.scrollBy({
            left: -window.innerWidth,
            behavior: 'smooth',
        });
    };

    const scrollRight = (key: string) => {
        scrollRefs.current[key]?.scrollBy({
            left: window.innerWidth,
            behavior: 'smooth',
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleURLChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    return (
        <>
            <ToastContainer />
            <div className="flex justify-center space-x-8 font-bold text-center mt-5 mb-4 text-black">
                <span
                    className={`cursor-pointer ${formTab === "Create" && "underline"}`}
                    onClick={() => {
                        setFormTab("Create");
                        setSelectedPostSlug("");
                        setFormData({
                            title: "",
                            description: "",
                            views: "",
                            content: "",
                            category: "",
                            imageUrl: "",
                            slug: "",
                        });
                    }}
                >
                    Thêm bài viết
                </span>
                <span
                    className={`cursor-pointer ${formTab === "Edit" && "underline"}`}
                    onClick={() => setFormTab("Edit")}
                >
                    Sửa bài viết
                </span>
            </div>
            <div className="bg-gray-100 rounded p-6 space-y-4 max-w-6xl mx-auto text-black mb-14">
                {formTab === "Edit" && (
                    <div>
                        <div>
                            {postSlug && (
                                <span>Không được chọn bài viết khác</span>
                            )}
                        </div>
                        <select
                            className="w-full p-2 mt-1 rounded bg-white p-2"
                            disabled={!!postSlug}
                            value={selectedPostSlug}
                            onChange={(e) => setSelectedPostSlug(e.target.value)}
                        >
                            <option value="">-- Chọn --</option>
                            {postsState.map((post) => (
                                <option key={post._id} value={post.slug}>
                                    {post.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}{formTab === "Create" && (
                    <div>
                        {/* Add new session  */}
                        <label className="font-bold">Tên bài viết</label>
                        <input
                            className="w-full p-2 mt-1 rounded bg-white"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Tên bài viết"
                        />
                    </div>
                )}
                {formTab !== "SEO" && (
                    <>
                        <div className="flex space-x-4">
                            <div className="flex-1">
                                <label className="font-bold">Views</label>
                                <input
                                    className="w-full p-2 mt-1 rounded bg-white"
                                    name="views"
                                    value={formData.views}
                                    onChange={handleChange}
                                    placeholder="678.000"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="font-bold block mb-2">Mô tả bài viết</label>
                            <div className="h-60vh w-100%">
                                <RichTextEditor
                                    value={formData.description}
                                    onChange={handleChangeDescription}
                                />
                            </div>
                            <br></br>
                        </div>

                        {/* Assest Pictures  */}
                        <div className='px-5 mb-10'>
                            {/* title */}
                            <div className='flex justify-between items-center mb-5'
                            >
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => scrollLeft("1")}
                                        className="bg-gray-300 w-10 h-10 sm:w-12 sm:h-12 rounded-full justify-center flex items-center pr-1 cursor-pointer hover:bg-gray-400 group focus:bg-black"
                                    >
                                        <GoChevronLeft className="text-[30px] text-gray-800 group-focus:invert" />
                                    </button>
                                    <button
                                        onClick={() => scrollRight("1")}
                                        className="bg-gray-300 w-10 h-10 sm:w-12 sm:h-12 rounded-full justify-center flex items-center cursor-pointer hover:bg-gray-400 group focus:bg-black focus:text-white"
                                    >
                                        <GoChevronRight className="text-[30px] text-gray-800 group-focus:invert font-thin" />
                                    </button>
                                </div>
                            </div>
                            <div
                                ref={(el) => {
                                    if (el) scrollRefs.current['assets'] = el;
                                }}
                                className="overflow-x-auto no-scrollbar cursor-pointer scroll-smooth transition ease-in-out duration-300"
                            >
                                <div className="flex w-fit space-x-4">
                                    {
                                        assets.map((assets) => (
                                            <div
                                                key={assets._id}
                                                onContextMenu={(e) => handleRightClick(e, assets)}
                                                className="xl:w-[calc(90vw/3-1rem)] lg:w-[calc(90vw/3-1rem)] md:w-[calc(90vw/2-1rem)] sm:w-[calc(90vw-1rem)] flex-shrink-0 border border-gray-300 p-2 hover:shadow-lg transition-shadow duration-300"
                                            >
                                                <div className='w-full h-48 relative '>
                                                    <Image
                                                        fill
                                                        src={assets.imageUrl}
                                                        className="object-cover"
                                                        alt="Assets"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="font-bold block mb-2">Nội dung</label>
                            <div className="h-60vh w-100%">
                                <RichTextEditor
                                    ref={editorRef}
                                    value={formData.content}
                                    onChange={handleChangeContent}
                                />
                            </div>
                            <br></br>
                        </div>

                        <div className="mb-4">
                            <label className="font-bold block mb-2">Meta URL (SLUG)</label>
                            <textarea
                                className="w-full p-2 rounded bg-white border border-gray-300"
                                name="slug"
                                value={formData.slug || ""}
                                onChange={handleURLChange}
                                placeholder="Ví dụ: ten-bai-viet"
                            ></textarea>
                        </div>

                        <div>
                            <label className="font-bold block mb-2 mt-4">Chọn danh mục</label>
                            <select
                                className="w-full p-2 mt-1 rounded bg-white border border-gray-300"
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="">-- Chọn --</option>
                                {categories.map(cat => (
                                    <option value={cat.title} key={cat._id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>
                        {/* Image */}
                        <div className="p-3">
                            <label className="block font-semibold text-[24px]">Image</label>
                            <ImagePostDropzone
                                setAvatarFile={setImageFile}
                                setPreview={(url: string | ArrayBuffer | null) => setPreview(url ? String(url) : "")}
                                setAvatarError={setImageError}
                            />
                            {preview && (
                                <div className="mt-8 flex items-center gap-4 w-60 h-60 relative">
                                    <Image
                                        fill
                                        src={preview}
                                        alt="Preview"
                                        className="mt-2 object-cover rounded"
                                    />
                                </div>
                            )}
                            {imageError && (
                                <p className="text-red-500 text-sm mt-2">{imageError}</p>
                            )}
                        </div>


                    </>
                )}
                {/* Button group  */}
                <div className="flex justify-center w-full">
                    <div className="text-center">
                        <button onClick={handleSubmit} className="bg-yellow-400 rounded px-4 py-2 font-bold cursor-pointer hover:bg-yellow-600">Lưu</button>
                    </div>
                    {formTab === "Edit" && selectedPostSlug && (
                        <div className="text-center ml-3">
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 text-white rounded px-4 py-2 font-bold hover:bg-red-700 cursor-pointer"
                            >
                                Xoá bài viết
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className="absolute z-50 bg-white border border-gray-300 shadow-md rounded p-2"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                >
                    <button
                        className="block w-full text-left px-2 py-1 hover:bg-gray-100 cursor-pointer"
                        onClick={handleInsertToEditor}
                    >
                        📎 Chèn vào nội dung
                    </button>
                </div>
            )}
        </>
    );
}
