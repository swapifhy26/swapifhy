const fs = require('fs');
let code = fs.readFileSync('src/pages/_app.tsx', 'utf8');

// We need to inject MaintenancePage
const importStatement = `import MaintenancePage from "../components/MaintenancePage";\nimport { useRouter } from "next/router";\nimport { useState } from "react";`;

if (!code.includes('import MaintenancePage')) {
    code = code.replace('import { API_URL } from "../lib/api";', `import { API_URL } from "../lib/api";\n${importStatement}`);
}

const targetApp = `export default function App({ Component, pageProps }: AppProps) {`;

const newAppBody = `export default function App({ Component, pageProps }: AppProps) {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const router = useRouter();
    const isAdminRoute = router.pathname.startsWith('/admin');

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch(\`\${API_URL}/api/health\`);
                const data = await res.json();
                if (data.maintenanceMode) {
                    setIsMaintenance(true);
                } else {
                    setIsMaintenance(false);
                }
            } catch (e) {
                // Ignore network errors here
            }
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    // Also clear token logic inside the beat? The beat is already there.`;

if (code.includes(targetApp)) {
    code = code.replace(targetApp, newAppBody);
}

// Modify the beat useEffect
const beatTarget = `useEffect(() => {
        const beat = () => {`;

const newBeat = `useEffect(() => {
        const beat = () => {`;

if (code.includes(beatTarget)) {
    // we don't need to change beat actually.
}

// Replace the return statement
const returnTarget = `return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );`;

const newReturn = `
    if (isMaintenance && !isAdminRoute) {
        return <MaintenancePage />;
    }

    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );`;

if (code.includes(returnTarget)) {
    code = code.replace(returnTarget, newReturn);
    fs.writeFileSync('src/pages/_app.tsx', code);
    console.log('_app.tsx updated with Maintenance mode check');
} else {
    console.log('Failed to find return target in _app.tsx');
}
