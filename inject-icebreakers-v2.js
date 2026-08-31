const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/components/ChatPanel.tsx', 'utf8');

// 1. Modify sendMessage signature
code = code.replace(
    /const sendMessage = async \(type = "TEXT", details: any = null\) => \{[\s\S]*?if \(type === "TEXT" && !inputText\.trim\(\)\) return;/,
    `const sendMessage = async (type = "TEXT", details: any = null, overrideText: string | null = null) => {
        const textToSend = overrideText !== null ? overrideText : inputText;
        if (type === "TEXT" && !textToSend.trim()) return;`
);

// 2. Modify sendMessage body
code = code.replace(
    /body: JSON\.stringify\(\{ swapId, content: type === "TEXT" \? inputText : null, type, details \}\)/g,
    `body: JSON.stringify({ swapId, content: type === "TEXT" ? textToSend : null, type, details })`
);

// 3. Inject icebreaker buttons right after the messages div closes
const messagesEndRegex = /<\/div>\s*\{\/\* .*? INPUT .*? \*\/\}/;

const icebreakerHTML = `</div>
                    
                    {/* 🧊 ICEBREAKERS */}
                    {messages.filter(m => m.type === 'TEXT').length === 0 && (
                        <div className="px-6 py-3 flex flex-col gap-2 bg-gradient-to-t from-background to-transparent w-full z-10 border-t border-border/10">
                            <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 w-full snap-x">
                                {["Hey! So excited to swap skills! When are you free to chat? 👋", "I've been wanting to learn this forever! Where should we start? 🚀", "Let's set up a quick intro call this week! 📅"].map((icebreaker, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage("TEXT", null, icebreaker)}
                                        className="px-4 py-2 rounded-xl text-[12px] font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-sm text-left whitespace-nowrap shrink-0 snap-start"
                                    >
                                        {icebreaker}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ✨ INPUT ✨ */}`;

code = code.replace(messagesEndRegex, icebreakerHTML);

fs.writeFileSync('frontend-v2/src/components/ChatPanel.tsx', code);
console.log("Injected icebreakers using safer regex");
