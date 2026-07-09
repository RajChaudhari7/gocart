"use client";

import { Bot } from "lucide-react";

export default function TypingIndicator() {

    return (

        <div className="flex gap-3">

            <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center">

                <Bot size={18} className="text-white" />

            </div>

            <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3">

                <div className="flex gap-1">

                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />

                    <span
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                    />

                    <span
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                    />

                </div>

            </div>

        </div>

    );

}