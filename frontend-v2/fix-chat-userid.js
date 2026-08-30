const fs = require('fs');
let code = fs.readFileSync('src/components/ChatPanel.tsx', 'utf8');

// 1. Remove currentUserId from props interface
code = code.replace(/currentUserId: string;\s*}/, '}');

// 2. Remove from destructured props
code = code.replace(/export const ChatPanel = \(\{\s*swapId,\s*onClose,\s*currentUserId\s*\}\s*:\s*ChatPanelProps\)\s*=>\s*\{/, 'export const ChatPanel = ({ swapId, onClose }: ChatPanelProps) => {');

// 3. Add state inside ChatPanel
const stateInsert = `    const [isBridgeModalOpen, setIsBridgeModalOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState("");

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem("swapifhy_user") || "{}");
        if (user.id) setCurrentUserId(user.id);
    }, []);`;
    
code = code.replace(/const \[isBridgeModalOpen, setIsBridgeModalOpen\] = useState\(false\);/, stateInsert);

fs.writeFileSync('src/components/ChatPanel.tsx', code);
console.log('Fixed currentUserId bug in ChatPanel');
