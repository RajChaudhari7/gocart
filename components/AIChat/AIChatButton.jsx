"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, X } from "lucide-react";
import AIChatWindow from "./AIChatWindow";

export default function AIChatButton() {

    const [open, setOpen] = useState(false);

    return (
        <>

            {/* Chat Window */}
            <AIChatWindow
                open={open}
                onClose={() => setOpen(false)}
            />

            {/* Floating Button */}
            <AnimatePresence>

                {!open && (

                    <motion.button

                        initial={{
                            opacity: 0,
                            scale: 0.8
                        }}

                        animate={{
                            opacity: 1,
                            scale: 1
                        }}

                        exit={{
                            opacity: 0,
                            scale: 0.8
                        }}

                        whileHover={{
                            scale: 1.06
                        }}

                        whileTap={{
                            scale: 0.95
                        }}

                        transition={{
                            duration: 0.25
                        }}

                        onClick={() => setOpen(true)}

                        className="
                        fixed
                        bottom-5
                        right-5
                        md:right-6
                        md:bottom-6

                        z-[9998]

                        group

                        flex
                        items-center
                        gap-3

                        rounded-full

                        bg-gradient-to-r
                        from-cyan-500
                        to-indigo-600

                        text-white

                        px-5
                        py-3

                        shadow-2xl

                        hover:shadow-cyan-500/30

                        transition-all
                        duration-300
                        "

                    >

                        {/* Pulse */}
                        <span className="
                        absolute
                        inset-0
                        rounded-full
                        animate-ping
                        bg-cyan-500/30
                        -z-10
                        " />

                        <Bot size={22} />

                        <div className="hidden sm:flex flex-col items-start leading-tight">

                            <span className="text-xs opacity-90">

                                Ask

                            </span>

                            <span className="font-bold">

                                Nandurbar Bazar AI

                            </span>

                        </div>

                    </motion.button>

                )}

            </AnimatePresence>

            {/* Floating Close Button (optional) */}
            <AnimatePresence>

                {open && (

                    <motion.button

                        initial={{
                            opacity: 0,
                            scale: 0.8
                        }}

                        animate={{
                            opacity: 1,
                            scale: 1
                        }}

                        exit={{
                            opacity: 0,
                            scale: 0.8
                        }}

                        whileTap={{
                            scale: 0.9
                        }}

                        onClick={() => setOpen(false)}

                        className="
                        fixed
                        bottom-5
                        right-5

                        md:right-6
                        md:bottom-6

                        z-[9999]

                        w-14
                        h-14

                        rounded-full

                        bg-red-500

                        flex
                        items-center
                        justify-center

                        shadow-xl

                        hover:bg-red-600
                        transition
                        "

                    >

                        <X size={24} className="text-white" />

                    </motion.button>

                )}

            </AnimatePresence>

        </>
    );

}