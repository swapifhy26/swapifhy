const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/feed.tsx', 'utf8');

// Fix 1: post.content?.replace
code = code.replace(
    /dangerouslySetInnerHTML=\{\{ __html: post\.content\.replace/g,
    'dangerouslySetInnerHTML={{ __html: (post.content || "").replace'
);

// Fix 2: comment.user?.avatarUrl
code = code.replace(/comment\.user\.avatarUrl/g, 'comment.user?.avatarUrl');
code = code.replace(/comment\.user\.name/g, 'comment.user?.name');

fs.writeFileSync('frontend-v2/src/pages/feed.tsx', code);
console.log("Patched potential client-side crashes");
