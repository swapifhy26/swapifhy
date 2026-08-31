const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/feed.tsx', 'utf8');

code = code.replace(
    /formatDate\(post\.createdAt\)/g,
    `new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })`
);

code = code.replace(
    /formatDate\(comment\.createdAt\)/g,
    `new Date(comment.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })`
);

fs.writeFileSync('frontend-v2/src/pages/feed.tsx', code);
console.log("Fixed formatDate ReferenceError");
