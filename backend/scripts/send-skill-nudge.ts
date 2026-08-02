/**
 * Email users who have NO skills yet, asking them to log in and add them
 * (so the matching engine can pair them). Reuses the Gmail SMTP setup from
 * send-credentials.ts. No passwords involved — these accounts already exist.
 *
 * Setup (backend/.env): GMAIL_USER, GMAIL_APP_PASSWORD, FRONTEND_URL (+ DATABASE_URL).
 *
 * Usage:
 *   npx tsx scripts/send-skill-nudge.ts --dry-run          # count + sample, no send
 *   npx tsx scripts/send-skill-nudge.ts --limit=1          # send to first match (test)
 *   npx tsx scripts/send-skill-nudge.ts                    # send to all skill-less users
 */
import * as dotenv from 'dotenv'; dotenv.config();
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();
const LOGIN_BASE = (process.env.FRONTEND_URL || 'https://swapifhy.com').split(',')[0].trim();
const LOGIN_URL = `${LOGIN_BASE}/auth`;
const SUBJECT = 'Add your skills so we can match you on Swapifhy';

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

function buildText(name: string) {
    return `Hi ${name || 'there'},

You're already in the Swapifhy beta — but we don't know your skills yet, so we can't match you with the right people.

It takes about 30 seconds: log in and tell us what you can teach and what you want to learn. You'll be asked right after you log in.

Log in: ${LOGIN_URL}

Once your skills are in, we'll start showing you people to swap with.

- The Swapifhy Team`;
}

function buildHtml(name: string) {
    return `<div style="background:#f4f3f7;padding:24px 12px;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #ece9f5;padding:32px 34px;color:#1a1a1a;font-size:15px;line-height:1.65;">
    <p style="margin:0 0 16px;font-size:16px;">Hi ${esc(name) || 'there'},</p>
    <p style="margin:0 0 16px;">You're already in the Swapifhy beta — but we don't know your skills yet, so we can't match you with the right people.</p>
    <p style="margin:0 0 24px;">It takes about 30 seconds: log in and tell us <strong>what you can teach</strong> and <strong>what you want to learn</strong>. You'll be asked right after logging in.</p>
    <a href="${LOGIN_URL}" style="display:inline-block;background:#7c6cff;color:#fff;text-decoration:none;padding:12px 28px;border-radius:999px;font-weight:600;font-size:14px;">Add my skills →</a>
    <p style="margin:24px 0 0;color:#6b6b6b;font-size:13px;">Once your skills are in, we'll start showing you people to swap with.</p>
    <p style="margin:20px 0 0;">— The Swapifhy Team</p>
  </div>
</div>`;
}

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
    const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : undefined;

    const user = process.env.GMAIL_USER;
    const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
    if (!dryRun && (!user || !pass)) {
        console.error('Set GMAIL_USER and GMAIL_APP_PASSWORD in backend/.env first.');
        process.exit(1);
    }

    const recipients = await prisma.user.findMany({
        where: { skillsTeaching: { none: {} }, skillsLearning: { none: {} } },
        select: { name: true, email: true },
        ...(limit ? { take: limit } : {}),
    });

    console.log(`${dryRun ? '[DRY RUN] ' : ''}${recipients.length} skill-less user(s) to nudge. Login: ${LOGIN_URL}`);
    if (dryRun) {
        recipients.slice(0, 5).forEach(r => console.log(`  ${r.email} (${r.name})`));
        if (recipients.length > 5) console.log(`  ... and ${recipients.length - 5} more`);
        await prisma.$disconnect();
        return;
    }

    const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
    const failures: string[] = [];
    let sent = 0;

    for (const r of recipients) {
        try {
            await sendWithRetry(transporter, {
                from: `Swapifhy <${user}>`, to: r.email, subject: SUBJECT,
                text: buildText(r.name), html: buildHtml(r.name),
            });
            sent++;
            if (sent % 25 === 0) console.log(`  sent ${sent}/${recipients.length}...`);
            await sleep(700);
        } catch (e: any) {
            failures.push(r.email);
            console.error(`  FAIL ${r.email}: ${e.message}`);
        }
    }

    if (failures.length) console.log(`\n  Failed: ${failures.join(', ')}`);
    console.log(`\nDone. Sent: ${sent}, Failed: ${failures.length}`);
    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
