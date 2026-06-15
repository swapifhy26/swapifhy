import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Layout } from "../components/Layout";
import { useEffect } from "react";
import { API_URL } from "../lib/api";

export default function App({ Component, pageProps }: AppProps) {
    
    // ✅ Keep user marked as online while browsing any page
    useEffect(() => {
        const token = localStorage.getItem("swapifhy_token");
        if (!token) return;

        const beat = () => fetch(`${API_URL}/api/chat/heartbeat`, {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        }).catch(() => {});

        beat(); // immediate on page load
        const interval = setInterval(beat, 25000); // every 25s
        return () => clearInterval(interval);
    }, []);

    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}
