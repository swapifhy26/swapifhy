const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/components/ChatPanel.tsx', 'utf8');

// 1. Add import for emoji-picker-react and Smile icon
if (!code.includes('import EmojiPicker')) {
    code = code.replace(
        /import \{ [^}]* \} from "lucide-react";/,
        (match) => match.replace('}', ', Smile }') + '\nimport EmojiPicker from "emoji-picker-react";'
    );
}

// 2. Add state for emoji picker visibility
if (!code.includes('showEmojiPicker')) {
    code = code.replace(
        /const \[inputText, setInputText\] = useState\(""\);/,
        `const [inputText, setInputText] = useState("");\n    const [showEmojiPicker, setShowEmojiPicker] = useState(false);`
    );
}

// 3. Inject the emoji picker button inside the input wrapper, and the actual picker above it
const inputWrapperStartRegex = /<div className=\{\`flex items-center gap-3 p-2 pr-3 rounded-\[1\.75rem\] border transition-all duration-300 \$\{t\.inputWrapper\}\`\}>/;

const emojiInjection = `<div className={\`flex items-center gap-3 p-2 pr-3 rounded-[1.75rem] border transition-all duration-300 \${t.inputWrapper}\`} style={{ position: 'relative' }}>
                            {/* Emoji Picker Popover */}
                            {showEmojiPicker && (
                                <div className="absolute bottom-[110%] left-0 z-50 shadow-2xl rounded-2xl overflow-hidden border border-white/10" style={{ animation: 'fade-in-up 0.2s ease-out' }}>
                                    <EmojiPicker 
                                        onEmojiClick={(emojiData) => {
                                            setInputText(prev => prev + emojiData.emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                        theme="auto"
                                        lazyLoadEmojis={true}
                                        searchDisabled={true}
                                        skinTonesDisabled={true}
                                        width={280}
                                        height={350}
                                    />
                                </div>
                            )}

                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className={\`p-3.5 rounded-2xl border transition-all group/emoji \${t.plusBtn}\`}
                                title="Add Emoji"
                            >
                                <Smile className="w-5 h-5 group-hover/emoji:scale-110 transition-transform" />
                            </button>

`;

code = code.replace(inputWrapperStartRegex, emojiInjection);

fs.writeFileSync('frontend-v2/src/components/ChatPanel.tsx', code);
console.log("Injected Emoji Picker into ChatPanel.tsx");
