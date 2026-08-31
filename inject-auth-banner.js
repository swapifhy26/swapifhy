const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/auth.tsx', 'utf8');

const banner = `
                    {/* Support & Help Banner */}
                    <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 p-4 rounded-xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)] backdrop-blur-md relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-pink-400"></div>
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400 mb-1.5 uppercase tracking-wide">
                                    Having trouble signing in?
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                                    If you face any issues like <strong className="text-foreground font-medium bg-foreground/5 px-1 py-0.5 rounded">invalid credentials</strong>, you can raise an issue on our <Link href="/help" className="text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-2 transition-colors">Help Page</Link>.
                                </p>
                                <div className="bg-surface/60 rounded-lg p-3 border border-border/60 shadow-inner">
                                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold mb-2">Or contact the concerned officers:</p>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></span>
                                        <span className="text-xs font-bold text-foreground">Anwesha Ganji & Ishani Sharma</span>
                                    </div>
                                    <a href="mailto:swapifhy.official@gmail.com" className="text-xs font-semibold text-pink-500 dark:text-pink-400 hover:text-pink-600 dark:hover:text-pink-300 flex items-center gap-2 transition-colors group bg-pink-500/10 w-fit px-3 py-1.5 rounded-full border border-pink-500/20">
                                        <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        swapifhy.official@gmail.com
                                    </a>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-3 italic">
                                    We are committed to serving you and solving your problems — that's what Swapifhy does! 💙
                                </p>
                            </div>
                        </div>
                    </motion.div>
`;

code = code.replace('                    </form>\r\n\r\n                    <div className="mt-8 text-sm text-muted-foreground">', '                    </form>\n' + banner + '\n                    <div className="mt-8 text-sm text-muted-foreground">');
code = code.replace('                    </form>\n\n                    <div className="mt-8 text-sm text-muted-foreground">', '                    </form>\n' + banner + '\n                    <div className="mt-8 text-sm text-muted-foreground">');

fs.writeFileSync('frontend-v2/src/pages/auth.tsx', code);
console.log("Injected support banner!");
