const fs = require('fs');
let code = fs.readFileSync('frontend-v2/src/pages/progress.tsx', 'utf8');

const handleRevokeProgressCode = `
    const handleRevokeSwap = async (swapId: string) => {
        if (!confirm("Are you sure you want to revoke this swap request?")) return;
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(\`\${API_URL}/api/chat/swap/\${swapId}\`, {
                method: "DELETE",
                headers: { "Authorization": \`Bearer \${token}\` }
            });
            if (res.ok) {
                fetchData();
            } else {
                const d = await res.json();
                alert(d.error || "Failed to revoke");
            }
        } catch (err) { console.error(err); }
    };
`;

code = code.replace(
    'const acceptSwap = async',
    handleRevokeProgressCode + '\n    const acceptSwap = async'
);

const revokeBtnHtml = `
                                                    <button onClick={() => handleRevokeSwap(req.id)} className="px-3 py-1.5 bg-red-900/50 text-red-200 text-xs font-bold rounded-lg hover:bg-red-600 transition-colors">
                                                        Revoke
                                                    </button>
                                                </div>
`;

code = code.replace(
    '<p className="text-xs text-muted-foreground">Pending their approval</p>\n                                                    </div>\n                                                </div>\n                                            </div>',
    '<p className="text-xs text-muted-foreground">Pending their approval</p>\n                                                    </div>\n                                                </div>\n' + revokeBtnHtml + '\n                                            </div>'
);

fs.writeFileSync('frontend-v2/src/pages/progress.tsx', code);
console.log("Injected revoke feature to progress.tsx");
