const fs = require('fs');

let helpCode = fs.readFileSync('frontend-v2/src/pages/help.tsx', 'utf8');

const handleSubmitRegex = /const handleSubmit = \(e: React\.FormEvent\) => \{[\s\S]*?localStorage\.setItem\("swapifhy_tickets", JSON\.stringify\(updated\)\);/m;

const replacementHandleSubmit = `const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        const ticket = {
            id: "TKT-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
            type: activeTab,
            category: activeTab === "BUG" ? "Bug Report" : category,
            content,
            date: new Date().toLocaleString(),
            status: "OPEN"
        };

        const updated = [ticket, ...tickets];
        setTickets(updated);
        localStorage.setItem("swapifhy_tickets", JSON.stringify(updated));

        try {
            const token = localStorage.getItem("swapifhy_token");
            if (token) {
                // Ignore API_URL import issues, we can just fetch relative to window.location or use absolute
                // Wait, help.tsx might not have API_URL imported. Let's just use the absolute or standard prefix.
                // It's usually imported from lib/api. We'll require it or just use fetch(\`https://swapifhy-backend-iu0x.onrender.com/api/user/ticket\`)
                await fetch(\`https://swapifhy-backend-iu0x.onrender.com/api/user/ticket\`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': \`Bearer \${token}\`
                    },
                    body: JSON.stringify({
                        ticketId: ticket.id,
                        type: ticket.type,
                        category: ticket.category,
                        content: ticket.content
                    })
                });
            }
        } catch(err) {
            console.error("Failed to sync ticket to server", err);
        }`;

helpCode = helpCode.replace(handleSubmitRegex, replacementHandleSubmit);

fs.writeFileSync('frontend-v2/src/pages/help.tsx', helpCode);
console.log("Updated help.tsx to push tickets to backend");
