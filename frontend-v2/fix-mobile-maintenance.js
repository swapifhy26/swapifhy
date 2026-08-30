const fs = require('fs');
let code = fs.readFileSync('src/components/MaintenancePage.tsx', 'utf8');

// Fix 1: min-h-[100dvh] and strict overflow hidden
const targetMain = `className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden font-sans text-foreground selection:bg-primary/40 selection:text-white"`;
const newMain = `className="min-h-[100dvh] w-full bg-background flex flex-col items-center justify-center relative overflow-hidden font-sans text-foreground selection:bg-primary/40 selection:text-white"`;

if (code.includes(targetMain)) {
    code = code.replace(targetMain, newMain);
}

// Fix 2: Reduce blur on mobile (prevent GPU glitches)
const targetOrb1 = `className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px]"`;
const newOrb1 = `className="absolute top-[-10%] left-[-10%] w-[80%] md:w-[50%] h-[50%] rounded-full bg-primary/20 blur-[60px] md:blur-[120px] mix-blend-screen"`;
if (code.includes(targetOrb1)) {
    code = code.replace(targetOrb1, newOrb1);
}

const targetOrb2 = `className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px]"`;
const newOrb2 = `className="absolute bottom-[-10%] right-[-10%] w-[80%] md:w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[60px] md:blur-[120px] mix-blend-screen"`;
if (code.includes(targetOrb2)) {
    code = code.replace(targetOrb2, newOrb2);
}

// Fix 3: Scale down the gear graphic on mobile
const targetGraphic = `className="relative mb-16 flex items-center justify-center h-48 w-48"`;
const newGraphic = `className="relative mb-12 md:mb-16 flex items-center justify-center h-40 w-40 md:h-48 md:w-48 scale-90 md:scale-100"`;
if (code.includes(targetGraphic)) {
    code = code.replace(targetGraphic, newGraphic);
}

// Fix 4: Typography sizing
const targetTitle = `className="text-4xl md:text-5xl font-black font-heading mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary pb-2"`;
const newTitle = `className="text-3xl md:text-5xl font-black font-heading mb-4 md:mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-white to-secondary pb-2 px-4"`;
if (code.includes(targetTitle)) {
    code = code.replace(targetTitle, newTitle);
}

const targetDesc = `className="text-lg md:text-xl text-muted-foreground/90 mb-12 max-w-lg leading-relaxed whitespace-pre-wrap"`;
const newDesc = `className="text-base md:text-xl text-muted-foreground/90 mb-8 md:mb-12 max-w-lg leading-relaxed whitespace-pre-wrap px-4"`;
if (code.includes(targetDesc)) {
    code = code.replace(targetDesc, newDesc);
}

// Fix 5: Container padding
const targetContainer = `className="relative z-10 flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto w-full"`;
const newContainer = `className="relative z-10 flex flex-col items-center justify-center p-4 md:p-8 text-center max-w-2xl mx-auto w-full h-full overflow-y-auto overflow-x-hidden"`;
if (code.includes(targetContainer)) {
    code = code.replace(targetContainer, newContainer);
}

fs.writeFileSync('src/components/MaintenancePage.tsx', code);
console.log('Mobile optimizations applied to MaintenancePage');
