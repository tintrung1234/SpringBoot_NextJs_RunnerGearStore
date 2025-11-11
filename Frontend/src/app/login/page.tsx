'use client'

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import ic_google from "../../../public/assets/img/ic_google.png"
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';

const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

export default function Login() {
    const router = useRouter();

    const [isRegistering, setIsRegistering] = useState(false);

    const [registerForm, setRegisterForm] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    });

    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    };

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    };

    const handleRegister = async () => {
        const toastId = toast.loading("Đang đăng ký...");

        if (!registerForm.email || !registerForm.username || !registerForm.password) {
            toast.dismiss(toastId);
            return toast.error("Vui lòng nhập đầy đủ thông tin.");
        }

        if (registerForm.password !== registerForm.confirmPassword) {
            toast.dismiss(toastId);
            return toast.error("Mật khẩu không khớp!");
        }

        try {
            await axios.post(`${DOMAIN}/api/users/register`, {
                email: registerForm.email,
                username: registerForm.username,
                password: registerForm.password,
            });

            toast.dismiss(toastId);
            toast.success("Đăng ký thành công! Hãy đăng nhập.");
            setIsRegistering(false);
        } catch (err: unknown) {
            toast.dismiss(toastId);
            if (axios.isAxiosError(err)) {
                toast.error("Đăng ký thất bại: " + (err.response?.data?.message || err.message));
            } else if (err instanceof Error) {
                toast.error("Đăng ký thất bại: " + err.message);
            } else {
                toast.error("Đăng ký thất bại: Đã xảy ra lỗi không xác định.");
            }
        }
    };

    const handleLogin = async () => {
        const toastId = toast.loading("Đang đăng nhập...");

        if (!loginForm.email || !loginForm.password) {
            toast.dismiss(toastId);
            return toast.error("Vui lòng nhập email và mật khẩu.");
        }

        try {
            const res = await axios.post(`${DOMAIN}/api/users/login`, {
                email: loginForm.email,
                password: loginForm.password,
            });

            console.log("Login response data:", res.data);

            const user = res.data.user;
            const token = res.data.token;

            // Đơn giản hóa - chỉ set expires
            Cookies.set("token", token, { expires: 1 });
            Cookies.set("user", JSON.stringify(user), { expires: 1 });

            // Debug: Kiểm tra xem đã lưu chưa
            console.log("Token saved:", Cookies.get("token"));
            console.log("User saved:", Cookies.get("user"));
            console.log("All cookies:", document.cookie);

            toast.dismiss(toastId);
            toast.success("Đăng nhập thành công!");

            setTimeout(() => {
                if (user.role === "Admin") {
                    router.push("/admin");
                } else {
                    router.push("/taikhoan");
                }
            }, 500);
        } catch (err: unknown) {
            toast.dismiss(toastId);
            if (axios.isAxiosError(err)) {
                toast.error("Đăng nhập thất bại: " + (err.response?.data?.message || err.message));
            } else if (err instanceof Error) {
                toast.error("Đăng nhập thất bại: " + err.message);
            } else {
                toast.error("Đăng nhập thất bại: Đã xảy ra lỗi không xác định.");
            }
        }
    };

    return (
        <>
            <ToastContainer />
            <div className='mt-24 px-4 sm:px-6 mb-14 flex flex-col justify-center items-center w-full'>
                <div className='flex flex-col md:flex-row justify-center items-start w-full max-w-4xl space-y-8 md:space-y-0 md:space-x-8'>

                    {/* Register Box */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault(); // prevent page reload
                            handleRegister();      // trigger your login function
                        }}
                        className='w-full md:w-1/2 p-5 registerBox-color'
                    >
                        <div className='w-full flex justify-center'>
                            <h1 className='text-[24px] justify-center mb-3 font-bold'>Đăng ký</h1>
                        </div>

                        <h3 className='text-[14px] font-bold'>Họ và tên</h3>
                        <input
                            type='text'
                            name='username'
                            value={registerForm.username}
                            onChange={handleRegisterChange}
                            className='w-full focus-within:outline-3 focus-within:outline-solid outline-none bg-white text-black font-bold placeholder-gray-400 text-[12px] p-2 mt-2 mb-4 pr-10'
                        />

                        <h3 className='text-[14px] font-bold'>Email</h3>
                        <input
                            type='email'
                            name="email"
                            value={registerForm.email}
                            onChange={handleRegisterChange}
                            className='w-full focus-within:outline-3 focus-within:outline-solid outline-none bg-white text-black font-bold placeholder-gray-400 text-[12px] p-2 mt-2 mb-4 pr-10'
                        />

                        <h3 className='text-[14px] font-bold'>Mật khẩu</h3>
                        <div className='relative'>
                            <input
                                name="password"
                                value={registerForm.password}
                                onChange={handleRegisterChange}
                                type={showPassword ? 'text' : 'password'}
                                className='w-full  focus-within:outline-3 focus-within:outline-solid outline-none bg-white text-black font-bold placeholder-gray-400 text-[12px] p-2 mt-2 mb-4 pr-10'
                            />
                            <span
                                className='absolute right-3 top-[18px] cursor-pointer'
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <Eye className='text-black' size={18} /> : <EyeOff className='text-black' size={18} />}
                            </span>
                        </div>
                        <h3 className='text-[14px] font-bold'>Nhập lại mật khẩu</h3>
                        <div className='relative'>
                            <input
                                name="confirmPassword"
                                value={registerForm.confirmPassword}
                                onChange={handleRegisterChange}
                                type={showConfirmPassword ? 'text' : 'password'}
                                className='w-full  focus-within:outline-3 focus-within:outline-solid outline-none bg-white text-black font-bold placeholder-gray-400 text-[12px] p-2 mt-2 mb-4 pr-10'
                            />
                            <span
                                className='absolute right-3 top-[18px] cursor-pointer'
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? <Eye className='text-black' size={18} /> : <EyeOff className='text-black' size={18} />}
                            </span>
                        </div>

                        <div className='w-full flex justify-center mt-5'>
                            <button
                                className="p-3 send-button text-black rounded-lg cursor-pointer mb-1 transition-colors duration-300 w-30"
                                type='submit'>
                                <h3 className="font-bold text-[12px]">Gửi</h3>
                            </button>
                        </div>
                    </form>

                    {/* Login Box */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault(); // prevent page reload
                            handleLogin();      // trigger your login function
                        }}
                        className='w-full md:w-1/2 p-5 text-black rounded-lg'
                    >
                        <div className='w-full flex justify-center'>
                            <h1 className='text-[24px] justify-center mb-3 font-bold'>Đăng nhập</h1>
                        </div>
                        <div className='w-full flex justify-center'>
                            <h3 className='text-[14px] font-bold mb-4 p-5 text-justify'>Nếu bạn chưa có tài khoản, vui lòng đăng ký để tạo tài khoản</h3>
                        </div>

                        <h3 className='text-[14px] font-bold'>Email</h3>
                        <input
                            name="email"
                            value={loginForm.email}
                            onChange={handleLoginChange}
                            type='email'
                            className='w-full focus:outline-3 focus-within:outline-2 outline outline-solid bg-white text-black font-bold placeholder-gray-400 text-[12px] p-2 mt-2 mb-4'
                        />

                        <h3 className='text-[14px] font-bold'>Mật khẩu</h3>
                        <div className='relative'>
                            <input
                                name="password"
                                value={loginForm.password}
                                onChange={handleLoginChange}
                                type={showPassword2 ? 'text' : 'password'}
                                className='w-full focus:outline-3 focus-within:outline-2 outline outline-solid bg-white text-black font-bold placeholder-gray-400 text-[12px] p-2 mt-2 mb-4'
                            />
                            <span
                                className='absolute right-3 top-[18px] cursor-pointer'
                                onClick={() => setShowPassword2(!showPassword2)}
                            >
                                {showPassword2 ? <Eye className='text-black' size={18} /> : <EyeOff className='text-black' size={18} />}
                            </span>
                        </div>

                        <h3 className='text-[14px] cursor-pointer font-light'>Quên mật khẩu</h3>

                        <div className='w-full flex justify-center mt-5'>
                            <button
                                className="p-3 send-button text-black rounded-lg transition-colors duration-300 w-30 cursor-pointer"
                                type='submit'>
                                <h3 className="font-bold text-[12px]">Gửi</h3>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Login with Google */}
                <div className='w-full flex justify-center items-center mt-8 space-x-3'>
                    <h3 className='text-[14px] text-black font-bold'>Hoặc</h3>
                    <button className='bg-gray-100 hover:bg-gray-200 transition-colors duration-300 px-4 py-2 flex items-center rounded-xl cursor-pointer'>
                        <Image src={ic_google} className='w-7 h-7 mr-3' alt="google" />
                        <h3 className='text-[14px] text-black font-bold'>Đăng nhập bằng Google</h3>
                    </button>
                </div>
            </div>
        </>
    );
}
