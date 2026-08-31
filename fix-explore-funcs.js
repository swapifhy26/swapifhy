const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

const oldHandleSyncRegex = /const handleSync = async \([\s\S]*?\} catch \(err\) \{ console\.error\(err\); \}\s*\};/;

const newHandleSync = `
    const handleSync = async () => {
        if (!syncTarget) return;
        if (selectedSkills.length === 0) {
            alert("Please select at least one skill to learn.");
            return;
        }
        setSyncing(true);
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(\`\${API_URL}/api/chat/sync\`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": \`Bearer \${token}\` },
                body: JSON.stringify({ receiverId: syncTarget.id, skillsToLearn: selectedSkills })
            });
            const data = await res.json();
            if (data.swapId) {
                // Refresh swaps to update button UI
                fetch(\`\${API_URL}/api/chat/conversations\`, { headers: { "Authorization": \`Bearer \${token}\` } })
                    .then(r => r.json()).then(d => { if (d.conversations) setMySwaps(d.conversations); });
                setXpToast({ show: true, amount: 50, text: "Swap Requested!" });
                setTimeout(() => setXpToast(s => ({ ...s, show: false })), 3000);
            } else if (data.error) {
                alert(data.error);
            }
        } catch (err) { console.error(err); }
        setSyncTarget(null);
        setSelectedSkills([]);
        setSyncing(false);
    };

    const initiateSyncPrompt = (user: any) => {
        setSyncTarget(user);
        setSelectedSkills([]);
    };
`;

if (code.match(oldHandleSyncRegex)) {
    code = code.replace(oldHandleSyncRegex, newHandleSync);
    fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
    console.log("Successfully replaced handleSync and defined initiateSyncPrompt!");
} else {
    console.log("Could NOT find handleSync to replace!");
}
