import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navbar from './Navbar';
import Head from 'next/head';
import { Loader } from './ui/Loader';
import { ChatListPanel } from './ChatListPanel';
import { ChatPanel } from './ChatPanel';

// Pages that manage their own full-page layout (no global navbar)
const STANDALONE_ROUTES = ['/auth', '/onboarding'];
const STANDALONE_PREFIXES = ['/admin'];


export const Layout = ({ children }: { children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);
    const [isDark, setIsDark] = useState(true);
    
    // Global Chat State
    const [isChatListOpen, setIsChatListOpen] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [activeSwapId, setActiveSwapId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>("");

    const router = useRouter();

    const isStandalone = (router.pathname && STANDALONE_ROUTES.includes(router.pathname)) ||
        (router.pathname && STANDALONE_PREFIXES.some((prefix) => router.pathname.startsWith(prefix)));


    useEffect(() => {
        setMounted(true);
        const user = JSON.parse(localStorage.getItem("swapifhy_user") || "{}");
        if (user.id) setCurrentUserId(user.id);
    }, []);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
        }
    }, [isDark]);

    return (
        <div className="min-h-screen relative bg-background text-foreground selection:bg-primary/40 selection:text-white font-sans antialiased overflow-x-hidden transition-colors duration-500">
            <Head>
                <title>Swapifhy | Learn with people. Not from them.</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900&family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            {/* Ambient Brand Color Grading Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                {/* Subtle Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                {/* Radial glow 1 - Top Left (Primary/Blue) */}
                <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-primary/20 dark:bg-primary/10 blur-[120px] animate-pulse-slow"></div>
                
                {/* Radial glow 2 - Bottom Right (Accent/Pink) */}
                <div className="absolute -bottom-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-accent/20 dark:bg-accent/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                
                {/* Radial glow 3 - Center (Secondary/Lavender) */}
                <div className="absolute top-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full bg-secondary/15 dark:bg-secondary/5 blur-[150px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Global navbar — hidden on standalone pages like /auth */}
            {!isStandalone && <Navbar isDark={isDark} setIsDark={setIsDark} toggleChatList={() => setIsChatListOpen(!isChatListOpen)} />}

            <main className="relative z-10 w-full pb-32 md:pb-0">
                {!mounted && <Loader />}
                <div className="relative w-full">
                    {children}
                </div>
            </main>

            {/* GLOBAL CHAT INTERFACES */}
            {isChatListOpen && (
                <ChatListPanel 
                    onClose={() => setIsChatListOpen(false)} 
                    onSelectChat={(swapId) => {
                        setActiveSwapId(swapId);
                        setIsChatOpen(true);
                        setIsChatListOpen(false);
                    }}
                    />
            )}

            {isChatOpen && activeSwapId && (
                <ChatPanel 
                    swapId={activeSwapId} 
                    onClose={() => setIsChatOpen(false)} 
                    />
            )}
        </div>
    );
};
