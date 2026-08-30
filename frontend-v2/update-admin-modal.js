const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');

// 1. Add modal state
const stateTarget = `const [maintenanceMode, setMaintenanceMode] = useState(false);`;
const newState = `const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [maintenanceMinutes, setMaintenanceMinutes] = useState("");
    const [maintenanceRemark, setMaintenanceRemark] = useState("");`;

if (code.includes(stateTarget)) {
    code = code.replace(stateTarget, newState);
}

// 2. Add handleMaintenanceToggle function
const fnTarget = `const handleSaveSettings = async () => {`;
const newFn = `const handleMaintenanceToggle = async (turnOn: boolean) => {
        if (!turnOn) {
            // Turning off immediately
            const res = await apiFetch("/api/admin/settings", {
                method: "PUT",
                body: JSON.stringify({ maintenanceMode: false, maintenanceEndTime: null, maintenanceRemark: null })
            });
            if (res) {
                setMaintenanceMode(false);
            }
        } else {
            // Turning on -> open modal
            setShowMaintenanceModal(true);
        }
    };

    const confirmMaintenance = async () => {
        let endTime = null;
        if (maintenanceMinutes && !isNaN(Number(maintenanceMinutes))) {
            endTime = new Date(Date.now() + Number(maintenanceMinutes) * 60000).toISOString();
        }
        
        const res = await apiFetch("/api/admin/settings", {
            method: "PUT",
            body: JSON.stringify({ 
                maintenanceMode: true, 
                maintenanceEndTime: endTime, 
                maintenanceRemark: maintenanceRemark 
            })
        });
        if (res) {
            setMaintenanceMode(true);
            setShowMaintenanceModal(false);
            setMaintenanceMinutes("");
            setMaintenanceRemark("");
        }
    };

    const handleSaveSettings = async () => {`;

if (code.includes(fnTarget)) {
    code = code.replace(fnTarget, newFn);
}

// 3. Replace the onClick handlers
const buttonTarget1 = `<button onClick={() => setMaintenanceMode(m => !m)}
                                        className={\`w-12 h-6 rounded-full transition-colors relative \${maintenanceMode ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-700"}\`}>`;

const newButton1 = `<button onClick={() => handleMaintenanceToggle(!maintenanceMode)}
                                        className={\`w-12 h-6 rounded-full transition-colors relative \${maintenanceMode ? "bg-amber-500" : "bg-gray-300 dark:bg-gray-700"}\`}>`;

if (code.includes(buttonTarget1)) {
    // replace all occurrences
    code = code.replace(new RegExp(buttonTarget1.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g'), newButton1);
}

// 4. Inject Modal UI at the bottom before </Layout>
const modalUI = `
            {/* Maintenance Modal */}
            <AnimatePresence>
                {showMaintenanceModal && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className={\`w-full max-w-md \${cardBg} rounded-2xl border border-border p-6 shadow-2xl\`}
                        >
                            <h3 className={\`text-xl font-bold mb-2 \${text}\`}>Enable Maintenance Mode</h3>
                            <p className={\`text-sm \${subtext} mb-6\`}>Configure the maintenance page displayed to users.</p>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className={\`block text-xs font-bold mb-2 \${subtext}\`}>Estimated Duration (Minutes)</label>
                                    <input 
                                        type="number" 
                                        value={maintenanceMinutes}
                                        onChange={e => setMaintenanceMinutes(e.target.value)}
                                        placeholder="e.g. 60 (Leave empty for indefinite)"
                                        className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                                <div>
                                    <label className={\`block text-xs font-bold mb-2 \${subtext}\`}>Custom Remark</label>
                                    <textarea 
                                        value={maintenanceRemark}
                                        onChange={e => setMaintenanceRemark(e.target.value)}
                                        placeholder="e.g. We are upgrading the database..."
                                        rows={3}
                                        className="w-full bg-surface border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button 
                                    onClick={() => setShowMaintenanceModal(false)}
                                    className={\`px-4 py-2 rounded-lg text-sm font-bold \${subtext} hover:bg-surface transition-colors\`}
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmMaintenance}
                                    className="px-4 py-2 rounded-lg text-sm font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                                >
                                    Start Maintenance
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
`;

const layoutEnd = `</Layout>`;
const newLayoutEnd = modalUI + `\n        </Layout>`;

if (code.includes(layoutEnd)) {
    code = code.replace(layoutEnd, newLayoutEnd);
}

fs.writeFileSync('src/pages/admin/index.tsx', code);
console.log('admin/index.tsx updated with modal');
