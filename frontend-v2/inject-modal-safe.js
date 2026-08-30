const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');

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
                            className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-2xl"
                        >
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">Enable Maintenance Mode</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Configure the maintenance page displayed to users.</p>
                            
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold mb-2 text-gray-500 dark:text-gray-400">Estimated Duration (Minutes)</label>
                                    <input 
                                        type="number" 
                                        value={maintenanceMinutes}
                                        onChange={e => setMaintenanceMinutes(e.target.value)}
                                        placeholder="e.g. 60 (Leave empty for indefinite)"
                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold mb-2 text-gray-500 dark:text-gray-400">Custom Remark</label>
                                    <textarea 
                                        value={maintenanceRemark}
                                        onChange={e => setMaintenanceRemark(e.target.value)}
                                        placeholder="e.g. We are upgrading the database..."
                                        rows={3}
                                        className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 resize-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button 
                                    onClick={() => setShowMaintenanceModal(false)}
                                    className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
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

// Using regex to match the end of the file safely regardless of CRLF or LF
const endRegex = /<\/>\s*\);\s*}\s*$/;
if (endRegex.test(code) && !code.includes('Maintenance Modal')) {
    code = code.replace(endRegex, modalUI + '\n        </>\n    );\n}');
    fs.writeFileSync('src/pages/admin/index.tsx', code);
    console.log('Successfully injected Maintenance Modal UI!');
} else {
    console.log('Failed or already exists');
}
