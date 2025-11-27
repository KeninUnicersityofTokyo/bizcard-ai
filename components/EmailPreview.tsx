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
        <div className="w-full max-w-md mx-auto p-4 bg-slate-800 rounded-xl shadow-lg border border-slate-700 mt-4">
            <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Send className="w-6 h-6 text-blue-400" />
                メール確認・保存
            </h2>

            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">宛先</label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">相手の名前</label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">件名</label>
                    <input
                        type="text"
                        value={data.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">本文</label>
                    <textarea
                        value={data.body}
                        onChange={(e) => handleChange("body", e.target.value)}
                        className="w-full h-48 p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm leading-relaxed"
                    />
                </div>

                <div className="pt-4 border-t border-slate-700">
                    <label className="block text-xs font-medium text-slate-400 mb-2">保存先フォルダ</label>
                    <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        className="w-full p-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 mb-4"
                    >
                        <option value="inbox">Inbox</option>
                        {folders.map((f) => (
                            <option key={f.id} value={f.id}>
                                {f.name}
                            </option>
                        ))}
                    </select>

                    <div className="flex gap-3">
                        <button
                            onClick={() => onSave(data, selectedFolderId)}
                            className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            保存
                        </button>
                        <button
                            onClick={handleOpenMailer}
                            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
                        >
                            <Send className="w-5 h-5" />
                            メーラー起動
                        </button>
                    </div>
                    <button
                        onClick={handleCopy}
                        className="w-full mt-3 py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        コピー
                    </button>
                </div>
            </div>
        </div>
    );
}
