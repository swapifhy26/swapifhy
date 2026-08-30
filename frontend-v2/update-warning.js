const fs = require('fs');
let code = fs.readFileSync('src/components/ChatPanel.tsx', 'utf8');

const targetStr = `                            messages.map((msg, idx) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: "spring", damping: 25, delay: Math.min(idx * 0.02, 0.3) }}
                                    className={\`flex flex-col \${msg.senderId === currentUserId ? "items-end" : "items-start"}\`}
                                >
                                    {msg.senderId === "SYSTEM" ? (`;

const replacementStr = `                            messages.map((msg, idx) => {
                                if (msg.senderId.startsWith("SYSTEM_WARNING") && msg.senderId !== \`SYSTEM_WARNING_\${currentUserId}\`) return null;
                                return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ type: "spring", damping: 25, delay: Math.min(idx * 0.02, 0.3) }}
                                    className={\`flex flex-col \${msg.senderId === currentUserId ? "items-end" : msg.senderId.startsWith("SYSTEM") ? "items-center" : "items-start"}\`}
                                >
                                    {msg.senderId.startsWith("SYSTEM_WARNING") ? (
                                        <div className="w-full py-4 flex justify-center items-center">
                                            <div className="relative z-10 p-4 rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(239,68,68,0.15)] text-red-400 text-[13px] leading-relaxed font-medium text-center max-w-[85%]">
                                                {cleanJargon(msg.content)}
                                            </div>
                                        </div>
                                    ) : msg.senderId === "SYSTEM" ? (`;

if (code.includes(targetStr)) {
    code = code.replace(targetStr, replacementStr);
    code = code.replace(`                            messages.map((msg, idx) => (`, `                            messages.map((msg, idx) => (`); // Doesn't match anything now, just safety if failed
    
    // Also we need to close the curly brace for the map function!
    // The map loop currently ends with:
    //                                         </div>
    //                                     )}
    //                                 </motion.div>
    //                             ))
    //                         )}
    const endTargetStr = `                                    )}
                                </motion.div>
                            ))
                        )}`;

    const endReplacementStr = `                                    )}
                                </motion.div>
                            );
                        })
                        )}`;
    code = code.replace(endTargetStr, endReplacementStr);
    
    fs.writeFileSync('src/components/ChatPanel.tsx', code);
    console.log("Updated ChatPanel.tsx with red glassmorphic warning");
} else {
    console.log("Could not find target string in ChatPanel.tsx");
}
