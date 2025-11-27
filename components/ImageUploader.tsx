"use client";

import { useState, useRef } from "react";
import { Camera, Upload } from "lucide-react";

interface ImageUploaderProps {
    onImageSelected: (base64: string) => void;
}

export default function ImageUploader({ onImageSelected }: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result as string;
                setPreview(base64);
                onImageSelected(base64);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-slate-800 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Camera className="w-6 h-6 text-blue-400" />
                名刺を撮影
            </h2>

            <div className="relative aspect-video bg-slate-900 rounded-lg overflow-hidden border-2 border-dashed border-slate-600 flex items-center justify-center group hover:border-blue-500 transition-colors">
                {preview ? (
                    <img
                        src={preview}
                        alt="Business Card Preview"
                        className="w-full h-full object-contain z-10"
                        onError={(e) => {
                            console.error("Image load error", e);
                            alert("画像の表示に失敗しました。別の画像をお試しください。");
                            setPreview(null);
                        }}
                    />
                ) : (
                    <div className="text-center p-6 z-10 pointer-events-none">
                        <Upload className="w-12 h-12 text-slate-500 mx-auto mb-2 group-hover:text-blue-400 transition-colors" />
                        <p className="text-slate-400 text-sm">
                            タップしてカメラを起動<br />または画像を選択
                        </p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
            </div>

            {preview && (
                <button
                    onClick={() => {
                        setPreview(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="mt-4 w-full py-2 px-4 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition-colors"
                >
                    撮り直す
                </button>
            )}
        </div>
    );
}
