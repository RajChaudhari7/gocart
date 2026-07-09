"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
    X,
    Send,
    Sparkles
} from "lucide-react";
import axios from "axios";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";
import ChatProductCard from "./ChatProductCard";

export default function AIChatWindow({ open, onClose }) {

    const [messages, setMessages] = useState([
        {
            sender: "bot",
            message:
                "Hello 👋 Welcome to Nandurbar Bazar AI.\n\nI can help you find products, compare items and recommend the best options for you."
        }
    ]);

    const [input, setInput] = useState("");

    const [typing, setTyping] = useState(false);
    const [recommendedProducts, setRecommendedProducts] = useState([]);

    const messagesEndRef = useRef(null);

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        });

    }, [messages, typing]);
    const sendMessage = async () => {

        if (!input.trim() || typing) return;

        const userMessage = input;

        setMessages(prev => [
            ...prev,
            {
                sender: "user",
                message: userMessage
            }
        ]);

        setInput("");
        setTyping(true);

        try {

            const { data } = await axios.post("/api/ai/chat", {
                message: userMessage
            });

            setMessages(prev => [

                ...prev,

                {
                    sender: "bot",
                    message: data.reply
                }

            ]);

            setRecommendedProducts(data.products || []);

        } catch (error) {

            console.log(error);

            setMessages(prev => [

                ...prev,

                {
                    sender: "bot",
                    message:
                        "Sorry, I couldn't understand your request."
                }

            ]);

        } finally {

            setTyping(false);

        }

    };

    return (

        <AnimatePresence>

            {open && (

                <motion.div

                    initial={{
                        opacity: 0,
                        scale: 0.9,
                        y: 40
                    }}

                    animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0
                    }}

                    exit={{
                        opacity: 0,
                        scale: 0.9,
                        y: 40
                    }}

                    transition={{
                        duration: 0.25
                    }}

                    className="
                    fixed
                    bottom-24
                    right-5
                    z-[9999]

                    w-[380px]
                    max-w-[95vw]

                    h-[650px]
                    max-h-[85vh]

                    bg-slate-950
                    border
                    border-slate-800

                    rounded-3xl

                    shadow-2xl

                    overflow-hidden

                    flex
                    flex-col

                    md:right-6

                    "

                >

                    {/* HEADER */}

                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900">

                        <div className="flex items-center gap-3">

                            <div className="w-11 h-11 rounded-full bg-cyan-500 flex items-center justify-center">

                                <Sparkles className="text-white" />

                            </div>

                            <div>

                                <h2 className="font-bold text-white">

                                    Nandurbar Bazar AI

                                </h2>

                                <p className="text-xs text-cyan-400">

                                    Shopping Assistant

                                </p>

                            </div>

                        </div>

                        <button

                            onClick={onClose}

                            className="
                            p-2
                            rounded-full
                            hover:bg-slate-800
                            transition
                            "

                        >

                            <X className="text-white" size={18} />

                        </button>

                    </div>

                    {/* CHAT */}

                    <div

                        className="
                        flex-1
                        overflow-y-auto
                        px-4
                        py-5
                        space-y-4
                        bg-slate-950
                        "

                    >

                        {messages.map((msg, index) => (

                            <ChatMessage
                                key={index}
                                sender={msg.sender}
                                message={msg.message}
                            />

                        ))}

                        {/* Recommended Products */}

                        {recommendedProducts.length > 0 && (

                            <div className="space-y-3 mt-5">

                                <h3 className="text-cyan-400 font-semibold">

                                    Recommended Products

                                </h3>

                                <div className="grid grid-cols-1 gap-3">

                                    {recommendedProducts.map(product => (

                                        <ChatProductCard
                                            key={product.id}
                                            product={product}
                                        />

                                    ))}

                                </div>

                            </div>

                        )}

                        {typing && <TypingIndicator />}

                        <div ref={messagesEndRef} />

                    </div>

                    {/* INPUT */}

                    <div className="border-t border-slate-800 bg-slate-900 p-4">

                        <div className="flex items-center gap-3">

                            <input
                                disabled={typing}

                                value={input}

                                onChange={(e) =>
                                    setInput(e.target.value)
                                }

                                onKeyDown={(e) => {

                                    if (e.key === "Enter") {

                                        sendMessage();

                                    }

                                }}

                                placeholder="Ask anything..."

                                className="
                                flex-1
                                bg-slate-800
                                text-white
                                placeholder:text-slate-500

                                rounded-full

                                px-5
                                py-3

                                outline-none
                                border
                                border-slate-700

                                focus:border-cyan-500
                                "

                            />

                            <button

                                disabled={typing}

                                onClick={sendMessage}

                                className="
                                w-12
                                h-12

                                rounded-full

                                bg-cyan-500

                                hover:bg-cyan-400

                                flex
                                items-center
                                justify-center

                                transition
                                "

                            >

                                <Send

                                    size={18}

                                    className="text-white"

                                />

                            </button>

                        </div>

                    </div>

                </motion.div>

            )}

        </AnimatePresence>

    );

}