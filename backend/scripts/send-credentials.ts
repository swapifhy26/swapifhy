/**
 * Email each user their temporary login (Swapifhy beta invite) via Gmail SMTP.
 * Reads credentials.csv (email,"name",tempPassword) and sends a personalized HTML email.
 *
 * Setup (in backend/.env):
 *   GMAIL_USER=swapifhy.official@gmail.com
 *   GMAIL_APP_PASSWORD=xxxxxxxxxxxxxxxx
 *   FRONTEND_URL=https://swapifhy.com
 *   TERMS_URL=https://docs.google.com/document/d/.../edit?usp=sharing
 *   BANNER_URL=https://swapifhy.com/images/launch-banner.jpg
 *
 * Usage:
 *   npx tsx scripts/send-credentials.ts <credentials.csv> --dry-run
 *   npx tsx scripts/send-credentials.ts <credentials.csv> --limit=3
 *   npx tsx scripts/send-credentials.ts <credentials.csv>
 */
import * as dotenv from 'dotenv'; dotenv.config();
import fs from 'fs';
import nodemailer from 'nodemailer';

const LOGIN_BASE = (process.env.FRONTEND_URL || 'https://swapifhy.com').split(',')[0].trim();
const LOGIN_URL = `${LOGIN_BASE}/auth`;
const BETA_FORM_URL = 'https://tally.so/r/GxbXkk';
const TERMS_URL = process.env.TERMS_URL || '';
const BANNER_URL = process.env.BANNER_URL || '';
const SUBJECT = 'Welcome to Swapifhy — your beta access is inside';

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

function buildText(name: string, email: string, passcode: string) {
    const terms = TERMS_URL
        ? `By logging in and creating your profile, you agree to our Terms & Guidelines: ${TERMS_URL}`
        : `By logging in and creating your profile, you agree to our Terms & Guidelines.`;
    return `Hi ${name || 'there'},

The Swapifhy MVP is live — and you're one of the first people we're inviting in.

You joined us early, so you get access before we open to everyone. This is the first working version of what we've been building for months, and the people using it now are the ones who'll help shape where it goes.

YOUR LOGIN DETAILS
  Email:    ${email}
  Passcode: ${passcode}
  Log in:   ${LOGIN_URL}

For your security, please change your password right after logging in: Settings -> Update Password.

Once you're in, set up your profile and start connecting with people based on what you want to learn and teach.

As an early member, you'll:
  - Get first access to the upcoming Swapifhy newsletter — behind-the-scenes builds, drops, and new features (reserved for our first 50 users)
  - Directly shape the product through your feedback as we grow
  - Be part of the very first community inside Swapifhy, before public launch

We'd love your feedback after trying the product: ${BETA_FORM_URL}

${terms}

We're still early, so if anything breaks or feels off, that's exactly what we want to hear — we're building Swapifhy with you, not just for you.

See you inside,
The Swapifhy Team

—
You're receiving this because you joined the Swapifhy waitlist. Questions? Just reply to this email.`;
}

function buildHtml(name: string, email: string, passcode: string) {
    const banner = BANNER_URL
        ? `<img src="${BANNER_URL}" alt="The Swapifhy MVP is launching now" style="width:100%;display:block;" />`
        : '';
    const termsLine = TERMS_URL
        ? `By logging in and creating your profile, you agree to our <a href="${TERMS_URL}" style="color:#7c6cff;text-decoration:underline;">Terms &amp; Guidelines</a>.`
        : `By logging in and creating your profile, you agree to our Terms &amp; Guidelines.`;
    return `<div style="background:#f4f3f7;padding:24px 12px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #ece9f5;">
    ${banner}
    <div style="padding:32px 36px;color:#1a1a1a;font-size:15px;line-height:1.65;">
      <p style="margin:0 0 16px;font-size:16px;">Hi ${esc(name) || 'there'},</p>
      <p style="margin:0 0 16px;"><strong>The Swapifhy MVP is live</strong> — and you're one of the first people we're inviting in.</p>
      <p style="margin:0 0 24px;">You joined us early, so you get access before we open it to everyone. This is the first working version of what we've been building for months, and the people using it now are the ones who'll help shape where it goes.</p>

      <div style="background:#f7f6fc;border:1px solid #e6e2f5;border-radius:12px;padding:22px 24px;margin:0 0 24px;">
        <p style="margin:0 0 14px;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#8a82a8;font-weight:700;">Your login details</p>
        <p style="margin:0 0 6px;">Email: <strong>${esc(email)}</strong></p>
        <p style="margin:0 0 20px;">Temporary passcode: <strong>${esc(passcode)}</strong></p>
        <a href="${LOGIN_URL}" style="display:inline-block;background:#7c6cff;color:#ffffff;text-decoration:none;padding:13px 30px;border-radius:999px;font-weight:600;font-size:14px;">Log in to Swapifhy →</a>
        <p style="margin:16px 0 0;font-size:13px;color:#6b6b6b;">For your security, please change your password right after logging in: <strong>Settings → Update Password</strong>.</p>
      </div>

      <p style="margin:0 0 24px;">Once you're in, set up your profile and start connecting with people based on what you want to learn and teach.</p>

      <p style="margin:0 0 8px;font-weight:600;">As an early member, you'll:</p>
      <ul style="margin:0 0 24px;padding-left:20px;color:#333333;">
        <li style="margin-bottom:7px;">Get first access to the upcoming Swapifhy newsletter — behind-the-scenes builds, drops, and new features (reserved for our first 50 users)</li>
        <li style="margin-bottom:7px;">Directly shape the product through your feedback as we grow</li>
        <li style="margin-bottom:7px;">Be part of the very first community inside Swapifhy, before public launch</li>
      </ul>

      <p style="margin:0 0 24px;">We'd love your feedback — please <a href="${BETA_FORM_URL}" style="color:#7c6cff;">share it here</a> after trying the product.</p>

      <p style="margin:0 0 24px;font-size:13px;color:#6b6b6b;">${termsLine}</p>

      <p style="margin:0 0 24px;">We're still early, so if anything breaks or feels off, that's exactly what we want to hear — we're building Swapifhy <em>with</em> you, not just for you.</p>

      <p style="margin:0;">See you inside,<br/><strong>The Swapifhy Team</strong></p>
    </div>
    <div style="padding:18px 36px;background:#faf9fc;border-top:1px solid #ece9f5;color:#9a96a8;font-size:12px;line-height:1.5;">
      You're receiving this because you joined the Swapifhy waitlist. Questions? Just reply to this email.
    </div>
  </div>
</div>`;
}

function parseRows(csvPath: string) {
    const lines = fs.readFileSync(csvPath, 'utf8').split(/\r?\n/).filter(l => l.trim() !== '');
    lines.shift();
    return lines.map(line => {
        const m = line.match(/^([^,]+),"(.*)",([^,]+)$/);
        if (m) return { email: m[1].trim(), name: m[2].trim(), password: m[3].trim() };
        const p = line.split(',');
        return { email: (p[0] || '').trim(), name: (p[1] || '').trim(), password: (p[2] || '').trim() };
    }).filter(r => r.email && r.password);
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function sendWithRetry(transporter: any, mail: any, attempts = 3): Promise<void> {
    let lastErr: any;
    for (let i = 1; i <= attempts; i++) {
        try { await transporter.sendMail(mail); return; }
        catch (e: any) { lastErr = e; if (i < attempts) await sleep(1500 * i); }
    }
    throw lastErr;
}

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
    const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    if (!dryRun && (!user || !pass)) {
        console.error('Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env first.');
        process.exit(1);
    }

    const rows = parseRows(csvPath).slice(0, limit);
    console.log(`${dryRun ? '[DRY RUN] ' : ''}Will send to ${rows.length} recipient(s). Login: ${LOGIN_URL}`);
    if (!TERMS_URL) console.log('  NOTE: TERMS_URL not set — terms link will read "(no link)".');
    if (!BANNER_URL) console.log('  NOTE: BANNER_URL not set — sending without the banner image.');

    const transporter = dryRun ? null : nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    const failures: string[] = [];
    let sent = 0;

    for (const r of rows) {
        if (dryRun) { console.log(`  [dry] would email ${r.email}`); sent++; continue; }
        try {
            await sendWithRetry(transporter, {
                from: `Swapifhy <${user}>`,
                to: r.email,
                subject: SUBJECT,
                text: buildText(r.name, r.email, r.password),
                html: buildHtml(r.name, r.email, r.password),
            });
            sent++;
            if (sent % 25 === 0) console.log(`  sent ${sent}/${rows.length}...`);
            await sleep(700);
        } catch (e: any) {
            failures.push(`${r.email},"${r.name}",${r.password}`);
            console.error(`  FAIL ${r.email}: ${e.message}`);
        }
    }

    if (failures.length) {
        const failPath = csvPath.replace(/\.csv$/, '') + '.failures.csv';
        fs.writeFileSync(failPath, 'email,name,tempPassword\n' + failures.join('\n'));
        console.log(`\n  ${failures.length} failed — written to ${failPath} (re-run the script on that file to retry just those).`);
    }
    console.log(`\n${dryRun ? '[DRY RUN] ' : ''}Done. Sent: ${sent}, Failed: ${failures.length}`);
}

main().catch(e => { console.error(e); process.exit(1); });
