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
    _id: string;
    imageUrl: string;
    title: string;
    description: string;
    discount: number;
    price: number;
    views?: number;
    rating?: number;
    URL?: number;
}

interface CateType {
    _id: string;
    title: string;
}

export default function ProductForm() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const [isEdit, setIsEdit] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState("");
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        description: "",
        category: "",
        discount: "",
        views: "",
        rating: "",
        imageUrl: "",
        URL: "",
    });
    // const navigate = useNavigate();
    const params = useParams();
    const productId = params.id as string;
    const [products, setProducts] = useState<ProductType[]>([]);

    useEffect(() => {
        if (productId) {
            setSelectedProductId(productId);
        }
    }, [productId]);

    useEffect(() => {
        const id = productId || selectedProductId;
        if (id) {

            setIsEdit(true);
            axios.get(`${DOMAIN}/api/products/detail/${id}`).then((res) => {
                const p = res.data;
                if (!p) {
                    toast.error("Không tìm thấy sản phẩm");
                    return;
                }

                setFormData({
                    title: p.title || "",
                    price: p.price || "",
                    description: p.description || "",
                    discount: p.discount ?? "",
                    views: p.views ?? "",
                    rating: p.rating ?? "",
                    category: p.category || "",
                    imageUrl: p.imageUrl || "",
                    URL: p.URL || "",
                });
                setPreview(p.imageUrl || "");
            });
        }

    }, [DOMAIN, productId, selectedProductId]);

    useEffect(() => {
        // Luôn fetch toàn bộ product khi vào trang
        const fetchProducts = async () => {
            try {
                const res = await axios.get(`${DOMAIN}/api/products/`);
                setProducts(res.data);
            } catch (err) {
                console.error("Lỗi khi tải sản phẩm:", err);
            }
        };

        fetchProducts();
    }, [DOMAIN]); // Chạy 1 lần


    useEffect(() => {
        if (isEdit && productId) {
            axios.get(`${DOMAIN}/api/products/search?q=${productId}`).then((res) => {
                const p = res.data;
                setFormData({
                    title: p.title || "",
                    price: p.price?.toString() || "",
                    description: p.description || "",
                    discount: p.discount?.toString() || "",
                    views: p.views?.toString() || "",
                    rating: p.rating?.toString() || "",
                    category: p.category || "",
                    imageUrl: p.imageUrl || "",
                    URL: p.URL || "",
                });
                setPreview(p.imageUrl || "");
            });
        }
    }, [isEdit, productId, DOMAIN]);

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
        } else if (!formData.imageUrl) {
            setPreview(
                "https://res.cloudinary.com/daeorkmlh/image/upload/v1750835215/No-Image-Placeholder.svg_v0th8g.png"
            );
        } else {
            setPreview(formData.imageUrl);
        }
    }, [imageFile, formData.imageUrl]);

    const handleSubmit = async () => {
        try {
            const data = new FormData();
            data.append("uid", "test");
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
            data.append("URL", formData.URL);

            const toastId = toast.loading(isEdit ? "Đang cập nhật sản phẩm..." : "Đang đăng sản phẩm...");

            if (isEdit && selectedProductId) {
                await axios.put(`${DOMAIN}/api/products/update/${selectedProductId}`, data, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
                toast.dismiss(toastId);
                toast.success("Cập nhật sản phẩm thành công!");
            } else {
                // ✅ CREATE new product
                await axios.post(`${DOMAIN}/api/products/create`, data, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                });
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
                imageUrl: "",
                URL: "",
            });
            setImageFile(null);
            setPreview("https://res.cloudinary.com/daeorkmlh/image/upload/v1750835215/No-Image-Placeholder.svg_v0th8g.png");
            setSelectedProductId("");
            setIsEdit(false);
        } catch (err) {
            console.error("Update error:", err);
            toast.error("Lỗi khi gửi dữ liệu.");
        }
    };

    const handleDelete = async () => {
        if (!selectedProductId) return;

        const confirmed = window.confirm("Bạn có chắc chắn muốn xoá sản phẩm này?");
        if (!confirmed) return;

        try {
            const toastId = toast.loading("Đang xoá bài...");

            await axios.delete(`${DOMAIN}/api/products/delete/${selectedProductId}`);

            toast.dismiss(toastId);
            toast.success("Xoá sản phẩm thành công!");

            // Reset form and edit state
            setSelectedProductId("");
            setIsEdit(false);
            setFormData({
                title: "",
                price: "",
                description: "",
                discount: "",
                views: "",
                rating: "",
                category: "",
                imageUrl: "",
                URL: "",
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
                        setSelectedProductId("");
                        setFormData({
                            title: "",
                            price: "",
                            description: "",
                            discount: "",
                            views: "",
                            rating: "",
                            category: "",
                            imageUrl: "",
                            URL: "",
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
                            {productId ? (
                                <span>Không được chọn sản phẩm khác</span>
                            ) : (
                                <span>Bạn có thể chọn sản phẩm</span>
                            )}
                        </div>
                        <label className="font-bold">Chọn sản phẩm</label>
                        <select
                            className="w-full p-2 mt-1 rounded bg-white p-2"
                            value={selectedProductId}
                            onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                            <option value="">-- Chọn --</option>
                            {products.map((product) => (
                                <option key={product._id} value={product._id}>
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
                            <option value={cat.title} key={cat._id}>{cat.title}</option>
                        ))}
                    </select>
                </div>
                <div className="flex space-x-4">
                    <div className="flex-1">
                        <label className="font-bold">URL sản phẩm</label>
                        <input
                            className="w-full p-2 mt-1 rounded bg-white"
                            name="URL"
                            value={formData.URL}
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
                    {isEdit && selectedProductId && (
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
