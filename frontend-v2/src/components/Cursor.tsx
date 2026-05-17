import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

export const Cursor = () => {
    const [mounted, setMounted] = useState(false);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const cursorX = useSpring(mouseX, { damping: 30, stiffness: 400, mass: 0.5 });
    const cursorY = useSpring(mouseY, { damping: 30, stiffness: 400, mass: 0.5 });

    useEffect(() => {
        setMounted(true);
        const updateMouse = (e: MouseEvent) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };
        window.addEventListener("mousemove", updateMouse);
        return () => window.removeEventListener("mousemove", updateMouse);
    }, [mouseX, mouseY]);

    if (!mounted) return null;

    return (
        <>
            <motion.div
                className="fixed top-0 left-0 w-10 h-10 rounded-full border-[1.5px] border-zinc-400 dark:border-white/40 pointer-events-none z-[999] opacity-70 hidden md:block"
                style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%" }}
            />
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 rounded-full bg-zinc-800 dark:bg-white pointer-events-none z-[1000] hidden md:block"
                style={{ x: cursorX, y: cursorY, translateX: "-50%", translateY: "-50%", transition: "transform 0.05s ease-out" }}
            />
        </>
    );
};
