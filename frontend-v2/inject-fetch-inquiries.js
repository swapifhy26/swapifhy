const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');

const targetStr = `const loadSettings = useCallback(async () => { 
        const d = await apiFetch("/api/admin/settings"); 
        if (d) setSettings(d); 
    }, [apiFetch]);`;

// Need to match exactly what is there for loadSettings
// Instead, let's just use regex to insert after loadWaitlist if loadSettings spans multiple lines.
const regex = /const loadSettings = useCallback\(async \(\) => \{[\s\S]*?\}, \[apiFetch\]\);/;

if (code.match(regex)) {
    code = code.replace(
        regex,
        match => match + '\n    const fetchInquiries = useCallback(async () => { const res = await apiFetch("/api/admin/inquiries"); if (res) setInquiries(res); }, [apiFetch]);'
    );
    fs.writeFileSync('src/pages/admin/index.tsx', code);
    console.log('Successfully injected fetchInquiries function.');
} else {
    console.log('Failed to match loadSettings.');
}
