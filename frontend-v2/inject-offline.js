const fs = require('fs');
let code = fs.readFileSync('src/pages/_app.tsx', 'utf8');

if (!code.includes('import OfflinePage')) {
    code = code.replace(
        'import MaintenancePage from "../components/MaintenancePage";',
        'import MaintenancePage from "../components/MaintenancePage";\nimport OfflinePage from "../components/OfflinePage";'
    );
}

if (!code.includes('const [isOffline, setIsOffline] = useState(false);')) {
    // Inject the isOffline state right after the maintenance states
    code = code.replace(
        'const [maintenanceEndTime, setMaintenanceEndTime] = useState<string | null>(null);',
        'const [maintenanceEndTime, setMaintenanceEndTime] = useState<string | null>(null);\n    const [isOffline, setIsOffline] = useState(false);'
    );

    // Inject the useEffect for online/offline listeners
    const useEffectOffline = `
    useEffect(() => {
        if (typeof window !== "undefined") {
            setIsOffline(!navigator.onLine);
            const handleOnline = () => setIsOffline(false);
            const handleOffline = () => setIsOffline(true);
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
            };
        }
    }, []);
`;
    code = code.replace(
        '    useEffect(() => {',
        useEffectOffline + '\n    useEffect(() => {'
    );

    // Render OfflinePage if offline
    code = code.replace(
        '    if (isMaintenance && !isAdminRoute) {',
        '    if (isOffline) {\n        return <OfflinePage />;\n    }\n\n    if (isMaintenance && !isAdminRoute) {'
    );
}

fs.writeFileSync('src/pages/_app.tsx', code);
console.log("Injected OfflinePage logic into _app.tsx");
