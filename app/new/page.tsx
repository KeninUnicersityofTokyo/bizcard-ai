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
    const [isManualDetailsOpen, setIsManualDetailsOpen] = useState(false);
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
        <div className="max-w-md mx-auto pb-12">
            <header className="mb-8 flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6 text-slate-500" />
                </Link>
                <h1 className="text-2xl font-bold text-slate-800">新規作成</h1>
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
                        <span className="font-bold text-slate-700">名刺を撮影</span>
                    </div>
                    <ImageUploader onImageSelected={handleImageSelected} />

                    <div className="text-center mt-6">
                        <p className="text-slate-500 text-sm mb-2">- または -</p>
                        <button
                            onClick={handleSkipToManual}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium underline underline-offset-4"
                        >
                            手動で情報を入力する
                        </button>
                    </div>
                </div>

                {/* Step 2: Voice Input & Manual Details */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Manual Details Accordion */}
                        <div className="mb-8 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                            <button
                                onClick={() => setIsManualDetailsOpen(!isManualDetailsOpen)}
                                className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">Info</span>
                                    <span className="font-bold text-slate-700">相手の情報</span>
                                </div>
                                <span className="text-xs text-blue-600 font-medium">
                                    {isManualDetailsOpen ? "閉じる" : "修正する"}
                                </span>
                            </button>

                            {isManualDetailsOpen && (
                                <div className="p-6 space-y-4 border-t border-slate-200">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">会社名</label>
                                        <input
                                            type="text"
                                            value={manualDetails.company}
                                            onChange={(e) => setManualDetails({ ...manualDetails, company: e.target.value })}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">名前</label>
                                        <input
                                            type="text"
                                            value={manualDetails.name}
                                            onChange={(e) => setManualDetails({ ...manualDetails, name: e.target.value })}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-slate-500 mb-1">メールアドレス</label>
                                        <input
                                            type="email"
                                            value={manualDetails.email}
                                            onChange={(e) => setManualDetails({ ...manualDetails, email: e.target.value })}
                                            className="w-full p-3 bg-white border border-slate-200 rounded-lg text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mb-4">
                            <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            <span className="font-bold text-slate-700">設定 & 会話内容</span>
                        </div>

                        {/* Settings: Platform & Tone */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2">プラットフォーム</label>
                                <select
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value as any)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                                >
                                    <option value="email">メール</option>
                                    <option value="linkedin">LinkedIn</option>
                                    <option value="slack">Slack / Chat</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-500 mb-2">丁寧さ (トーン)</label>
                                <select
                                    value={tone}
                                    onChange={(e) => setTone(e.target.value as any)}
                                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
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
                            <span className="font-bold text-slate-700">確認・保存</span>
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
                            className="w-full mt-8 py-3 text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors"
                        >
                            最初からやり直す
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
