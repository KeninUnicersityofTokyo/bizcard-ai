"use client";

import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

interface VoiceInputProps {
    onContextChange: (text: string) => void;
}

export default function VoiceInput({ onContextChange }: VoiceInputProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [text, setText] = useState("");
    const [error, setError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const SpeechRecognition =
                (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = "ja-JP";

                recognitionRef.current.onresult = (event: any) => {
                    let finalTranscript = "";
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (finalTranscript) {
                        setText((prev) => {
                            const newText = prev + (prev ? " " : "") + finalTranscript;
                            onContextChange(newText);
                            return newText;
                        });
                    }
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    if (event.error === 'not-allowed') {
                        setError("マイクの使用が許可されていません。");
                    } else if (event.error === 'no-speech') {
                        // Ignore no-speech error as it just means silence
                        return;
                    } else {
                        setError("音声認識エラーが発生しました: " + event.error);
                    }
                    setIsRecording(false);
                };

                recognitionRef.current.onend = () => {
                    setIsRecording(false);
                };
            } else {
                setError("このブラウザは音声認識をサポートしていません。");
            }
        }
    }, [onContextChange]);

    const toggleRecording = () => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setError(null);
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        onContextChange(e.target.value);
    };

    return (
        <div className="w-full max-w-md mx-auto p-4 bg-white rounded-xl shadow-sm border border-slate-200 mt-4">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Mic className="w-6 h-6 text-blue-600" />
                会話内容を入力
            </h2>

            <div className="mb-4">
                <button
                    onClick={toggleRecording}
                    className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 transition-all ${isRecording
                        ? "bg-red-50 text-red-600 border-2 border-red-500 animate-pulse"
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        }`}
                >
                    {isRecording ? (
                        <>
                            <MicOff className="w-6 h-6" />
                            <span className="font-bold">録音停止</span>
                        </>
                    ) : (
                        <>
                            <Mic className="w-6 h-6" />
                            <span className="font-bold">音声入力を開始</span>
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </div>
            )}

            <textarea
                value={text}
                onChange={handleTextChange}
                placeholder="例：渋谷のカフェで面談。サウナの話で盛り上がった。来週資料送る件を伝えて。"
                className="w-full h-32 p-3 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
        </div>
    );
}
