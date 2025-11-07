import React from 'react'
import retange from '../../../public/assets/img/retange.png'
import ic_contact from '../../../public/assets/img/ic_contact.png'
import Breadcrumb from '../../../components/BreadCrumb';
import Image from 'next/image';

export default function About() {
    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6 text-black mt-16">
        <div className='mb-8'>
            <Breadcrumb />
        </div>
            <div className='w-full flex justify-center'>
                <h1 className='text-[28px] text-black justify-center mb-3 font-bold text-shadow-lg'>Giới thiệu về chúng tôi</h1>
            </div>

            {/* Slogan */}
            <div className='flex text-[30px] font-bold text-black items-center mt-5 text-base/6'>
                <h1 className='mr-4 text-red-500'>Best</h1>
                <h1>Deals,</h1>
            </div>
            <div className='flex text-[30px] font-bold text-black items-center -translate-y-1/5 text-base/6'>
                <h1 className='mr-4 text-gray-400'>Zero</h1>
                <h1>Stress</h1>
            </div>
            <p className='text-black font-bold -translate-y-1/2 tracking-wide'>Bạn chỉ cần mua sắm – việc tìm deal đã có chúng tôi lo</p>
            <hr className="h-px w-[45vw] bg-gray-200 border-0 dark:bg-gray-700 mb-12"></hr>

            <div>
                <p className="font-semibold">Chào bạn!</p>
                <p>
                    Chúng tôi là một nhóm đam mê săn sale, luôn nỗ lực mỗi ngày để tổng
                    hợp những ưu đãi tốt nhất, khuyến mãi thật sự, và giảm giá đáng tin cậy
                    từ các nền tảng như Shopee, Lazada, Tiki,... giúp bạn tiết kiệm thời gian
                    và chi phí khi mua sắm online.
                </p>
            </div>
            <div className="border rounded p-4 space-y-2 rounded-[1vw] mb-14">
                <p className="font-bold">Tại sao bạn nên chọn chúng tôi?</p>
                <ul className="list-disc list-inside space-y-1">
                    <li>Không còn lạc trong rừng khuyến mãi ảo — chúng tôi kiểm tra kỹ giá gốc để đảm bảo bạn thấy được deal thật sự, không chiêu trò!</li>
                    <li>Cập nhật mỗi ngày — tự động chọn ra những sản phẩm đáng chú ý nhất trong hàng ngàn ưu đãi trên mạng.</li>
                    <li>Hoàn toàn miễn phí — bạn không mất gì cả, chỉ cần click vào link kết nối, chúng tôi sẽ nhận được chút hoa hồng để duy trì website.</li>
                </ul>
            </div>
            <div className="">

                <div className="flex items-center space-x-2 mb-2 relative">
                    <Image src={retange} alt={''}></Image>
                    <p className="font-bold absolute ml-10 text-white text-lg">Sứ mệnh của chúng tôi</p>
                </div>
                <p className='mb-12'>Giúp bạn tiết kiệm tiền, tiết kiệm thời gian và mua được sản phẩm tốt nhất — không phải lo lắng về việc kiểm tra từng shop, từng trang, từng chương trình.</p>
            </div>

            <div className='mb-14'>
                <div className='flex items-center mb-1'>
                    <Image src={ic_contact} className="w-8 h-8 mb-2" alt={''}></Image>
                    <p className="font-bold">Liên hệ</p>
                </div>
                <p className='font-bold'>Bạn có câu hỏi, góp ý hay muốn hợp tác?</p>
                <p>📧 Email: your@email.com</p>
                <p>🌐Fanpage: <a href="https://facebook.com/yourpage" className="text-blue-600">facebook.com/yourpage</a></p>
            </div>
        </div>
    );
}

