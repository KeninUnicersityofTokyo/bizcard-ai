"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Building, User, Calendar, Trash2, Send, Folder as FolderIcon } from "lucide-react";
import { Contact, Folder } from "@/types";
import { getContacts, deleteContact, updateContact, getFolders } from "@/lib/storage";

export default function ContactDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [contact, setContact] = useState<Contact | null>(null);
    const [folders, setFolders] = useState<Folder[]>([]);

    useEffect(() => {
        const contacts = getContacts();
        const found = contacts.find((c) => c.id === params.id);
        if (found) {
            setContact(found);
        } else {
            router.push("/");
        }
        setFolders(getFolders());
    }, [params.id, router]);

    const handleDelete = () => {
        if (confirm("この連絡先を削除しますか？")) {
            deleteContact(params.id);
            router.push("/");
        }
    };

    const handleMoveFolder = (folderId: string) => {
        updateContact(params.id, { folderId });
        setContact((prev: Contact | null) => prev ? { ...prev, folderId } : null);
    };

    const handleOpenMailer = () => {
        if (!contact) return;
        const subject = encodeURIComponent(contact.generatedEmail.subject);
        const body = encodeURIComponent(contact.generatedEmail.body);
        window.location.href = `mailto:${contact.email}?subject=${subject}&body=${body}`;
    };

    if (!contact) return <div className="p-8 text-center text-slate-500">Loading...</div>;

    const currentFolder = folders.find(f => f.id === contact.folderId)?.name || "Inbox";

    return (
        <div className="max-w-3xl mx-auto">
            <header className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-400" />
                    </Link>
                    <h1 className="text-2xl font-bold text-slate-100">{contact.name}</h1>
                </div>
                <button
                    onClick={handleDelete}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </header>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Info */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
                        <div className="flex items-center gap-3 text-slate-300">
                            <Building className="w-5 h-5 text-slate-500" />
                            <span className="font-medium">{contact.company}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <Mail className="w-5 h-5 text-slate-500" />
                            <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(contact.createdAt).toLocaleString()}</span>
                        </div>

                        <div className="pt-4 border-t border-slate-700">
                            <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                                <FolderIcon className="w-4 h-4" />
                                <span>フォルダ: {currentFolder}</span>
                            </div>
                            <select
                                value={contact.folderId}
                                onChange={(e) => handleMoveFolder(e.target.value)}
                                className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-200 text-sm"
                            >
                                <option value="inbox">Inbox</option>
                                {folders.map((f) => (
                                    <option key={f.id} value={f.id}>
                                        {f.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="font-bold text-slate-200 mb-4 flex items-center gap-2">
                            <Send className="w-5 h-5 text-blue-400" />
                            生成されたメール
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">件名</label>
                                <div className="p-3 bg-slate-900 rounded-lg text-slate-200 text-sm">
                                    {contact.generatedEmail.subject}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-1">本文</label>
                                <div className="p-3 bg-slate-900 rounded-lg text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                                    {contact.generatedEmail.body}
                                </div>
                            </div>
                            <button
                                onClick={handleOpenMailer}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                            >
                                <Send className="w-5 h-5" />
                                メーラー起動
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info (Image & Context) */}
                <div className="space-y-6">
                    {contact.imageBase64 && (
                        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                            <img
                                src={contact.imageBase64}
                                alt="Business Card"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    )}

                    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                        <h3 className="font-bold text-slate-200 mb-3 text-sm">会話メモ</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {contact.context}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
