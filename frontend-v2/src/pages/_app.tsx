import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Layout } from "../components/Layout";
import { useEffect } from "react";
import { API_URL } from "../lib/api";
import MaintenancePage from "../components/MaintenancePage";
import OfflinePage from "../components/OfflinePage";
import { useRouter } from "next/router";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
    const [isMaintenance, setIsMaintenance] = useState(false);
    const [maintenanceRemark, setMaintenanceRemark] = useState("");
    const [maintenanceEndTime, setMaintenanceEndTime] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);
    const router = useRouter();
    const isAdminRoute = router.pathname.startsWith('/admin');


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

    useEffect(() => {
        const checkHealth = async () => {
            try {
                const res = await fetch(`${API_URL}/api/health`);
                const data = await res.json();
                if (data.maintenanceMode) {
                    setIsMaintenance(true);
                    setMaintenanceRemark(data.maintenanceRemark || "");
                    setMaintenanceEndTime(data.maintenanceEndTime || null);
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

    // Also clear token logic inside the beat? The beat is already there.

    useEffect(() => {
        const beat = () => {
            // Read token fresh on every beat — handles login/logout mid-session
            const token = localStorage.getItem("swapifhy_token");
            if (!token) return;
            fetch(`${API_URL}/api/chat/heartbeat`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            }).catch(() => {});
        };

        beat(); // immediate attempt on mount
        const interval = setInterval(beat, 25000); // retry every 25s
        return () => clearInterval(interval);
    }, []);

    
    if (isOffline) {
        return <OfflinePage />;
    }

    if (isMaintenance && !isAdminRoute) {
        return <MaintenancePage remark={maintenanceRemark} endTime={maintenanceEndTime} />;
    }

    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}
