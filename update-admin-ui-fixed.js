const fs = require('fs');

let adminCode = fs.readFileSync('frontend-v2/src/pages/admin/index.tsx', 'utf8');

// 1. Add SupportTickets to NAV_ITEMS
adminCode = adminCode.replace(
    /\{ id: "inquiries", label: "Inquiries", icon: MessageSquare \},/,
    '{ id: "inquiries", label: "Inquiries", icon: MessageSquare },\n    { id: "tickets", label: "Support Tickets", icon: AlertTriangle },'
);
// Import AlertTriangle
if (!adminCode.includes("AlertTriangle")) {
    adminCode = adminCode.replace(
        /import \{ /,
        'import { AlertTriangle, Eye, '
    );
}

// 2. Add State for tickets
adminCode = adminCode.replace(
    'const [inquiries, setInquiries] = useState<any[]>([]);',
    'const [inquiries, setInquiries] = useState<any[]>([]);\n    const [tickets, setTickets] = useState<any[]>([]);'
);

// 3. Add fetchTickets function
const fetchInquiriesRegex = /const fetchInquiries = async \(\) => \{[\s\S]*?catch \(err\) \{\}[\s\S]*?\};/;
const fetchTicketsFunc = `const fetchTickets = async () => {
        try {
            const res = await apiFetch("/api/admin/tickets");
            if (res.tickets) setTickets(res.tickets);
        } catch (err) {}
    };`;

adminCode = adminCode.replace(fetchInquiriesRegex, (match) => match + '\n    ' + fetchTicketsFunc);

// Add fetchTickets to useEffect
adminCode = adminCode.replace(
    /fetchInquiries\(\);/,
    'fetchInquiries();\n            fetchTickets();'
);

// Add to handleRefresh
adminCode = adminCode.replace(
    /await fetchInquiries\(\);/,
    'await fetchInquiries();\n        await fetchTickets();'
);

// 4. Add the View for Tickets right before settings
const settingsViewRegex = /\{activeTab === "settings" && \(/;
const ticketsViewCode = `{activeTab === "tickets" && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <h2 className="text-2xl font-black mb-1">Support Tickets</h2>
                                        <p className="text-muted-foreground text-sm">Queries, Feedback, and Bug Reports from the Help Page. Auto-deletes after 3 days.</p>
                                    </div>
                                    <button onClick={fetchTickets} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm">
                                        <RefreshCw className="w-4 h-4" /> Refresh
                                    </button>
                                </div>
                                <div className={\`rounded-2xl border overflow-hidden \${dark ? "bg-gray-800/30 border-gray-700" : "bg-white border-gray-200 shadow-sm"}\`}>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className={\`text-xs uppercase font-bold \${dark ? "bg-gray-800/80 text-gray-400" : "bg-gray-50 text-gray-500"}\`}>
                                                <tr>
                                                    <th className="px-6 py-4">Ticket ID</th>
                                                    <th className="px-6 py-4">Type</th>
                                                    <th className="px-6 py-4">Category</th>
                                                    <th className="px-6 py-4">User</th>
                                                    <th className="px-6 py-4">Content</th>
                                                    <th className="px-6 py-4">Date</th>
                                                    <th className="px-6 py-4 text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                                {tickets.length > 0 ? tickets.map((t: any) => (
                                                    <tr key={t.id} className={\`\${dark ? "hover:bg-gray-800/50" : "hover:bg-gray-50"}\`}>
                                                        <td className="px-6 py-4 font-mono font-bold">{t.ticketId}</td>
                                                        <td className="px-6 py-4">
                                                            <span className={\`px-2 py-1 rounded-md text-[10px] font-bold \${t.type === 'BUG' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-500/10 text-blue-500'}\`}>
                                                                {t.type}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-medium">{t.category}</td>
                                                        <td className="px-6 py-4">{t.user?.name || "Guest"}</td>
                                                        <td className="px-6 py-4"><div className="max-w-[300px] truncate">{t.content}</div></td>
                                                        <td className="px-6 py-4 whitespace-nowrap">{new Date(t.createdAt).toLocaleString()}</td>
                                                        <td className="px-6 py-4 text-right">
                                                            <button title="View" className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors">
                                                                <Eye className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">No active tickets.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                        `;

adminCode = adminCode.replace(settingsViewRegex, ticketsViewCode + '\n{activeTab === "settings" && (');

fs.writeFileSync('frontend-v2/src/pages/admin/index.tsx', adminCode);
console.log("Updated admin/index.tsx to show Support Tickets correctly");
