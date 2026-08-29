const fs = require('fs');
let code = fs.readFileSync('src/pages/dashboard.tsx', 'utf8');

const oldCode = `<button onClick={() => handleSave()} disabled={saving} className="btn-gradient px-14 py-5 text-xs font-black text-white uppercase tracking-[0.4em]">
                                    {saving ? "SAVING..." : "Save Changes"}
                                </button>
                            </div>`;
const newCode = `<button onClick={() => handleSave()} disabled={saving} className="btn-gradient px-14 py-5 text-xs font-black text-white uppercase tracking-[0.4em]">
                                    {saving ? "SAVING..." : "Save Changes"}
                                </button>
                                <button onClick={() => { localStorage.removeItem('swapifhy_token'); window.location.href = '/'; }} className="md:hidden mt-4 w-full px-14 py-5 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-black uppercase tracking-[0.4em] hover:bg-red-500/20 transition-all">
                                    Log Out
                                </button>
                            </div>`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/pages/dashboard.tsx', code);
console.log('Logout button added.');
