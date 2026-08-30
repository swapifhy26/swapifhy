const fs = require('fs');
let code = fs.readFileSync('src/components/ChatPanel.tsx', 'utf8');

const badBlock = `    const [currentUserId, setCurrentUserId] = useState("");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("swapifhy_user") || "{}");
        if (user.id) setCurrentUserId(user.id);
    }, []);

    if (!currentUserId) return null;`;

const goodBlock = `    const [currentUserId, setCurrentUserId] = useState(() => {
        if (typeof window !== "undefined") {
            const user = JSON.parse(localStorage.getItem("swapifhy_user") || "{}");
            return user.id || "";
        }
        return "";
    });`;

if (code.includes(badBlock)) {
    code = code.replace(badBlock, goodBlock);
    fs.writeFileSync('src/components/ChatPanel.tsx', code);
    console.log("Fixed hook order violation in ChatPanel");
} else {
    console.log("Could not find badBlock");
}
