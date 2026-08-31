const fs = require('fs');
let code = fs.readFileSync('frontend-v2/src/pages/progress.tsx', 'utf8');

code = code.replace(
    `                                                    </button>\n                                                </div>\n\n                                            </div>`,
    `                                                    </button>\n\n                                            </div>`
);

fs.writeFileSync('frontend-v2/src/pages/progress.tsx', code);
console.log("Fixed JSX error in progress.tsx");
