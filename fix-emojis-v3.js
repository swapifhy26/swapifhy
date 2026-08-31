const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');

const badMatchStr1 = `{isHighMatch ? "🔥" : "💡"} {matchScore}% Match`;
const badMatchStr2 = `{isHighMatch ? "" : ""} {matchScore}% Match`;
const badMatchStr3 = `{isHighMatch ? "dY"" : "o""} {matchScore}% Match`;

const goodMatchStr = `<span dangerouslySetInnerHTML={{ __html: isHighMatch ? '&#x1F525;' : '&#x2728;' }} /> {matchScore}% Match`;

if (code.includes(badMatchStr1)) {
    code = code.replace(badMatchStr1, goodMatchStr);
} else if (code.includes(badMatchStr2)) {
    code = code.replace(badMatchStr2, goodMatchStr);
} else {
    // just replace the whole line if we can't find it
    const regex = /\{isHighMatch \? "[^"]*" : "[^"]*"\} \{matchScore\}% Match/;
    code = code.replace(regex, goodMatchStr);
}

fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);
console.log("Fixed emojis");
