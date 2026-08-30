const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');

const tabRender = `
                {/* INQUIRIES */}
                {activeTab === "inquiries" && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className={\`text-2xl font-bold mb-1 \${text}\`}>Inquiries</h1>
                                <p className={\`text-sm \${subtext}\`}>Messages from the Get in Touch form.</p>
                            </div>
                            <button onClick={fetchInquiries} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm">
                                <RefreshCw className="w-4 h-4" /> Refresh
                            </button>
                        </div>
                        <Card dark={dark} title="Recent Inquiries">
                            {inquiries && inquiries.length > 0 ? (
                                <div className="space-y-4">
                                    {inquiries.map((inq: any) => (
                                        <div key={inq.id} className={\`p-4 rounded-xl border \${dark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-100 bg-gray-50/50'}\`}>
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className={\`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider mb-2 \${inq.isRead ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}\`}>
                                                        {inq.isRead ? 'Read' : 'New'}
                                                    </span>
                                                    <h3 className={\`font-bold \${text}\`}>{inq.subject || "No Subject"}</h3>
                                                    <p className={\`text-sm \${subtext}\`}>{inq.email}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={async () => {
                                                        await apiFetch(\`/api/admin/inquiries/\${inq.id}\`, { method: "PUT", body: JSON.stringify({ isRead: !inq.isRead }) });
                                                        fetchInquiries();
                                                    }} className={\`p-2 rounded-lg transition-colors \${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}\`} title="Toggle Read Status">
                                                        <CheckCircle2 className={\`w-4 h-4 \${inq.isRead ? 'text-green-500' : 'text-gray-400'}\`} />
                                                    </button>
                                                    <button onClick={async () => {
                                                        if(confirm("Delete inquiry?")) {
                                                            await apiFetch(\`/api/admin/inquiries/\${inq.id}\`, { method: "DELETE" });
                                                            fetchInquiries();
                                                        }
                                                    }} className={\`p-2 rounded-lg transition-colors hover:text-red-500 \${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}\`} title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className={\`text-xs mt-2 \${subtext}\`}>
                                                Received: {new Date(inq.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <MessageSquare className={\`w-12 h-12 mx-auto mb-3 opacity-20 \${text}\`} />
                                    <p className={\`text-sm \${subtext}\`}>No inquiries found.</p>
                                </div>
                            )}
                        </Card>
                    </div>
                )}
`;

// Inject before {activeTab === "settings" && (
code = code.replace(/\{activeTab === "settings" && \(/g, tabRender + '\n                {activeTab === "settings" && (');

// We also need to add logic to loadInquiries when activeTab === "inquiries"
// Because otherwise they won't automatically fetch when switching to the tab
const tabEffectTarget = `if (activeTab === "settings") loadSettings();`;
const tabEffectNew = `if (activeTab === "settings") loadSettings();\n        if (activeTab === "inquiries" && inquiries.length === 0) fetchInquiries();`;
code = code.replace(tabEffectTarget, tabEffectNew);

const refreshTarget = `activeTab === "settings" ? loadSettings() : Promise.resolve(),`;
const refreshNew = `activeTab === "settings" ? loadSettings() : Promise.resolve(),\n            activeTab === "inquiries" ? fetchInquiries() : Promise.resolve(),`;
code = code.replace(refreshTarget, refreshNew);

fs.writeFileSync('src/pages/admin/index.tsx', code);
console.log('Inquiries tab UI injected safely!');
