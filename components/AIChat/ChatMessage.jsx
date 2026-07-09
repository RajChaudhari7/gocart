"use client";

import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatMessage({ sender, message }) {

    const isUser = sender === "user";

    return (

        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"
                }`}
        >

            {!isUser && (
                <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center shrink-0">
                    <Bot size={18} className="text-white" />
                </div>
            )}

            <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${isUser
                        ? "bg-indigo-600 text-white rounded-br-md"
                        : "bg-slate-800 text-slate-100 rounded-bl-md"
                    }`}
            >
                {message}
            </div>

            {isUser && (
                <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <User size={18} className="text-white" />
                </div>
            )}

        </motion.div>

    );

}