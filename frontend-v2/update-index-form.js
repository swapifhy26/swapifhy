const fs = require('fs');
let code = fs.readFileSync('src/pages/index.tsx', 'utf8');

const targetForm = `<form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget;
                                        const emailVal = (form.querySelector("#footer-email") as HTMLInputElement)?.value;
                                        if (emailVal) {
                                            window.location.href = \`mailto:hello@swapifhy.com?subject=Inquiry from \${emailVal}\`;
                                        }
                                    }}
                                    className="flex flex-col gap-2.5"
                                >
                                    <input
                                        id="footer-email"
                                        type="email" required placeholder="Your email address"
                                        className="w-full bg-foreground/5 border border-border rounded-xl py-2.5 px-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all font-sans"
                                    />
                                    <input
                                        type="text" placeholder="Subject (optional)"
                                        className="w-full bg-foreground/5 border border-border rounded-xl py-2.5 px-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all font-sans"
                                    />
                                    <button type="submit" className="w-full py-2.5 rounded-xl bg-foreground text-background font-sans font-semibold text-sm hover:bg-primary hover:text-white transition-all">
                                        Send Inquiry
                                    </button>
                                </form>`;

const newForm = `
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget;
                                        const emailVal = (form.querySelector("#footer-email") as HTMLInputElement)?.value;
                                        const subjectVal = (form.querySelector("#footer-subject") as HTMLInputElement)?.value;
                                        const btn = form.querySelector("#footer-btn") as HTMLButtonElement;
                                        
                                        if (emailVal) {
                                            btn.textContent = "Sending...";
                                            btn.disabled = true;
                                            try {
                                                const res = await fetch(\`\${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/api/auth/inquiries\`, {
                                                    method: "POST",
                                                    headers: { "Content-Type": "application/json" },
                                                    body: JSON.stringify({ email: emailVal, subject: subjectVal })
                                                });
                                                if (res.ok) {
                                                    btn.textContent = "Sent successfully!";
                                                    form.reset();
                                                    setTimeout(() => { btn.textContent = "Send Inquiry"; btn.disabled = false; }, 3000);
                                                } else {
                                                    btn.textContent = "Failed. Try again.";
                                                    btn.disabled = false;
                                                }
                                            } catch (error) {
                                                btn.textContent = "Error. Try again.";
                                                btn.disabled = false;
                                            }
                                        }
                                    }}
                                    className="flex flex-col gap-2.5"
                                >
                                    <input
                                        id="footer-email"
                                        type="email" required placeholder="Your email address"
                                        className="w-full bg-foreground/5 border border-border rounded-xl py-2.5 px-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all font-sans"
                                    />
                                    <input
                                        id="footer-subject"
                                        type="text" placeholder="Subject (optional)"
                                        className="w-full bg-foreground/5 border border-border rounded-xl py-2.5 px-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all font-sans"
                                    />
                                    <button id="footer-btn" type="submit" className="w-full py-2.5 rounded-xl bg-gray-900 dark:bg-primary text-white font-sans font-semibold text-sm hover:bg-gray-800 dark:hover:bg-primary/90 hover:shadow-lg transition-all shadow-sm">
                                        Send Inquiry
                                    </button>
                                </form>`;

if (code.includes(targetForm)) {
    code = code.replace(targetForm, newForm);
    fs.writeFileSync('src/pages/index.tsx', code);
    console.log('index.tsx form updated');
} else {
    console.log('Target form not found in index.tsx');
}
