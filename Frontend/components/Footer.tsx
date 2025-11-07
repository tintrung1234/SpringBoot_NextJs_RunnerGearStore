import './Footer.css'
import ic_email from '../public/assets/img/ic_email.png'
import ic_location from '../public/assets/img/ic_location.png'
import ic_fb from '../public/assets/img/ic_fb.png'
import ic_tw from '../public/assets/img/ic_tw.png'
import ic_ig from '../public/assets/img/ic_ig.png'
import ic_yt from '../public/assets/img/ic_yt.png'
import Link from 'next/link'
import Image from 'next/image'

interface info {
    email: string;
    phoneNumber: number;
}

export default async function Footer() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const images = [ic_fb, ic_tw, ic_ig, ic_yt]
 
    let info: info | null = null;
    try {
        const res = await fetch(`${DOMAIN}/api/information`);
        const infoData = await res.json();
        if (infoData && infoData.length > 0) {
            info = infoData[0]
        }
    } catch (err) {
        console.error(err);
    }

    return (
        <footer className="w-full footer bg-gray-900 text-white p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-0">DealHawk</h1>
                <nav className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                    <Link className="text-xs sm:text-sm lg:text-base cursor-pointer hover:underline" href="/">Trang chủ</Link>
                    <Link className="text-xs sm:text-sm lg:text-base cursor-pointer hover:underline" href="/blbog">Blog</Link>
                    <Link className="text-xs sm:text-sm lg:text-base cursor-pointer hover:underline" href="/about">Giới thiệu</Link>
                    <Link className="text-xs sm:text-sm lg:text-base cursor-pointer hover:underline" href="/terms">Chính sách</Link>
                </nav>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8">
                <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">Khám phá thêm các đường dẫn</h3>
                    <div className="grid gap-2">
                        <Link className="text-xs sm:text-sm lg:text-base cursor-pointer hover:underline" href="login">Tạp tài khoảng</Link>
                        <Link className="text-xs sm:text-sm lg:text-base cursor-pointer hover:underline" href="login">Đăng nhập</Link>
                        <Link className="text-xs sm:text-sm lg:text-base cursor-pointer hover:underline" href="danhmuc">Tất cả danh mục</Link>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">Danh mục</h3>
                    <div className="grid gap-2">
                        <Link className="text-xs sm:text-sm lg:text-base cursor-pointer hover:underline" href="#">Đồ gia dụng</Link>
                        <Link className="text-xs sm:text-sm lg:text-base cursor-pointer hover:underline" href="#">Giày dép</Link>
                        <Link className="text-xs sm:text-sm lg:text-base cursor-pointer hover:underline" href="#">Quần áo</Link>
                        <Link className="text-xs sm:text-sm lg:text-base cursor-pointer hover:underline" href="#">Đồ điện tử</Link>
                    </div>
                </div>
                <div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-4">Thông tin liên hệ</h3>
                    <div className="grid gap-4">
                        <div className="flex items-center">
                            <Image src={ic_email} className="w-5 h-4 sm:w-6 sm:h-5 mr-2" alt="Email" />
                            <span className="text-xs sm:text-sm lg:text-base">{info?.email}</span>
                        </div>
                        <div className="flex items-center">
                            <Image src={ic_location} className="w-5 h-6 sm:w-6 sm:h-7 mr-2" alt="Location" />
                            <span className="text-xs sm:text-sm lg:text-base">{info?.phoneNumber}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-start sm:justify-end">
                <div className="flex space-x-3">
                    {images.map((img, idx) => (
                        <a key={idx} href="#" className="w-8 h-8 sm:w-10 sm:h-10 social-link bg-gray-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-600 transition">
                            <Image src={img} className="w-4 h-4 sm:w-5 sm:h-5" alt="Social icon" />
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    )
}