"use client";

import { useState, useEffect } from "react";
import { Send, Copy, Check, Save } from "lucide-react";
import { Folder } from "@/types";
import { getFolders } from "@/lib/storage";

interface EmailData {
    email: string;
    name: string;
    subject: string;
    body: string;
}

interface EmailPreviewProps {
    initialData: EmailData;
    onSave: (data: EmailData, folderId: string) => void;
}

export default function EmailPreview({ initialData, onSave }: EmailPreviewProps) {
    const [data, setData] = useState(initialData);
    const [copied, setCopied] = useState(false);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [selectedFolderId, setSelectedFolderId] = useState("inbox");

    useEffect(() => {
        setFolders(getFolders());
    }, []);

    const handleChange = (field: keyof EmailData, value: string) => {
        setData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCopy = () => {
        const text = `宛先: ${data.email}\n件名: ${data.subject}\n\n${data.body}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleOpenMailer = () => {
        const subject = encodeURIComponent(data.subject);
        const body = encodeURIComponent(data.body);
        window.location.href = `mailto:${data.email}?subject=${subject}&body=${body}`;
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white rounded-t-xl shadow-2xl border border-slate-200 overflow-hidden font-sans">
            {/* Gmail-like Header */}
            <div className="bg-slate-100 p-3 flex items-center justify-between border-b border-slate-200">
                <span className="text-sm font-bold text-slate-700">新規メッセージ</span>
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                    <div className="w-3 h-3 rounded-full bg-slate-300"></div>
                </div>
            </div>

            <div className="p-4 space-y-2">
                {/* To */}
                <div className="flex items-center border-b border-slate-100 py-2">
                    <span className="text-slate-500 text-sm w-12">To</span>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="flex-1 bg-transparent outline-none text-slate-800 text-sm"
                        placeholder="recipient@example.com"
                    />
                </div>

                {/* Subject */}
                <div className="flex items-center border-b border-slate-100 py-2">
                    <span className="text-slate-500 text-sm w-12">Subject</span>
                    <input
                        type="text"
                        value={data.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        className="flex-1 bg-transparent outline-none text-slate-800 font-bold text-sm"
                        placeholder="件名"
                    />
                </div>

                {/* Body */}
                <textarea
                    value={data.body}
                    onChange={(e) => handleChange("body", e.target.value)}
                    className="w-full h-64 py-4 bg-transparent outline-none text-slate-800 text-sm leading-relaxed resize-none"
                    placeholder="本文..."
                />
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        className="flex-1 p-2 bg-white border border-slate-200 rounded text-sm text-slate-700 outline-none"
                    >
                        <option value="inbox">Inbox</option>
                        {folders.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </select>
                    <button
                        onClick={() => onSave(data, selectedFolderId)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="保存"
                    >
                        <Save className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={handleOpenMailer}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm shadow-sm transition-colors flex items-center gap-2"
                        >
                            送信
                            <Send className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleCopy}
                            className="p-2 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
                            title="コピー"
                        >
                            {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                    <span className="text-xs text-slate-400">BizCard AI</span>
                </div>
            </div>
        </div>
    );
}
