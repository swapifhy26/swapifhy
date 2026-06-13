/**
 * Email each user their temporary login via Gmail SMTP.
 * Reads credentials.csv (email,"name",tempPassword) and sends a personalized email.
 *
 * Setup (in backend/.env):
 *   GMAIL_USER=you@gmail.com
 *   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx   # 16-char Google App Password (NOT your normal password)
 *   FRONTEND_URL=https://swapifhy.com     # used to build the login link
 *
 * Usage:
 *   npx tsx scripts/send-credentials.ts <path-to-credentials.csv> --dry-run
 *   npx tsx scripts/send-credentials.ts <path-to-credentials.csv> --limit=3   # send only first 3 (test)
 *   npx tsx scripts/send-credentials.ts <path-to-credentials.csv>             # send all
 *
 * Gmail free tier caps at ~500 sends/day. The script paces itself to avoid tripping limits.
 */
import * as dotenv from 'dotenv'; dotenv.config();
import fs from 'fs';
import nodemailer from 'nodemailer';

const LOGIN_BASE = (process.env.FRONTEND_URL || 'https://swapifhy.com').split(',')[0].trim();

function parseRows(csvPath: string) {
    const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(l => l.trim() !== '');
    lines.shift(); // header: email,name,tempPassword
    return lines.map(line => {
        const m = line.match(/^([^,]+),"(.*)",([^,]+)$/);
        if (m) return { email: m[1].trim(), name: m[2].trim(), password: m[3].trim() };
        const p = line.split(',');
        return { email: (p[0] || '').trim(), name: (p[1] || '').trim(), password: (p[2] || '').trim() };
    }).filter(r => r.email && r.password);
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const limitArg = args.find(a => a.startsWith('--limit='));
    const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : Infinity;
    const csvPath = args.find(a => !a.startsWith('--'));

    if (!csvPath || !fs.existsSync(csvPath)) {
        console.error('Usage: npx tsx scripts/send-credentials.ts <credentials.csv> [--dry-run] [--limit=N]');
        process.exit(1);
    }

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_APP_PASSWORD;
    if (!dryRun && (!user || !pass)) {
        console.error('Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env first.');
        process.exit(1);
    }

    const rows = parseRows(csvPath).slice(0, limit);
    console.log(`${dryRun ? '[DRY RUN] ' : ''}Will send to ${rows.length} recipient(s). Login base: ${LOGIN_BASE}`);

    const transporter = dryRun ? null : nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    let sent = 0, failed = 0;

    for (const r of rows) {
        const subject = 'Your Swapifhy account is ready';
        const text =
`Hi ${r.name || 'there'},

Your Swapifhy account is ready. You're in the limited beta!

Log in here: ${LOGIN_BASE}/auth
  Email:    ${r.email}
  Password: ${r.password}

Please change your password right after logging in:
Settings -> Update Password.

See you inside,
The Swapifhy Team`;

        if (dryRun) { console.log(`  [dry] would email ${r.email}`); sent++; continue; }

        try {
            await transporter!.sendMail({ from: `Swapifhy <${user}>`, to: r.email, subject, text });
            sent++;
            if (sent % 25 === 0) console.log(`  sent ${sent}/${rows.length}...`);
            await sleep(700); // pace ~85/min to stay friendly with Gmail limits
        } catch (e: any) {
            failed++;
            console.error(`  FAIL ${r.email}: ${e.message}`);
        }
    }

    console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Done. Sent: ${sent}, Failed: ${failed}`);
}

main().catch(e => { console.error(e); process.exit(1); });
