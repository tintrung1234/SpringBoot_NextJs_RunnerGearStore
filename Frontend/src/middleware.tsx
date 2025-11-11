import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const userCookie = request.cookies.get("user")?.value;
    const decodedUser = userCookie ? decodeURIComponent(userCookie) : null;
    const userData = decodedUser ? JSON.parse(decodedUser) : null;
    // console.log("user:" ,userData)
    // Nếu không có token hoặc user cookie => redirect login
    if (!token || !userData) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        // Decode token để kiểm tra hết hạn
        const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
        );
        const isExpired = payload.exp * 1000 < Date.now();

        if (isExpired) {
            const res = NextResponse.redirect(new URL("/login", request.url));
            res.cookies.delete("token");
            res.cookies.delete("user");
            return res;
        }

        // Parse user từ cookie (an toàn vì đã check ở trên)
        const user = userData as { role: string };

        // Kiểm tra quyền admin
        if (user.role !== "Admin") {
            return NextResponse.redirect(new URL("/", request.url));
        }

        return NextResponse.next();
    } catch (e) {
        console.log(e)
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/admin/:path*"],
}
