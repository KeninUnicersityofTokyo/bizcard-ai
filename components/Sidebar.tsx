"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder as FolderIcon, Plus, Trash2, Menu, X, Inbox } from "lucide-react";
import { Folder } from "@/types";
import { getFolders, createFolder, deleteFolder } from "@/lib/storage";

export default function Sidebar() {
    const pathname = usePathname();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        setFolders(getFolders());
    }, []);

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;
        const newFolder = createFolder(newFolderName);
        setFolders([...folders, newFolder]);
        setNewFolderName("");
        setIsCreating(false);
    };

    const handleDeleteFolder = (id: string) => {
        if (confirm("フォルダを削除しますか？中の連絡先はInboxに移動します。")) {
            deleteFolder(id);
            setFolders(folders.filter((f) => f.id !== id));
        }
    };

    const NavItem = ({ href, icon: Icon, label, active, onDelete }: any) => (
        <Link
            href={href}
            className={`flex items-center justify-between p-3 rounded-lg mb-1 transition-colors ${active
                ? "bg-blue-50 text-blue-600 font-bold"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            onClick={() => setIsMobileOpen(false)}
        >
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <span className="font-medium">{label}</span>
            </div>
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1 hover:bg-red-50 hover:text-red-600 rounded transition-colors"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            )}
        </Link>
    );

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsMobileOpen(!isMobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg text-slate-600 border border-slate-200 shadow-sm"
            >
                {isMobileOpen ? <X /> : <Menu />}
            </button>

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 ${isMobileOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-6">
                    <h1 className="text-xl font-bold text-blue-600 mb-8 flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                            <Inbox className="w-5 h-5" />
                        </div>
                        BizCard AI
                    </h1>

                    <nav>
                        <NavItem
                            href="/"
                            icon={Inbox}
                            label="Inbox"
                            active={pathname === "/" || pathname.startsWith("/folder/inbox")}
                        />

                        <div className="mt-8 mb-2 flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                Folders
                            </span>
                            <button
                                onClick={() => setIsCreating(true)}
                                className="text-slate-400 hover:text-blue-600 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {isCreating && (
                            <form onSubmit={handleCreateFolder} className="mb-2 px-2">
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="フォルダ名"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    onBlur={() => !newFolderName && setIsCreating(false)}
                                    className="w-full p-2 bg-white border border-slate-200 rounded text-sm text-slate-800 focus:border-blue-500 outline-none"
                                />
                            </form>
                        )}

                        {folders.map((folder) => (
                            <NavItem
                                key={folder.id}
                                href={`/?folderId=${folder.id}`}
                                icon={FolderIcon}
                                label={folder.name}
                                active={pathname.includes(`folderId=${folder.id}`)}
                                onDelete={() => handleDeleteFolder(folder.id)}
                            />
                        ))}
                    </nav>
                </div>
            </aside>
        </>
    );
}
