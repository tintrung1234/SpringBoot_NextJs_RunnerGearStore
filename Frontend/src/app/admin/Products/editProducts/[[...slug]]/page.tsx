'use client'
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import ImagePostDropzone from "../../../../../../components/ImagePostDropzone";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import('@/app/admin/Admin_components/RichEditor'), {
    ssr: false,
});

interface ProductType {
    id: string;
    image_url: string;
    title: string;
    description: string;
    discount: number;
    price: number;
    views?: number;
    rating?: number;
    slug?: number;
}

interface CateType {
    id: string;
    title: string;
}

export default function ProductForm() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const [isEdit, setIsEdit] = useState(false);
    const [selectedProductslug, setSelectedProductslug] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        description: "",
        category: "",
        discount: "",
        views: "",
        rating: "",
        image_url: "",
        slug: "",
    });
    // const navigate = useNavigate();
    const params = useParams();
    const slugParams = params.slug as string;
    const [products, setProducts] = useState<ProductType[]>([]);

    useEffect(() => {
        if (slugParams) {
            setSelectedProductslug(slugParams);
        }
    }, [slugParams]);

    useEffect(() => {
        const slug = selectedProductslug || slugParams;

        if (!slug) return;

        const fetchProductDetail = async () => {
            try {
                const res = await axios.get(`${DOMAIN}/api/products/detail/${slug}`);
                const p = res.data;

                if (!p) {
                    toast.error("Không tìm thấy sản phẩm");
                    return;
                }

                setFormData({
                    title: p.title || "",
                    price: p.price?.toString() || "",
                    description: p.description || "",
                    discount: p.discount?.toString() || "",
                    views: p.views?.toString() || "",
                    rating: p.rating?.toString() || "",
                    category: p.category || "",
                    image_url: p.image_url || "",
                    slug: p.slug || "",
                });
                setPreview(p.image_url || "");
            } catch (err) {
                console.error("Lỗi khi tải chi tiết sản phẩm:", err);
                toast.error("Không thể tải thông tin sản phẩm");
            }
        };

        fetchProductDetail();
    }, [selectedProductslug, slugParams, DOMAIN]);

    useEffect(() => {
        // Luôn fetch toàn bộ product khi vào trang
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${DOMAIN}/api/products`);
                setProducts(res.data);
            } catch (err) {
                console.error("Lỗi khi tải sản phẩm:", err);
            }
        };

        fetchProducts();
    }, [DOMAIN]); // Chạy 1 lần


    useEffect(() => {
        if (isEdit && slugParams) {
            axios.get(`${DOMAIN}/api/products/search?q=${slugParams}`).then((res) => {
                const p = res.data;
                setFormData({
                    title: p.title || "",
                    price: p.price?.toString() || "",
                    description: p.description || "",
                    discount: p.discount?.toString() || "",
                    views: p.views?.toString() || "",
                    rating: p.rating?.toString() || "",
                    category: p.category || "",
                    image_url: p.image_url || "",
                    slug: p.slug || "",
                });
                setPreview(p.image_url || "");
            });
        }
    }, [isEdit, slugParams, DOMAIN]);

    const [Categories, setCategories] = useState<CateType[]>([]);

    useEffect(() => {
        const fetchcategories = async () => {
            try {
                const response = await axios.get(`${DOMAIN}/api/categories`);
                setCategories(response.data);
            } catch (error) {
                console.error("Lỗi khi tải sản phẩm:", error);
            }
        };

        fetchcategories();

    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const [imageFile, setImageFile] = useState<File | null>(null);

    const [imageError, setImageError] = useState("");
    const [preview, setPreview] = useState("");

    // Handle image preview
    useEffect(() => {
        if (imageFile) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(imageFile);
        } else if (!formData.image_url) {
            setPreview(
                "https://res.cloudinary.com/daeorkmlh/image/upload/v1750835215/No-Image-Placeholder.svg_v0th8g.png"
            );
        } else {
            setPreview(formData.image_url);
        }
    }, [imageFile, formData.image_url]);

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("price", formData.price);
            data.append("description", formData.description);
            data.append("discount", formData.discount);
            data.append("views", formData.views);
            data.append("rating", formData.rating);
            data.append("category", formData.category);
            if (imageFile) {
                data.append("image", imageFile);
            }
            data.append("slug", formData.slug);

            const toastId = toast.loading(isEdit ? "Đang cập nhật sản phẩm..." : "Đang đăng sản phẩm...");

            if (isEdit && selectedProductslug) {
                await axios.put(`${DOMAIN}/api/products/update/${selectedProductslug}`, data);
                // Remove the headers config - let axios set it automatically
                toast.dismiss(toastId);
                toast.success("Cập nhật sản phẩm thành công!");
            } else {
                // CREATE new product
                await axios.post(`${DOMAIN}/api/products/create`, data);
                // Remove the headers config - let axios set it automatically
                toast.dismiss(toastId);
                toast.success("Đăng sản phẩm thành công!");
            }

            // Reset state
            setFormData({
                title: "",
                price: "",
                description: "",
                discount: "",
                views: "",
                rating: "",
                category: "",
                image_url: "",
                slug: "",
            });
            setImageFile(null);
            setPreview("https://res.cloudinary.com/daeorkmlh/image/upload/v1750835215/No-Image-Placeholder.svg_v0th8g.png");
            setSelectedProductslug("");
            setIsEdit(false);
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Lỗi khi gửi dữ liệu.");
        }
    };

    const handleDelete = async () => {
        if (!selectedProductslug) return;

        const confirmed = window.confirm("Bạn có chắc chắn muốn xoá sản phẩm này?");
        if (!confirmed) return;

        try {
            const toastId = toast.loading("Đang xoá bài...");

            await axios.delete(`${DOMAIN}/api/products/delete/${selectedProductslug}`);

            toast.dismiss(toastId);
            toast.success("Xoá sản phẩm thành công!");

            // Reset form and edit state
            setSelectedProductslug("");
            setIsEdit(false);
            setFormData({
                title: "",
                price: "",
                description: "",
                discount: "",
                views: "",
                rating: "",
                category: "",
                image_url: "",
                slug: "",
            });
            setImageFile(null);
            setPreview(
                "https://res.cloudinary.com/daeorkmlh/image/upload/v1750835215/No-Image-Placeholder.svg_v0th8g.png"
            );
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Lỗi khi xoá sản phẩm.");
        }
    };

    const handleChangeDescription = (value: string) => {
        setFormData((prev) => ({ ...prev, description: value }));
    };

    return (
        <>
            <ToastContainer />
            <div className="flex justify-center space-x-8 font-bold text-center mt-5 mb-4 text-black">
                <span
                    className={`cursor-pointer ${!isEdit && "underline"}`}
                    onClick={() => {
                        setIsEdit(false);
                        setSelectedProductslug("");
                        setFormData({
                            title: "",
                            price: "",
                            description: "",
                            discount: "",
                            views: "",
                            rating: "",
                            category: "",
                            image_url: "",
                            slug: "",
                        });
                    }}
                >
                    Thêm sản phẩm
                </span>
                <span
                    className={`cursor-pointer ${isEdit && "underline"}`}
                    onClick={() => setIsEdit(true)}
                >
                    Sửa sản phẩm
                </span>
            </div>
            <div className="bg-gray-100 rounded p-6 space-y-4 max-w-6xl mx-auto text-black mb-14">

                {isEdit ? (
                    <div>
                        <div>
                            {selectedProductslug ? (
                                <span>Không được chọn sản phẩm khác</span>
                            ) : (
                                <span>Bạn có thể chọn sản phẩm</span>
                            )}
                        </div>
                        <label className="font-bold">Chọn sản phẩm</label>
                        <select
                            className="w-full p-2 mt-1 rounded bg-white p-2"
                            value={selectedProductslug}
                            onChange={(e) => setSelectedProductslug(e.target.value)}
                        >
                            <option value="">-- Chọn --</option>
                            {products.map((product) => (
                                <option key={product.id} value={product.slug}>
                                    {product.title}
                                </option>
                            ))}
                        </select>
                    </div>
                ) : (
                    <div>
                        <label className="font-bold">Tên sản phẩm</label>
                        <input
                            className="w-full p-2 mt-1 rounded bg-white"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Tên sản phẩm"
                        />
                    </div>
                )}
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="font-bold">Giá tiền</label>
                        <input
                            className="w-full p-2 mt-1 rounded bg-white"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="678.000"
                        />
                    </div>
                </div>
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="font-bold">Giảm giá</label>
                        <input
                            className="w-full p-2 mt-1 rounded bg-white"
                            name="discount"
                            value={formData.discount}
                            onChange={handleChange}
                            placeholder="678.000"
                        />
                    </div>
                </div>
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
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="font-bold">Điểm đánh giá (5 điềm)</label>
                        <input
                            className="w-full p-2 mt-1 rounded bg-white"
                            name="rating"
                            value={formData.rating}
                            onChange={handleChange}
                            placeholder="678.000"
                        />
                    </div>
                </div>
                <div className="mb-4">
                    <label className="font-bold block mb-2">Mô tả sản phẩm</label>
                    <div className="h-60vh w-100%">
                        <RichTextEditor
                            value={formData.description}
                            onChange={handleChangeDescription}
                        />
                    </div>
                    <br></br>
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
                        {Categories.map(cat => (
                            <option value={cat.title} key={cat.id}>{cat.title}</option>
                        ))}
                    </select>
                </div>
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="font-bold">URL sản phẩm</label>
                        <input
                            className="w-full p-2 mt-1 rounded bg-white"
                            name="URL"
                            value={formData.slug}
                            onChange={handleChange}
                            placeholder="https//..."
                        />
                    </div>
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
                        <div className="relative mt-8 flex items-center gap-4 w-60 h-60 w-40">
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

                {/* Button group  */}
                <div className="flex justify-center w-full">
                    <div className="text-center">
                        <button onClick={handleSubmit} className="bg-yellow-400 rounded px-4 py-2 font-bold cursor-pointer hover:bg-yellow-600">Lưu</button>
                    </div>
                    {isEdit && selectedProductslug && (
                        <div className="text-center ml-3">
                            <button
                                onClick={handleDelete}
                                className="bg-red-500 text-white rounded px-4 py-2 font-bold hover:bg-red-700 cursor-pointer"
                            >
                                Xoá sản phẩm
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
