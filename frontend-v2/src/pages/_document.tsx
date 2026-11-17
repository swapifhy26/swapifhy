import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <meta name="description" content="Learn with people. Not from them. Swapifhy peer skill exchange." />
                <link rel="manifest" href="/manifest.json" />
                <meta name="theme-color" content="#4F46E5" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                <meta name="apple-mobile-web-app-title" content="Swapifhy" />
                <link rel="apple-touch-icon" href="/images/features/swapifhy-logo-DPxPDdg-.png" />
                <link rel="icon" type="image/png" href="/images/features/swapifhy-logo-DPxPDdg-.png" />
                
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700;800;900&family=Quicksand:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet" />
            </Head>
            <body className="antialiased bg-zinc-950 text-zinc-50 font-sans">
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
