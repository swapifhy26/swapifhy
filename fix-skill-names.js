const fs = require('fs');

let code = fs.readFileSync('frontend-v2/src/pages/explore.tsx', 'utf8');
code = code.replace(/syncTarget\.teachSkills/g, 'syncTarget.teaching');
fs.writeFileSync('frontend-v2/src/pages/explore.tsx', code);

let onboardingCode = fs.readFileSync('frontend-v2/src/pages/onboarding.tsx', 'utf8');
onboardingCode = onboardingCode.replace(/magicMatch\.teachSkills/g, 'magicMatch.teaching');
onboardingCode = onboardingCode.replace(/magicMatch\.learnSkills/g, 'magicMatch.learning');
fs.writeFileSync('frontend-v2/src/pages/onboarding.tsx', onboardingCode);

console.log("Fixed skill mapping property names");
