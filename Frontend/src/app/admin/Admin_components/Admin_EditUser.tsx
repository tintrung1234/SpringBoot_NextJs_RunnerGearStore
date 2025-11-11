// Admin_EditUser.js
import { useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Cookies from "js-cookie";

type User = {
    _id: string;
    email: string;
    username: string;
    role: string;
    favoritesProduct?: string[];
    favoritesPost?: string[];
};

interface UserFormProps {
    users?: User[];
    fetchUsers: () => void;
}

export default function UserForm({ users = [], fetchUsers }: UserFormProps) {
    const DOMAIN = process.env.NEXT_PUBLIC_HOSTDOMAIN;
    const [isEdit, setIsEdit] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        role: '',
        favoritesProduct: [] as string[],
        favoritesPost: [] as string[],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({ email: '', username: '', password: '', role: '', favoritesProduct: [], favoritesPost: [] });
        setIsEdit(false);
        setSelectedUserId(null);
    };

    const handleSubmit = async () => {
        const toastId = toast.loading(isEdit ? "Đang cập nhật user..." : "Đang tạo user...");
        const token = Cookies.get("token");

        try {
            if (isEdit && selectedUserId) {
                await axios.put(`${DOMAIN}/api/users/update`, {
                    ...formData,
                    _id: selectedUserId,
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Cập nhật user thành công!");
            } else {
                await axios.post(`${DOMAIN}/api/users/register`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Tạo user thành công!");
            }

            toast.dismiss(toastId);
            fetchUsers();
            resetForm();
        } catch (err) {
            toast.dismiss(toastId);
            if (axios.isAxiosError(err)) {
                toast.error("Lỗi: " + (err.response?.data?.message || err.message));
            } else if (err instanceof Error) {
                toast.error("Lỗi: " + err.message);
            } else {
                toast.error("Đã xảy ra lỗi không xác định.");
            }
        }
    };


    const handleEditClick = (user: User) => {
        setIsEdit(true);
        setSelectedUserId(user._id);
        setFormData({
            email: user.email,
            username: user.username,
            password: '',
            role: user.role,
            favoritesProduct: user.favoritesProduct || [],
            favoritesPost: user.favoritesPost || [],
        });
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Bạn có chắc muốn xoá user này?")) return;
        const toastId = toast.loading("Đang xoá user...");
        const token = Cookies.get("token");

        try {
            await axios.delete(`${DOMAIN}/api/user/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Xoá user thành công!");
            fetchUsers();
        } catch (err) {
            toast.error("Lỗi khi xoá user.");
            console.error(err);
        } finally {
            toast.dismiss(toastId);
        }
    };

    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4">
            <ToastContainer />
            <h2 className="text-xl font-bold mb-4">{isEdit ? 'Chỉnh sửa User' : 'Tạo User mới'}</h2>
            <div className="space-y-2">
                <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="border p-2 w-full" />
                <input name="username" placeholder="Username" value={formData.username} onChange={handleChange} className="border p-2 w-full" />
                {!isEdit && <input name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} className="border p-2 w-full" />}
                <select name="role" value={formData.role} onChange={handleChange} className="border p-2 cursor-pointer w-full">
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                </select>
                <button onClick={handleSubmit} className="bg-blue-500 font-bold cursor-pointer text-white px-4 py-2 rounded">
                    {isEdit ? 'Cập nhật' : 'Tạo mới'}
                </button>
                {isEdit && <button onClick={resetForm} className="ml-2 text-sm font-bold cursor-pointer text-red-500">Huỷ</button>}
            </div>

            <hr className="my-6" />
            <h2 className="text-lg font-bold mb-2">Danh sách Users</h2>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Tìm user theo email hoặc username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 w-full md:w-1/2"
                />
            </div>
            <table className="w-full border">
                <thead>
                    <tr className="bg-gray-200">
                        <th className="border px-2 py-1">Email</th>
                        <th className="border px-2 py-1">Username</th>
                        <th className="border px-2 py-1">Role</th>
                        <th className="border px-2 py-1">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map(user => (
                        <tr key={user._id}>
                            <td className="border px-2 py-1">{user.email}</td>
                            <td className="border px-2 py-1">{user.username}</td>
                            <td className="border px-2 py-1 text-center">{user.role}</td>
                            <td className="border px-2 py-1 space-x-5 text-center font-bold">
                                <button onClick={() => handleEditClick(user)} className="text-blue-600 cursor-pointer">Sửa</button>
                                <button onClick={() => handleDelete(user._id)} className="text-red-600 cursor-pointer">Xoá</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
