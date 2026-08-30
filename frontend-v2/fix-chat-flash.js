const fs = require('fs');
let code = fs.readFileSync('src/components/ChatPanel.tsx', 'utf8');

const target = `    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("swapifhy_user") || "{}");
        if (user.id) setCurrentUserId(user.id);
    }, []);`;

const replacement = `    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("swapifhy_user") || "{}");
        if (user.id) setCurrentUserId(user.id);
    }, []);

    if (!currentUserId) return null;`;

if (code.includes(target) && !code.includes('if (!currentUserId) return null;')) {
    code = code.replace(target, replacement);
    fs.writeFileSync('src/components/ChatPanel.tsx', code);
    console.log("Added render guard for currentUserId in ChatPanel");
}
