const fs = require('fs');

let navbarCode = fs.readFileSync('frontend-v2/src/components/Navbar.tsx', 'utf8');

const replacementRegex = /<Link href="\/#team" className="text-muted-foreground hover:text-foreground transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-\[2px\] after:bottom-\[-4px\] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300">Core Network<\/Link>/;

const newLink = `<Link href="/#team" className="text-muted-foreground hover:text-foreground transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300">Core Network</Link>
                            <Link href="/help" className="text-muted-foreground hover:text-foreground transition-all duration-300 relative after:absolute after:w-full after:scale-x-0 after:h-[2px] after:bottom-[-4px] after:left-0 after:bg-primary hover:after:scale-x-100 after:origin-bottom-right hover:after:origin-bottom-left after:transition-transform after:duration-300">Help</Link>`;

navbarCode = navbarCode.replace(replacementRegex, newLink);

fs.writeFileSync('frontend-v2/src/components/Navbar.tsx', navbarCode);
console.log("Added Help button to Landing Page navigation bar.");
