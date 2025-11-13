'use client'

import React, { useRef } from 'react'
import Image from 'next/image';
import ToggleFavoritePost from '../../../components/toggleFavoritePost';
import { useRouter } from 'next/navigation';
import { GoChevronLeft } from "react-icons/go";
import { GoChevronRight } from "react-icons/go";
import Breadcrumb from '../../../components/BreadCrumb';
import SearchBox from '../../../components/SearchBox';

interface PostType {
    id: string;
    title: string;
    category: string;
    imageUrl: string;
    content: string;
    description: string;
    slug: string;
    createdAt: Date
}

interface Category {
    id: string;
    title: string;
}

export default function BlogClientPage(
    {
        posts,
        topPost,
        categories,
        postsByCategory,
    }: {
        posts: PostType[];
        topPost: PostType;
        categories: Category[];
        postsByCategory: { [key: string]: PostType[] };
    }
) {
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

    const router = useRouter();

    const DOAMINWEB = process.env.NEXT_PUBLIC_URLWEBSITE;

    const handleDetailClick = (slug: string) => {
        router.push(`${DOAMINWEB}/blogDetail/${slug}`);
    };

    return (
        <div>
            <div className="max-w-[80vw] mx-auto mt-20 text-black">
                <div className='h-9 w-full mt-3 flex items-center justify-between mb-8 mt-4'>
                    <Breadcrumb />
                    <div className="w-90 h-9">
                        <SearchBox searchEndpoint='/api/posts/search' type="post" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Featured Post */}
                    <div
                        className="md:col-span-2 mb-5"
                        data-aos="fade-right"
                        data-aos-duration="1000"
                        data-aos-easing="ease-in-out"
                    >
                        <h2 className="text-2xl font-bold mb-5">Bài viết nổi bật</h2>

                        {topPost && (
                            <div className="border p-4">
                                <div className="overflow-hidden">
                                    <div className='w-full h-auto relative'>
                                        {topPost.imageUrl ? (
                                            <div className='relative h-84'>
                                                <Image
                                                    fill
                                                    src={topPost.imageUrl}
                                                    className="mb-4 hover:scale-110 transition-transform object-cover duration-300 hover:cursor-pointer"
                                                    alt={topPost.title}
                                                />
                                            </div>
                                        ) : <div className="sm:h-56 lg:h-64 bg-gray-200 flex items-center justify-center">
                                            <span className="text-gray-500 text-sm">Không có ảnh</span>
                                        </div>
                                        }
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600 mb-1 mt-2">
                                    {new Date(topPost.createdAt).toLocaleDateString("vi-VN")}
                                </div>
                                <ToggleFavoritePost postId={topPost.id} postTitle={topPost.title} slug={topPost.slug} />
                                <div
                                    className="text-gray-600 mb-4 prose max-w-none"
                                    dangerouslySetInnerHTML={{ __html: topPost.description }}
                                />
                                <button
                                    className="bg-yellow-300 text-black px-4 py-2 font-semibold hover:bg-yellow-400 cursor-pointer"
                                    onClick={() => handleDetailClick(topPost.slug)}
                                >
                                    Xem thêm {">"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* All Posts */}
                    <div
                        data-aos="fade-left"
                        data-aos-duration="1000"
                        data-aos-easing="ease-in-out"
                    >
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-bold">Bài viết mới nhất</h2>
                        </div>

                        {posts.map((post) => (
                            <div
                                key={post.id}
                                className="px-3 py-5 mb-3 cursor-pointer hover:bg-yellow-50"
                                onClick={() => {
                                    handleDetailClick(post.slug);
                                }}
                            >
                                <div className="text-sm text-gray-600 mb-1">
                                    {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                                </div>
                                <p className="font-bold text-sm">
                                    <span className="italic">{post.title}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Category */}
                {categories.map((category, idx) => (
                    <div key={idx} className='px-5 mb-10'
                        data-aos="fade-right"
                        data-aos-duration="1000"
                        data-aos-easing="ease-in-out">
                        {/* title */}
                        <div className='flex justify-between items-center mb-5'
                        >
                            <h2 className='text-black sm:text-2xl lg:text-3xl  font-bold'>{category.title}</h2>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => scrollLeft(category.title)}
                                    className="bg-gray-300 w-10 h-10 sm:w-12 sm:h-12 rounded-full justify-center flex items-center pr-1 cursor-pointer hover:bg-gray-400 group focus:bg-black"
                                >
                                    <GoChevronLeft className="text-[30px] text-gray-800 group-focus:invert" />
                                </button>
                                <button
                                    onClick={() => scrollRight(category.title)}
                                    className="bg-gray-300 w-10 h-10 sm:w-12 sm:h-12 rounded-full justify-center flex items-center cursor-pointer hover:bg-gray-400 group focus:bg-black focus:text-white"
                                >
                                    <GoChevronRight className="text-[30px] text-gray-800 group-focus:invert font-thin" />
                                </button>
                            </div>
                        </div>

                        {/* Post list */}
                        <div
                            data-aos="fade-up"
                            data-aos-duration="600"
                            data-aos-easing="ease-in-out"
                            ref={(el) => {
                                if (el) scrollRefs.current[category.title] = el;
                            }}
                            className="overflow-x-auto no-scrollbar cursor-pointer scroll-smooth transition ease-in-out duration-300">
                            <div className="flex w-fit lg:space-x-4 md:space-x-3 sm:space-x-2">
                                {(postsByCategory[category.title] || []).map((post) => (
                                    <div
                                        key={post.id}
                                        className="xl:w-[calc(90vw/3-1rem)] lg:w-[calc(90vw/3-1rem)] md:w-[calc(90vw/2-1rem)] w-[60vw] flex-shrink-0 border border-gray-300 p-2 hover:shadow-lg transition-shadow duration-300"
                                    >
                                        <div className="overflow-hidden">
                                            {post.imageUrl ? (
                                                <div className='relative h-64'>
                                                    <Image
                                                        fill
                                                        src={post.imageUrl}
                                                        className="sm:h-56 lg:h-64 object-cover hover:scale-110 transition-transform duration-300"
                                                        alt={post.title}
                                                        onClick={() => (window.location.href = `${DOAMINWEB}/blogDetail/${post.slug}`)}
                                                    />
                                                </div>
                                            ) : <div className="sm:h-56 h-64 bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-500 text-sm">Không có ảnh</span>
                                            </div>
                                            }
                                        </div>
                                        <ToggleFavoritePost postId={post.id} postTitle={post.title} slug={post.slug} />
                                        <div
                                            className="text-gray-600 text-sm mt-2  line-clamp-2 text-muted"
                                            dangerouslySetInnerHTML={{ __html: post.description }}
                                            onClick={() => (window.location.href = `${DOAMINWEB}/blogDetail/${post.slug}`)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
