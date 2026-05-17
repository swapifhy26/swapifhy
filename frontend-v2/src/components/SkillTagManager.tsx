import React, { useState } from "react";
import { motion } from "framer-motion";

export const SkillTagManager = ({ tags, onUpdate, title, color }: { tags: string[], onUpdate: (tags: string[]) => void, title: string, color: string }) => {
    const [input, setInput] = useState("");

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) {
                onUpdate([...tags, input.trim()]);
            }
            setInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        onUpdate(tags.filter(t => t !== tagToRemove));
    };

    return (
        <div className="space-y-4">
            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">{title}</label>
            <div className="flex flex-wrap gap-2 p-3 min-h-[100px] bg-white/5 border border-white/10 rounded-2xl shadow-inner content-start">
                {tags.map((tag, idx) => (
                    <motion.span 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        key={idx} 
                        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border transition-all ${color}`}
                    >
                        {tag}
                        <button onClick={() => removeTag(tag)} type="button" className="hover:text-white transition-colors">×</button>
                    </motion.span>
                ))}
                <input 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={addTag}
                    placeholder="Type & Enter..."
                    className="flex-1 bg-transparent border-none outline-none text-white text-xs p-2 placeholder:text-white/10"
                />
            </div>
        </div>
    );
};
