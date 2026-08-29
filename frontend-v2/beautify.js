const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');

const headerRegex = /\{\/\* Mobile Header \*\/\}\s*<header className=\{`sticky top-0 z-40 px-4 py-3 border-b flex items-center justify-between \$\{sidebar\}`\}>.*?<\/header>/s;
const navRegex = /\{\/\* Mobile Bottom Nav \*\/\}\s*<nav className=\{`fixed bottom-0 left-0 right-0 border-t \$\{sidebar\} flex items-center justify-around px-2 py-2 pb-safe z-50 shadow-\[0_-4px_6px_-1px_rgba\(0,0,0,0\.1\)\]`\}>.*?<\/nav>/s;

const newHeader = `            {/* Mobile Header */}
            <header className="sticky top-0 z-40 px-5 py-4 backdrop-blur-2xl bg-white/70 dark:bg-gray-950/70 border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <img src="/images/features/swapifhy-logo-DPxPDdg-.png" alt="logo" className="w-5 h-5 object-contain brightness-0 invert" />
                    </div>
                    <span className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 text-lg">Admin</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <button onClick={() => setDark(d => !d)} className="p-2.5 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm text-gray-600 dark:text-gray-300 transition-transform active:scale-95">
                        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button onClick={handleLogout} className="p-2.5 rounded-full bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 shadow-sm text-red-500 transition-transform active:scale-95">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>`;

const newNav = `            {/* Mobile Bottom Nav */}
            <div className="fixed bottom-6 left-4 right-4 z-50">
                <nav className="flex items-center justify-between px-2 py-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl border border-gray-200/50 dark:border-gray-700/50 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.5)]">
                     {NAV_ITEMS.map(item => {
                          const Icon = item.icon;
                          const active = activeTab === item.id;
                          return (
                              <button key={item.id} onClick={() => setActiveTab(item.id)} 
                                  className={\`relative flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 \${active ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/30 -translate-y-2" : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"}\`}>
                                  <Icon className={\`w-5 h-5 transition-all duration-300 \${active ? "scale-110" : "mb-0.5"}\`} />
                                  {!active && <span className="text-[9px] font-bold tracking-wide opacity-80">{item.label}</span>}
                              </button>
                          );
                     })}
                </nav>
            </div>`;

console.log('Header Match:', headerRegex.test(code));
console.log('Nav Match:', navRegex.test(code));

if(headerRegex.test(code) && navRegex.test(code)) {
    code = code.replace(headerRegex, newHeader);
    code = code.replace(navRegex, newNav);
    
    const oldWrapper = '<div className={`md:hidden flex flex-col min-h-screen ${bg} font-sans ${text} pb-24`}>';
    const newWrapper = '<div className={`md:hidden flex flex-col min-h-screen font-sans ${text} pb-32 bg-gradient-to-br ${dark ? "from-gray-950 to-gray-900" : "from-gray-50 to-gray-100"}`}>';
    code = code.replace(oldWrapper, newWrapper);

    fs.writeFileSync('src/pages/admin/index.tsx', code);
    console.log('Mobile beautified using regex!');
}
