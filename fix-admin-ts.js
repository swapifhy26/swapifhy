const fs = require('fs');

let adminCode = fs.readFileSync('frontend-v2/src/pages/admin/index.tsx', 'utf8');

// Add Eye icon
if (!adminCode.includes(" Eye,")) {
    adminCode = adminCode.replace(
        /import \{/,
        'import { Eye,'
    );
}

// Ensure fetchTickets is defined correctly
const findMissingFetchTickets = adminCode.includes("const fetchTickets = async () => {");
if (!findMissingFetchTickets) {
    adminCode = adminCode.replace(
        /const fetchInquiries = async \(\) => \{[\s\S]*?catch \(err\) \{[\s\S]*?\}\n    \};/,
        (match) => match + '\n    const fetchTickets = async () => {\n        try {\n            const res = await apiFetch("/api/admin/tickets");\n            if (res.tickets) setTickets(res.tickets);\n        } catch (err) {}\n    };\n'
    );
}

fs.writeFileSync('frontend-v2/src/pages/admin/index.tsx', adminCode);
console.log("Fixed missing definitions in admin/index.tsx");
