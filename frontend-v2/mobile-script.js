const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');
const lines = code.split('\n');

let startIdx = 379;
let endIdx = lines.length - 1;
for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].includes(');')) {
        endIdx = i;
        break;
    }
}

let returnBlock = lines.slice(startIdx + 1, endIdx).join('\n');

let desktopBlock = returnBlock.replace(
  '<div className={`min-h-screen ${bg} font-sans ${text} flex`}>',
  '<div className={`hidden md:flex min-h-screen ${bg} font-sans ${text}`}>\n                {/* DESKTOP / TABLET VIEW */}'
);

let modalsMatch = returnBlock.match(/{.*?Modals.*?{showAddWaitlist[^}]*}/s);
let modalsCode = modalsMatch ? modalsMatch[0] : '';

let mainMatch = returnBlock.match(/<main className="flex-1 px-8 py-8 max-w-\[1300px\] overflow-x-hidden">([\s\S]*?)<\/main>/);
let mainCode = mainMatch ? mainMatch[1] : '';

let mobileBlock = `
        {/* ======================= */}
        {/* MOBILE VIEW (SEPARATE)  */}
        {/* ======================= */}
        <div className={\`md:hidden flex flex-col min-h-screen \${bg} font-sans \${text} pb-24\`}>
            {/* Modals */}
            ${modalsCode}

            {/* Mobile Header */}
            <header className={\`sticky top-0 z-40 px-4 py-3 border-b flex items-center justify-between \${sidebar}\`}>
                <div className="flex items-center gap-2">
                    <img src="/images/features/swapifhy-logo-DPxPDdg-.png" alt="logo" className="w-7 h-7 object-contain" />
                    <span className="font-bold text-sm">Admin Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <button onClick={handleLogout} className="p-2 rounded-lg bg-red-50 text-red-500 dark:bg-red-900/20">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 py-6 overflow-x-hidden">
                ${mainCode}
            </main>

            {/* Mobile Bottom Nav */}
            <nav className={\`fixed bottom-0 left-0 right-0 border-t \${sidebar} flex items-center justify-around px-2 py-2 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]\`}>
                 {NAV_ITEMS.map(item => {
                      const Icon = item.icon;
                      const active = activeTab === item.id;
                      return (
                          <button key={item.id} onClick={() => setActiveTab(item.id)} 
                              className={\`flex flex-col items-center p-2 rounded-lg transition-colors \${active ? "text-indigo-600 dark:text-indigo-400" : subtext}\`}>
                              <Icon className="w-5 h-5 mb-1" />
                              <span className="text-[10px] font-medium">{item.label}</span>
                          </button>
                      );
                 })}
            </nav>
        </div>
`;

let newReturn = `    return (
        <>
${desktopBlock}
${mobileBlock}
        </>
    );`;

const newCode = lines.slice(0, startIdx).join('\n') + '\n' + newReturn + '\n' + lines.slice(endIdx + 1).join('\n');
fs.writeFileSync('src/pages/admin/index.tsx', newCode);
console.log('Mobile view integrated successfully.');
