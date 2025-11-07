'use client'

import React, { useEffect, useState } from "react";
// import BlogSkeleton from "../components/BlogSkeleton";
import { toast } from "react-toastify";
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

export default function SearchWrapperClient({
  query,
}: {
  query: string;
}) {
  const DOAMINWEB = process.env.NEXT_PUBLIC_URLWEBSITE;

  const [posts, setPosts] = useState<PostType[]>([]);

  const postsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = posts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(posts.length / postsPerPage);

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
        {/* Blog session */}
        <div className={`px-4 w-full px-20 max-w-6xl mx-auto sm:w-full`}>
          {/* <div className={`px-4 lg:w-1/4 sm:w-full`}> */}
          {/* <h2 className={`text-xl font-bold mb-4 text-black ${type === "post" ? 'hidden' : 'text-black'}`}>Bài viết liên quan</h2> */}
          <div className="grid lg:grid-cols-1 md:grid-cols-1 gap-2">
            {/* {loading ? (
              <BlogSkeleton count={5} />
            ) : posts.length > 0 ? ( */}
            <>
              {currentPosts.map((Post, index) => (
                <div
                  className="flex flex-col space-x-4 mb-6 cursor-pointer border border-gray-300 p-2 hover:shadow-lg transition-shadow duration-300"
                  data-aos="fade-right"
                  onClick={() => (window.location.href = `${DOAMINWEB}/blogDetail/${Post.slug}`)}
                  key={index}
                // onClick={() => {
                //   handlePostsDetailClick(Post._id);
                // }}
                >
                  {/* <div className={`h-full`}> */}
                  <div className="relative h-80 w-full rounded overflow-hidden">
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

                    <ToggleFavoritePost postId={Post._id} postTitle={Post.title} />

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
