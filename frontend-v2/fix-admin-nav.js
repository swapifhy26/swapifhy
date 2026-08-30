const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/index.tsx', 'utf8');

// Use a simple regex to add the nav item
const targetNav = /{ id: "waitlist", label: "Waitlist", icon: Mail },/g;
const newNav = `{ id: "waitlist", label: "Waitlist", icon: Mail },
    { id: "inquiries", label: "Inquiries", icon: MessageSquare },`;

if (code.match(targetNav) && !code.includes('id: "inquiries"')) {
    code = code.replace(targetNav, newNav);
    console.log('Nav item added');
}

fs.writeFileSync('src/pages/admin/index.tsx', code);
