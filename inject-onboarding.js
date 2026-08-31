const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/onboarding.tsx', 'utf8');

// 1. Import canvas-confetti
if (!code.includes('import confetti')) {
    code = `import confetti from 'canvas-confetti';\n` + code;
}

// 2. Add `completed` state
code = code.replace(
    /const \[saving, setSaving\] = useState\(false\);/,
    `const [saving, setSaving] = useState(false);\n    const [completed, setCompleted] = useState(false);`
);

// 3. Modify handleSubmit
const oldSubmitRegex = /if \(res\.ok\) \{\s*router\.push\("\/feed"\);\s*\} else \{/g;
const newSubmit = `if (res.ok) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#4F46E5', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6']
                });
                setCompleted(true);
                setTimeout(() => {
                    router.push("/feed");
                }, 3500);
            } else {`;
code = code.replace(oldSubmitRegex, newSubmit);

// 4. Add the overlay render just before the main return JSX
const overlayHTML = `
    if (completed) {
        return (
            <div className="min-h-screen bg-[#0B0F1A] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-purple-500/10" />
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 20 }}
                    className="relative z-10 space-y-6"
                >
                    <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                        <span className="text-4xl" dangerouslySetInnerHTML={{ __html: '&#x1F680;' }} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-heading font-black text-white tracking-tight">
                        Welcome to the top <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">1% of learners</span>.
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">Your hub is being generated...</p>
                </motion.div>
            </div>
        );
    }
`;

code = code.replace(
    /return \(\s*<div className="min-h-screen/,
    `${overlayHTML}\n    return (\n        <div className="min-h-screen`
);

fs.writeFileSync('frontend-v2/src/pages/onboarding.tsx', code);
console.log("Injected confetti and welcome overlay");
