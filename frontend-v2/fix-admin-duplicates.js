const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');

// Remove duplicate state
code = code.replace(/const \[inquiries, setInquiries\] = useState<any\[\]>\(\[\]\);\r?\n\s*const \[inquiries, setInquiries\] = useState<any\[\]>\(\[\]\);/g, 'const [inquiries, setInquiries] = useState<any[]>([]);');

// Remove duplicate fetchInquiries function
code = code.replace(/const fetchInquiries = async \(\) => \{\r?\n\s*const res = await apiFetch\("\/api\/admin\/inquiries"\);\r?\n\s*if \(res\) setInquiries\(res\);\r?\n\s*\};\r?\n\r?\n\s*const fetchInquiries = async \(\) => \{\r?\n\s*const res = await apiFetch\("\/api\/admin\/inquiries"\);\r?\n\s*if \(res\) setInquiries\(res\);\r?\n\s*\};/g, `const fetchInquiries = async () => {\n        const res = await apiFetch("/api/admin/inquiries");\n        if (res) setInquiries(res);\n    };`);

// Remove duplicate fetchInquiries() in useEffect
code = code.replace(/fetchInquiries\(\);\r?\n\s*fetchInquiries\(\);/g, 'fetchInquiries();');

fs.writeFileSync('src/pages/admin/index.tsx', code);
