'use client'

import React, { useEffect, useState } from "react";
import Products from "../../../../components/ProductSearch";
import arrow from "../../../../public/assets/img/left.png"
import ToggleFavoritePost from "../../../../components/toggleFavoritePost";
import Image from "next/image";

const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

interface PostType {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  description: string;
  slug: string;
}

interface ProductType {
  _id: string;
  title: string;
  category: string;
  price: number;
  imageUrl: string;
  URL: string;
}

export default function SearchWrapperClient({
  query,
}: {
  query: string;
}) {
  const DOAMINWEB = process.env.NEXT_PUBLIC_URLWEBSITE;

  const [products, setProducts] = useState<ProductType[]>([]);
  const [posts, setPosts] = useState<PostType[]>([]);

  const productsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {

        const productRes = await fetch(
          `${DOMAIN}/api/products/search?q=${encodeURIComponent(query)}`
        );
        const allProducts = await productRes.json();
        const start = (currentPage - 1) * productsPerPage;
        const end = start + productsPerPage;
        setProducts(allProducts.slice(start, end));

        const postRes = await fetch(
          `${DOMAIN}/api/posts/search?q=${encodeURIComponent(query)}`
        );
        const postData = await postRes.json();
        setPosts(postData);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchData();
  }, [query, currentPage]);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(products.length / productsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <main className=" mx-auto px-6 py-8 mt-15" data-aos="fade-up">
      <h1 className="text-3xl font-bold mb-8 text-black">
        Kết quả tìm kiếm cho &quot;{query}&quot;
      </h1>
      <div className="lg:flex">
        {/* Products session */}
        {products.length > 0 ? (
          <div className="lg:w-3/4 sm:w-full lg:border-r border-gray-300 pr-6">

            <div className="grid lg:grid-cols-4 md:grid-cols-3 gap-2">
              {/* {loading ? (
                <BlogSkeleton count={productsPerPage} />
              ) : currentProducts.length > 0 ? ( */}
              <>
                {currentProducts.map((Product, index) => (
                  <Products
                    key={index}
                    id={Product._id}
                    category={Product.category}
                    title={Product.title}
                    price={Product.price}
                    imageUrl={Product.imageUrl}
                    URL={Product.URL}
                  />
                ))}

              </>
              {/* ) : (
                <p>Không thể tải dữ liệu. Vui lòng thử lại sau!.</p>
              )} */}

            </div>
            <div className="flex justify-center items-center space-x-4 mb-6">
              <button
                onClick={handlePrev}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                disabled={currentPage === 1}
              >
                <Image src={arrow} width={23} alt="prev" />
              </button>
              <span className="text-gray-600">
                {currentPage} of {totalPages}
              </span>
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50"
                disabled={currentPage === totalPages}
              >
                <Image src={arrow} width={23} className="rotate-180" alt="next" />
              </button>
            </div>

          </div>
        ) : null}

        {/* Blog session */}
        {/* <div className={`px-4 ${type === "post" ? 'w-full px-20 max-w-6xl mx-auto' : 'lg:w-1/4'} sm:w-full`}> */}
        <div className={`px-4 lg:w-1/4 sm:w-full`}>
          {/* <h2 className={`text-xl font-bold mb-4 text-black ${type === "post" ? 'hidden' : 'text-black'}`}>Bài viết liên quan</h2> */}
          <h2 className={`text-xl font-bold mb-4 text-black text-black`}>Bài viết liên quan</h2>
          <div className="grid lg:grid-cols-1 md:grid-cols-1 gap-2">
            {/* {loading ? (
              <BlogSkeleton count={5} />
            ) : posts.length > 0 ? ( */}
            <>
              {posts.map((Post, index) => (
                <div
                  className="flex flex-col space-x-4 mb-6 cursor-pointer border border-gray-300 p-2 hover:shadow-lg transition-shadow duration-300"
                  data-aos="fade-right"
                  onClick={() => (window.location.href = `${DOAMINWEB}/blogDetail/${Post.slug}`)}

                  key={index}
                >
                  {/* <div className={`${type === "post" ? 'h-full' : 'h-20'}`}> */}
                  <div className="relative h-20 w-full rounded overflow-hidden">
                    {Post.imageUrl ? (
                      <Image
                        src={Post.imageUrl}
                        alt="Post image"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-gray-500 text-sm bg-gray-100">
                        No image found
                      </div>
                    )}
                  </div>
                  <div className="mt-2">
                    <span className="text-stone-600 text-sm font-semibold">
                      {Post.category}
                    </span>

                    <ToggleFavoritePost postId={Post._id} postTitle={Post.title} slug={Post.slug} />

                    <div
                      className="text-gray-600 text-sm mt-2  line-clamp-2 text-muted"
                      dangerouslySetInnerHTML={{ __html: Post.description }}
                    />
                  </div>
                </div>
              ))}

            </>
            {/* ) : (
              <p>Không thể tải dữ liệu. Vui lòng thử lại sau!.</p>
            )} */}
          </div>
        </div>

      </div>

    </main>
  );
}
