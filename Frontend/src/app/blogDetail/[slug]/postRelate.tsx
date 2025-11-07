'use client'

import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ToggleFavoritePost from "../../../../components/toggleFavoritePost";
import Image from "next/image";
import { GoChevronLeft } from "react-icons/go";
import { GoChevronRight } from "react-icons/go";

interface PostType {
    _id: string;
    title: string;
    description: string;
    category: string;
    content: string;
    imageUrl: string;
    views: number;
    createdAt: string;
    slug: string;
}

export default function PostRelate({ categoryName }: { categoryName: string }) {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN
    const [postRelate, setPostRelate] = useState<PostType[]>([]);

    useEffect(() => {
        const fetchAllPostRelate = async () => {
            if (!categoryName) return;

            try {
                const res = await axios.get(`${DOMAIN}/api/posts/category/${encodeURIComponent(categoryName)}`);
                setPostRelate(Array.isArray(res.data) ? res.data : []);
            } catch (error) {
                console.error(error);
                toast.error("Không thể tải dữ liệu các danh mục.");
            }
        };

        fetchAllPostRelate();
    }, []);

    const scrollRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

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
    return (
        <div className='px-10 mb-10'
            data-aos="fade-right"
            data-aos-duration="1000"
            data-aos-easing="ease-in-out">
            {/* title */}
            <div className='flex justify-between items-center mb-5'
            >
                <h2 className={`text-black sm:text-xl lg:text-2xl font-bold`}>Bài viết liên quan</h2>

                <div className='flex space-x-2'>
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
            </div>

            {/* Post list */}
            <div
                data-aos="fade-up"
                data-aos-duration="600"
                data-aos-easing="ease-in-out"
                ref={(el) => { scrollRefs.current[0] = el; }}
                className="overflow-x-auto no-scrollbar cursor-pointer scroll-smooth transition ease-in-out duration-300">
                <div className="flex w-fit space-x-4">
                    {postRelate.length === 0 ? (
                        <div className="text-black">Không có bài viết tương tự</div>
                    ) : (
                        postRelate.map((post) => (

                            <div
                                key={post._id}
                                className="xl:w-[calc(90vw/3-1rem)] lg:w-[calc(90vw/3-1rem)] md:w-[calc(90vw/2-1rem)] sm:w-[calc(90vw-1rem)] flex-shrink-0 border border-gray-300 p-2 hover:shadow-lg transition-shadow duration-300"
                                onClick={() => (window.location.href = `/blogDetail/${post.slug}`)}
                            >
                                {post.imageUrl ? (
                                    <div className="relative w-full h-48 sm:h-56 lg:h-64">
                                        <Image
                                            fill
                                            src={post.imageUrl}
                                            className="object-cover"
                                            alt={post.title}
                                        />
                                    </div>
                                )
                                    :
                                    <div className="sm:h-56 lg:h-64 bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500 text-sm">Không có ảnh</span>
                                    </div>
                                }
                                <ToggleFavoritePost postId={post._id} postTitle={post.title} />
                                <div
                                    className="text-gray-600 text-sm mt-2  line-clamp-2 text-muted"
                                    dangerouslySetInnerHTML={{ __html: post.description }}
                                />
                            </div>
                        )))}
                </div>
            </div>
        </div >
    )
}
