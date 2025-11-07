'use client'

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import UserForm from "../Admin_components/Admin_EditUser";
import Cookies from "js-cookie";

export default function Admin_UseEditUser() {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;

    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const token = Cookies.get("token");
            const res = await axios.get(`${DOMAIN}/api/user`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(Array.isArray(res.data) ? res.data : res.data.users || []);
        } catch (err) {
            toast.error("Không thể tải user");
            console.error("Lỗi tải users:", err);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <UserForm users={users} fetchUsers={fetchUsers} />
    );
}
