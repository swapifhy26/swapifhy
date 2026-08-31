const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/feed.tsx', 'utf8');

// Update the buttons in the "create post" form
code = code.replace(
    /\(\["UPDATE", "OFFER", "REQUEST"\] as const\)/g,
    '(["UPDATE", "OFFER", "REQUEST", "BOUNTY"] as const)'
);

// Update typeColor logic in the creation form
code = code.replace(
    /const typeColor = type === "OFFER" \? "secondary" : type === "REQUEST" \? "accent" : "primary";/g,
    'const typeColor = type === "BOUNTY" ? "orange-500" : type === "OFFER" ? "secondary" : type === "REQUEST" ? "accent" : "primary";'
);

// Update postColor logic in the feed rendering
code = code.replace(
    /const postColor = post\.type === "OFFER" \? "text-secondary" : post\.type === "REQUEST" \? "text-accent" : "text-primary";/g,
    'const postColor = post.type === "BOUNTY" ? "text-orange-500" : post.type === "OFFER" ? "text-secondary" : post.type === "REQUEST" ? "text-accent" : "text-primary";'
);

// Update bgGlowRef logic in the feed rendering
code = code.replace(
    /const bgGlowRef = post\.type === "OFFER" \? "from-secondary\/10" : post\.type === "REQUEST" \? "from-accent\/10" : "from-primary\/10";/g,
    'const bgGlowRef = post.type === "BOUNTY" ? "from-orange-500/15" : post.type === "OFFER" ? "from-secondary/10" : post.type === "REQUEST" ? "from-accent/10" : "from-primary/10";'
);

// Additionally, for BOUNTY, maybe we want an emoji to show in the tag, e.g. 🚨 BOUNTY.
// Let's modify the tag rendering for the post:
const badgeRegex = /<span className=\{\`w-1\.5 h-1\.5 rounded-full \$\{postColor\.replace\('text-', 'bg-'\)\}\`\} \/>\s*\{post\.type\}/g;
code = code.replace(badgeRegex, `<span className={\`w-1.5 h-1.5 rounded-full \${postColor.replace('text-', 'bg-')}\`} />\n                                                    {post.type === "BOUNTY" ? "🚨 BOUNTY" : post.type}`);

// For the button rendering in the creation form, also add the siren if it's bounty:
const buttonLabelRegex = /\{isActive && <motion\.div layoutId="broadcast-dot" className=\{\`w-1\.5 h-1\.5 rounded-full bg-\$\{typeColor\}\`\} \/>\}\s*\{type\}/g;
code = code.replace(buttonLabelRegex, `{isActive && <motion.div layoutId="broadcast-dot" className={\`w-1.5 h-1.5 rounded-full bg-\${typeColor}\`} />}\n                                                {type === "BOUNTY" ? "🚨 BOUNTY" : type}`);


fs.writeFileSync('frontend-v2/src/pages/feed.tsx', code);
console.log("Injected BOUNTY type into feed.tsx");
