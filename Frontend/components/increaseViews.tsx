"use client";

import { useEffect } from "react";

export default function IncreaseViewOnClient({ slug }: { slug: string }) {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    useEffect(() => {
        const lastViewTime = `viewed_${slug}`;
        const lastViewed = localStorage.getItem(lastViewTime);
        const now = Date.now();

        if (!lastViewed || now - parseInt(lastViewed) > 60 * 60 * 1000) {
            // Chưa xem hoặc đã quá 1 giờ => tăng views
            fetch(`${DOMAIN}/api/posts/increase-views/${slug}`, {
                method: "PUT",
            }).catch((err) => console.error("Lỗi tăng views:", err));

            // Lưu thời gian đã xem
            localStorage.setItem(lastViewTime, now.toString());
        }
    }, [slug, DOMAIN]);

    return null; // Không render gì ra UI
}
