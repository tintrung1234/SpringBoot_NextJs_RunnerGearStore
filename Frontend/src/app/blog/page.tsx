
import BlogClientPage from "./BlogClientPage";

interface PostType {
    _id: string;
    title: string;
    category: string;
    imageUrl: string;
    content: string;
    description: string;
    slug: string;
    createdAt: Date
}

interface Category {
    _id: string;
    title: string;
}

async function BlogPage() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const [postsRes, topPostRes, categoriesRes] = await Promise.all([
        fetch(`${DOMAIN}/api/posts/newest`, { cache: "no-store" }),
        fetch(`${DOMAIN}/api/posts/top1`, { cache: "no-store" }),
        fetch(`${DOMAIN}/api/categories`, { cache: "no-store" }),
    ]);

    const posts: PostType[] = await postsRes.json();
    const topPost: PostType = await topPostRes.json();
    const categories: Category[] = await categoriesRes.json();

    // Fetch posts by category
    const postsByCategory: { [key: string]: PostType[] } = {};
    await Promise.all(
        categories.map(async (cat) => {
            const res = await fetch(
                `${DOMAIN}/api/posts/category/${encodeURIComponent(cat.title)}`,
                { cache: "no-store" }
            );
            const data = await res.json();
            postsByCategory[cat.title] = Array.isArray(data) ? data : [];
        })
    );

    return (
        <BlogClientPage
            posts={posts}
            topPost={topPost}
            categories={categories}
            postsByCategory={postsByCategory}
        />
    );
}

export default BlogPage;
