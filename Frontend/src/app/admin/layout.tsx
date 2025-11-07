'use client'
import Sidebar from "./Admin_components/sideBar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <div className="flex bg-gray-100 text-black min-h-screen mt-14">
                    <Sidebar />
                    <main className="flex-1 p-6 overflow-y-auto">
                        {children}
                    </main>
                </div>  
            </body>
        </html>
    );
}
