import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "BizCard Instant Reply",
    description: "Generate instant reply emails from business cards.",
};

import Sidebar from "@/components/Sidebar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="flex min-h-screen bg-slate-950 text-slate-50">
                    <Sidebar />
                    <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-16 lg:pt-8">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
