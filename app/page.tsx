"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Plus, Search, Mail, User, Building, Loader2 } from "lucide-react";
import { Contact } from "@/types";
import { getContacts, getContactsByFolder } from "@/lib/storage";

function DashboardContent() {
    const searchParams = useSearchParams();
    const folderId = searchParams.get("folderId");
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (folderId) {
            setContacts(getContactsByFolder(folderId));
        } else {
            setContacts(getContacts());
        }
    }, [folderId]);

    const filteredContacts = contacts.filter(
        (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <header className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-slate-100">
                    {folderId ? "Folder View" : "Inbox"}
                </h1>
                <Link
                    href="/new"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold transition-colors shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-5 h-5" />
                    新規作成
                </Link>
            </header>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="名前や会社名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>

            {/* Contact List */}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredContacts.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        連絡先がありません
                    </div>
                ) : (
                    filteredContacts.map((contact) => (
                        <Link
                            key={contact.id}
                            href={`/contact/${contact.id}`}
                            className="block p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-blue-500 transition-colors group"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <Building className="w-4 h-4" />
                                    <span>{contact.company}</span>
                                </div>
                                <span className="text-xs text-slate-500">
                                    {new Date(contact.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
                                <User className="w-4 h-4 text-blue-400" />
                                {contact.name}
                            </h3>

                            <div className="text-sm text-slate-400 flex items-center gap-2 mb-4">
                                <Mail className="w-4 h-4" />
                                {contact.email}
                            </div>

                            <div className="text-xs text-slate-500 line-clamp-2 bg-slate-900/50 p-2 rounded">
                                {contact.generatedEmail.subject}
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="animate-spin text-slate-500" /></div>}>
            <DashboardContent />
        </Suspense>
    );
}
