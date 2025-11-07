import Image from "next/image";
import ProductRelate from "./productRelate";
import PostRelate from "./postRelate";
import type { Metadata } from "next";
import ToggleFavoritePostDetail from "../../../../components/toggleFavoritePostDetail";
import IncreaseViewOnClient from "../../../../components/increaseViews";

const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;
const WEBDOMAIN = process.env.NEXT_PUBLIC_URLWEBSITE;

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
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  metaURL: string
}

// Define the props type for the page
type PageProps = {
  params: Promise<{ slug: string }>; // Use Promise for params
};

// Metadata generation function
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params; // Await the params Promise to get the id

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_HOSTDOMAIN}/api/posts/detail/${slug}`,
    {
      cache: "no-store",
    }
  );


  if (!res.ok) {
    return {
      title: "Bài viết không tồn tại",
    };
  }

  const post = await res.json();

  // const postUrl = `${process.env.NEXT_PUBLIC_URLWEBSITE}/blogDetail/${slug}`;
  // const postDescription = post.description?.replace(/<[^>]+>/g, "").slice(0, 160);

  const DOAMINWEB = process.env.NEXT_PUBLIC_URLWEBSITE;
  const fullSlug = `${DOAMINWEB}/blogDetail/${post.slug}`

  return {
    title: post.title,
    description: post.description?.slice(0, 160),
    keywords: post.metaKeywords,
    openGraph: {
      title: post.metaTitle,
      description: post.metaDescription,
      url: fullSlug,
      type: "article",
      siteName: "Tên trang web của bạn",
      images: post.imageUrl
        ? [{ url: `${post.imageUrl}`, width: 1200, height: 630, alt: post.title }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description?.slice(0, 160),
      images: post.imageUrl ? [post.imageUrl] : [],
    },
  };
}

// Page component
export default async function BlogDetail({ params }: PageProps) {
  const { slug } = await params; // Await the params Promise to get the slug

  //api get detail
  const postRes = await fetch(
    `${DOMAIN}/api/posts/detail/${slug}`,
    {
      cache: "no-store",
    }
  );
  const post: PostType = await postRes.json();


  return (
    <>
      <div className="mt-22">
        <div className="lg:flex mb-5 lg:px-28 px-5">
          {/* Blog Detail */}
          <div className="lg:w-4/5 sm:w-full lg:border-r border-gray-300 mb-3">
            <div className="w-full mx-auto">
              <div className="lg:mr-5 justify-center px-5 py-4 bg-purple border border-black shadow-md">
                {/* Tác giả */}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-gray-500 text-xs">
                    Đăng ngày {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                  </p>
                  <div className="flex items-center">
                    <h1 className="text-gray-500 text-xs mr-1">
                      Lượt xem: {post.views || 0} |
                    </h1>
                    <ToggleFavoritePostDetail postId={post._id} />
                  </div>
                </div>

                {/* Tiêu đề bài viết */}
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight text-gray-900">
                  {post.title}
                </h1>

                {/* Tag category */}
                <div className="mt-3 text-gray-700 font-medium flex items-center space-x-1">
                  <span role="img" aria-label="emoji">
                    🎯
                  </span>
                  <span>{post.category}</span>
                </div>

                {/* Nội dung HTML từ Editor */}
                <div
                  className="text-gray-800 leading-relaxed text-[15px] space-y-4 mt-2"
                  dangerouslySetInnerHTML={{
                    __html: post?.description && typeof post.description === "string"
                      ? post.description
                      : "",
                  }}
                />

                {post.imageUrl && (
                  <div className="flex justify-center">
                    <div className="my-5 lg:w-[50vw] w-[80vw] md:h-[60vh] sm:h-[30vh] h-[30vh] relative">
                      <Image
                        src={post.imageUrl}
                        alt="Blog Illustration"
                        className="rounded-md object-cover w-full h-full"
                        style={{ objectFit: "contain" }} // hoặc "contain" nếu muốn giữ nguyên tỷ lệ và không crop
                        fill
                        sizes="(max-width: 768px) 100vw, lg:60vw 30vw"
                      />
                    </div>
                  </div>
                )}

                {/* Nội dung HTML từ Editor */}
                <div
                  className="text-gray-800 leading-relaxed text-[15px] space-y-4 mt-2"
                  dangerouslySetInnerHTML={{
                    __html: post?.content && typeof post.content === "string"
                      ? post.content
                      : "",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Product with Category */}
          <ProductRelate categoryName={post.category} />
        </div>

        {/* Post relate */}
        <PostRelate categoryName={post.category} />
      </div>
      <IncreaseViewOnClient slug={slug} />
    </>
  );
}