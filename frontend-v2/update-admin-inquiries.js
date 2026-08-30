const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');

// 1. Add Inquiries to NAV_ITEMS
const targetNavItems = `    { id: "waitlist", label: "Waitlist", icon: Mail },
    { id: "settings", label: "Settings", icon: Settings },
];`;
const newNavItems = `    { id: "waitlist", label: "Waitlist", icon: Mail },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare },
    { id: "settings", label: "Settings", icon: Settings },
];`;
if (code.includes(targetNavItems)) code = code.replace(targetNavItems, newNavItems);

// 2. State & fetch logic
const targetState = `const [activeTab, setActiveTab] = useState("overview");`;
const newState = `const [activeTab, setActiveTab] = useState("overview");
    const [inquiries, setInquiries] = useState<any[]>([]);`;
if (code.includes(targetState)) code = code.replace(targetState, newState);

const targetFetch = `// Fetch Settings`;
const newFetch = `const fetchInquiries = async () => {
        const res = await apiFetch("/api/admin/inquiries");
        if (res) setInquiries(res);
    };

    // Fetch Settings`;
if (code.includes(targetFetch)) code = code.replace(targetFetch, newFetch);

const targetUseEffect = `fetchWaitlist();
        fetchSettings();`;
const newUseEffect = `fetchWaitlist();
        fetchSettings();
        fetchInquiries();`;
if (code.includes(targetUseEffect)) code = code.replace(targetUseEffect, newUseEffect);

// Add Tab Renderer
const targetTabRender = `{/* Settings Tab */}`;
const newTabRender = `{/* Inquiries Tab */}
                        {activeTab === "inquiries" && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className={\`text-xl font-bold \${text}\`}>Contact Inquiries</h2>
                                    <button onClick={fetchInquiries} className={\`p-2 rounded-xl border \${border} \${hover} transition-all\`}>
                                        <RefreshCw className={\`w-4 h-4 \${subtext}\`} />
                                    </button>
                                </div>
                                {inquiries.length === 0 ? (
                                    <div className={\`flex flex-col items-center justify-center p-12 border \${border} rounded-2xl border-dashed bg-foreground/5\`}>
                                        <MessageSquare className={\`w-12 h-12 \${subtext} mb-4 opacity-50\`} />
                                        <p className={\`text-lg font-bold \${text} mb-1\`}>No Inquiries Yet</p>
                                        <p className={\`text-sm \${subtext}\`}>When users contact you, they will appear here.</p>
                                    </div>
                                ) : (
                                    <div className={\`bg-white dark:bg-slate-800 rounded-2xl border \${border} overflow-hidden\`}>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className={\`text-xs \${subtext} uppercase bg-gray-50 dark:bg-slate-800/50 border-b \${border}\`}>
                                                    <tr>
                                                        <th className="px-6 py-4 font-semibold">Status</th>
                                                        <th className="px-6 py-4 font-semibold">Email</th>
                                                        <th className="px-6 py-4 font-semibold">Subject</th>
                                                        <th className="px-6 py-4 font-semibold">Date</th>
                                                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {inquiries.map((inq: any) => (
                                                        <tr key={inq.id} className={\`border-b \${border} hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors\`}>
                                                            <td className="px-6 py-4">
                                                                <span className={\`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${inq.isRead ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"}\`}>
                                                                    {inq.isRead ? "Read" : "New"}
                                                                </span>
                                                            </td>
                                                            <td className={\`px-6 py-4 font-medium \${text}\`}>{inq.email}</td>
                                                            <td className={\`px-6 py-4 \${subtext}\`}>{inq.subject || "No subject"}</td>
                                                            <td className={\`px-6 py-4 \${subtext}\`}>{new Date(inq.createdAt).toLocaleDateString()}</td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button 
                                                                        onClick={async () => {
                                                                            await apiFetch(\`/api/admin/inquiries/\${inq.id}\`, { method: "PUT", body: JSON.stringify({ isRead: !inq.isRead }) });
                                                                            fetchInquiries();
                                                                        }}
                                                                        className={\`p-2 rounded-lg border \${border} \${hover} text-gray-500 hover:text-indigo-600 transition-colors\`}
                                                                        title={inq.isRead ? "Mark as unread" : "Mark as read"}
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button 
                                                                        onClick={async () => {
                                                                            if(confirm("Delete this inquiry?")) {
                                                                                await apiFetch(\`/api/admin/inquiries/\${inq.id}\`, { method: "DELETE" });
                                                                                fetchInquiries();
                                                                            }
                                                                        }}
                                                                        className={\`p-2 rounded-lg border \${border} \${hover} text-gray-500 hover:text-red-600 transition-colors\`}
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Settings Tab */}`;
if (code.includes(targetTabRender)) code = code.replace(targetTabRender, newTabRender);

fs.writeFileSync('src/pages/admin/index.tsx', code);
console.log('Inquiries tab added to Admin Portal');
