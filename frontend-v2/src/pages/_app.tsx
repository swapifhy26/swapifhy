import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Layout } from "../components/Layout";
import { useEffect } from "react";
import { API_URL } from "../lib/api";

export default function App({ Component, pageProps }: AppProps) {

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

    return (
        <Layout>
            <Component {...pageProps} />
        </Layout>
    );
}
