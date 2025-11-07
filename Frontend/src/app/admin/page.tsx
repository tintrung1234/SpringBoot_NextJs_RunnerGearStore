'use client';
import React, { useEffect, useState } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import type { ChartData } from 'chart.js';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Khai báo kiểu riêng cho line và bar
type LineChartData = ChartData<"line">;
type BarChartData = ChartData<"bar">;

export default function Admin_Home() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const [overview, setOverview] = useState({ postCount: 0, categoryCount: 0, viewsLast7Days: 0 });

    // ✅ dùng đúng kiểu dữ liệu
    const [lineData, setLineData] = useState<LineChartData>({
        labels: [],
        datasets: []
    });
    const [barData, setBarData] = useState<BarChartData>({
        labels: [],
        datasets: []
    });

    ChartJS.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        BarElement,
        Title,
        Tooltip,
        Legend
    );


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        Promise.all([
            axios.get(`${DOMAIN}/api/admin-dasboard/overview`),
            axios.get(`${DOMAIN}/api/admin-dasboard/views-per-day`),
            axios.get(`${DOMAIN}/api/admin-dasboard/views-per-category`)
        ])

            .then(([resOverview, resPerDay, resPerCat]) => {
                setOverview(resOverview.data);

                setLineData({
                    labels: resPerDay.data.labels,
                    datasets: [
                        {
                            label: "Lượt xem",
                            data: resPerDay.data.data,
                            borderColor: 'green',
                            backgroundColor: 'rgba(0,128,0,0.3)',
                            fill: true,
                            tension: 0.3
                        }
                    ]
                });

                setBarData({
                    labels: resPerCat.data.labels,
                    datasets: [
                        {
                            label: "Lượt xem",
                            data: resPerCat.data.data,
                            backgroundColor: 'orange'
                        }
                    ]
                });
            })
            .catch(err => {
                console.error(err);
                toast.error("Không thể tải dữ liệu thống kê");
            });
    }, []);

    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto text-black mb-14 mt-5">
            <ToastContainer />
            <h1 className="text-2xl font-bold text-center">Thống kê</h1>
            <div className="grid grid-cols-2 text-center border rounded p-4">
                <div className='border-b pb-2 border-r'>
                    <p className="font-bold">Số lượng bài viết</p>
                    <h2 className="text-xl">{overview.postCount}</h2>
                </div>
                <div className="pb-2 row-span-2 flex-col items-center justify-center my-auto">
                    <p className="font-bold">Lượt xem bài viết (1 tuần)</p>
                    <h2 className="text-xl">{overview.viewsLast7Days}</h2>
                </div>
                <div className='pt-2 border-r'>
                    <p className="font-bold">Số lượng danh mục</p>
                    <h2 className="text-xl">{overview.categoryCount}</h2>
                </div>
            </div>
            <div>
                <p className="font-bold">Lượng truy cập trang trong 7 ngày</p>
                <Line data={lineData} />
            </div>
            <div>
                <p className="font-bold">Lượt xem theo danh mục trong 7 ngày</p>
                <Bar data={barData} />
            </div>
        </div>
    );
}
