import "./DanhMuc.css";
import Breadcrumb from "../../../../components/BreadCrumb";
import DanhMucClient from "./DanhMucClient";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  views: number;
  rating: number;
  imageUrl: string;
  URL: string
}

interface Category {
  _id: string;
  title: string;
}

type PageProps = {
  params: Promise<{ categoryName: string }>; // Use Promise for params
};

export default async function DanhMuc({ params }: PageProps) {
  const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

  // Await params to get categoryName
  const { categoryName } = await params;
  const decodedCategoryName = decodeURIComponent(categoryName);

  let selectedCategory = "";
  let categories: Category[] = [];
  try {
    const response = await fetch(`${DOMAIN}/api/categories`, {
      cache: "no-store", // Disable cache for dynamic data
    });
    if (!response.ok) {
      throw new Error("Failed to fetch categories");
    }
    categories = await response.json();
    // Auto-select if param matches category.title
    if (categoryName) {
      const matched = categories.find(
        (cat) => cat.title.toLowerCase() === decodedCategoryName.toLowerCase()
      );
      if (matched) {
        selectedCategory = matched.title;
      }
    }
  } catch (error) {
    console.error("Lỗi khi tải danh mục:", error);
  }

  let products: Product[] = [];
  try {
    if (!selectedCategory) {
      // Fetch all products if no category is selected
      const response = await fetch(`${DOMAIN}/api/products/`, {
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      products = await response.json();
    } else {
      // Fetch products for the selected category
      const res = await fetch(
        `${DOMAIN}/api/products/category/${encodeURIComponent(selectedCategory)}`,
        {
          cache: "no-store",
        }
      );
      if (!res.ok) {
        throw new Error("Failed to fetch products for category");
      }
      const data = await res.json();
      products = Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.error("Lỗi khi tải sản phẩm:", error);
  }

  return (
    <DanhMucClient categoryName={selectedCategory} products={products} categories={categories} />
  );
}