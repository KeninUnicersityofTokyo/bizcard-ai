"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import VoiceInput from "@/components/VoiceInput";
import EmailPreview from "@/components/EmailPreview";
import { generateEmail } from "@/actions/generateEmail";
import { saveContact } from "@/lib/storage";
import { Loader2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewContactPage() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [image, setImage] = useState<string | null>(null);
    const [context, setContext] = useState("");
    const [platform, setPlatform] = useState<"email" | "linkedin" | "slack">("email");
    const [tone, setTone] = useState<"3" | "2" | "1">("2");
    const [manualDetails, setManualDetails] = useState({ name: "", company: "", email: "" });
    const [isManualMode, setIsManualMode] = useState(false);
    const [generatedEmail, setGeneratedEmail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleImageSelected = (base64: string) => {
        setImage(base64);
        setStep(2);
        setError(null);
    };

    const handleSkipToManual = () => {
        setIsManualMode(true);
        setStep(2);
        setError(null);
    };

    const handleGenerate = async () => {
        if (!image && !isManualMode) return;

        setIsLoading(true);
        setError(null);
        try {
            const result = await generateEmail(
                image,
                context,
                isManualMode ? manualDetails : undefined,
                platform,
                tone
            );
            setGeneratedEmail(result);
            setStep(3);
        } catch (error: any) {
            console.error(error);
            setError(error.message || "予期せぬエラーが発生しました。");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = (emailData: any, folderId: string) => {
        try {
            saveContact({
                folderId,
                name: emailData.name,
                company: isManualMode ? manualDetails.company : "Unknown", // AI might extract company, but for now we rely on manual or just generic
                email: emailData.email,
                context,
                imageBase64: image || undefined,
                generatedEmail: {
                    subject: emailData.subject,
                    body: emailData.body,
                },
            });
            router.push(`/?folderId=${folderId}`);
        } catch (e) {
            console.error(e);
            alert("保存に失敗しました。");
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <header className="mb-8 flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-400" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-100">新規作成</h1>
            </header>

            {error && (
                <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm text-center">
                    {error}
                </div>
            )}

            <div className="space-y-8">
                {/* Step 1: Image Upload */}
                <div className={`transition-all duration-500 ${step === 1 && !isManualMode ? "opacity-100" : "hidden"}`}>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <span className="font-bold text-slate-300">名刺を撮影</span>
                    </div>
                    <ImageUploader onImageSelected={handleImageSelected} />

                    <div className="text-center mt-6">
                        <p className="text-slate-500 text-sm mb-2">- または -</p>
                        <button
                            onClick={handleSkipToManual}
                            className="text-blue-400 hover:text-blue-300 text-sm font-medium underline underline-offset-4"
                        >
                            手動で情報を入力する
                        </button>
                    </div>
                </div>

                {/* Step 2: Voice Input & Manual Details */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {isManualMode && (
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">Info</span>
                                    <span className="font-bold text-slate-300">相手の情報 (手動入力)</span>
                                </div>
                                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">会社名</label>
                                        <input
                                            type="text"
                                            value={manualDetails.company}
                                            onChange={(e) => setManualDetails({ ...manualDetails, company: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">名前</label>
                                        <input
                                            type="text"
                                            value={manualDetails.name}
                                            onChange={(e) => setManualDetails({ ...manualDetails, name: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1">メールアドレス</label>
                                        <input
                                            type="email"
                                            value={manualDetails.email}
                                            onChange={(e) => setManualDetails({ ...manualDetails, email: e.target.value })}
                                            className="w-full p-3 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            <span className="font-bold text-slate-300">設定 & 会話内容</span>
                        </div>

                        {/* Settings: Platform & Tone */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2">プラットフォーム</label>
                                <select
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value as any)}
                                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="email">メール</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="slack">Slack / Chat</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-2">丁寧さ (トーン)</label>
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value as any)}
                                    className="w-full p-3 bg-slate-800 border border-slate-700 rounded-xl text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="3">Lv.3 超丁寧 (役員・謝罪)</option>
                                    <option value="2">Lv.2 丁寧 (標準)</option>
                                    <option value="1">Lv.1 フランク (親しい)</option>
                                </select>
                            </div>
                        </div>

                        <VoiceInput onContextChange={setContext} />

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full mt-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    生成中...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-6 h-6" />
                                    AIで作成
                                </>
                            )}
                        </button>
                    </div>
                )}

                {/* Step 3: Preview */}
                {step === 3 && generatedEmail && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                            <span className="font-bold text-slate-300">確認・保存</span>
                        </div>
                        <EmailPreview initialData={generatedEmail} onSave={handleSave} />

                        <button
                            onClick={() => {
                                setStep(1);
                                setImage(null);
                                setContext("");
                                setGeneratedEmail(null);
                                setIsManualMode(false);
                                setManualDetails({ name: "", company: "", email: "" });
                            }}
                            className="w-full mt-8 py-3 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors"
                        >
                            最初からやり直す
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
