const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// I will extract the blocks using regex carefully

// 1. The start of the desktop links
const desktopLinksStart = code.indexOf('<div className="hidden md:flex items-center gap-8 lg:gap-11 text-sm font-semibold text-foreground tracking-tight">');
if (desktopLinksStart === -1) throw new Error("Could not find desktop links start");

// 2. The start of Theme toggle
const themeToggleStart = code.indexOf('{/* Theme Toggle Button */}');
if (themeToggleStart === -1) throw new Error("Could not find Theme Toggle start");

// 3. The end of the navbar
const navEnd = code.indexOf('</nav>');

// We have 3 pieces:
// pieceA: Everything up to (but not including) Theme toggle
// pieceB: Theme toggle and profile and everything else up to </nav>

let pieceA = code.substring(0, themeToggleStart);
let pieceB = code.substring(themeToggleStart, navEnd);
let pieceC = code.substring(navEnd); // </nav> and below

// Wait, the `hidden md:flex` div that contains pieceA closes currently in pieceB!
// Specifically, it closes right before `</div>\n            </div>\n        </nav>`
// We need to CLOSE the `hidden md:flex` at the end of pieceA.
// And wrap pieceB in a new `<div className="flex items-center gap-4">`

pieceA = pieceA + `
                </div> {/* End of desktop links */}

                <div className="flex items-center gap-4 md:gap-6"> {/* Start of right side controls */}
                    `;

// Now, pieceB ends with:
// `                    )}
//                 </div>
//             </div>`
// We need to remove the first `</div>` because that belonged to the desktop links, but we are reusing it to close our new right-side controls div!

// Wait, my recent regex modified pieceB slightly:
/*
                        </>
                    ) : (
                        <Link href="/auth" ...>
                            Log In
                        </Link>
                    )}
                </div>
            </div>
*/

// Let's just find the last occurrence of `</div>\n            </div>` in pieceB and replace it.
const closingPattern = /<\/div>\s*<\/div>\s*$/;
if (!closingPattern.test(pieceB.trimEnd())) {
    throw new Error("Could not find closing pattern in pieceB: " + pieceB.slice(-100));
}

// Just keep it exactly as it is, because pieceA added an open div, so pieceB's closing divs will perfectly match!
// Wait!
// pieceA: opened `<nav><div justify-between>` (2 open)
// pieceA: opened `div hidden md:flex` (3 open)
// pieceA: we append `</div>` (2 open)
// pieceA: we append `<div flex items-center>` (3 open)
// pieceB: contains the rest of the code, which ends with `</div></div>` (1 open)
// pieceC: contains `</nav>` (0 open)
// This perfectly balances the HTML!

// Wait, there's one catch. The `hidden md:flex` around the desktop links ONLY hides the links.
// So on mobile, `pieceA`'s links are hidden. `pieceB` (Theme toggle, Mobile Logout, Desktop Profile) will be visible!

let newCode = pieceA + pieceB + pieceC;

fs.writeFileSync('src/components/Navbar.tsx', newCode);
console.log('Restructured Navbar layout successfully');
