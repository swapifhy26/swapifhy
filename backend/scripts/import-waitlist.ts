/**
 * Bulk-create user accounts from a waitlist CSV export.
 *
 * Usage:
 *   npx tsx scripts/import-waitlist.ts <path-to-csv> [--dry-run]
 *
 * CSV format (semicolon-delimited, as exported from Supabase):
 *   id;name;email;created_at
 *
 * Behaviour:
 *   - Validates and de-duplicates emails; skips malformed rows.
 *   - Creates each new user with a random temporary password.
 *   - Skips emails that already have an account (safe to re-run).
 *   - Writes <csv-dir>/credentials.csv  ->  email,name,tempPassword
 *     Distribute those to users; they change it in Settings after first login.
 *   - --dry-run parses/validates and reports counts WITHOUT touching the database.
 *
 * Requires DATABASE_URL (+ DIRECT_URL) in backend/.env for a real run.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function genPassword(): string {
    // ~12-char alphanumeric temporary password
    return crypto.randomBytes(12).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
}

function parseCsv(csvPath: string) {
    const raw = fs.readFileSync(csvPath, 'utf8');
    const lines = raw.split(/\r?\n/).filter(l => l.trim() !== '');
    lines.shift(); // drop header: id;name;email;created_at

    const seen = new Set<string>();
    const valid: { name: string; email: string }[] = [];
    let invalid = 0;
    let duplicates = 0;

    for (const line of lines) {
        const parts = line.split(';');
        const name = (parts[1] || '').trim();
        const email = (parts[2] || '').trim().toLowerCase();

        if (!EMAIL_RE.test(email)) { invalid++; continue; }
        if (seen.has(email)) { duplicates++; continue; }
        seen.add(email);
        valid.push({ name: name || email.split('@')[0], email });
    }

    return { total: lines.length, valid, invalid, duplicates };
}

async function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const csvPath = args.find(a => !a.startsWith('--'));

    if (!csvPath) {
        console.error('Usage: npx tsx scripts/import-waitlist.ts <path-to-csv> [--dry-run]');
        process.exit(1);
    }
    if (!fs.existsSync(csvPath)) {
        console.error(`File not found: ${csvPath}`);
        process.exit(1);
    }

    const { total, valid, invalid, duplicates } = parseCsv(csvPath);
    console.log(`Parsed ${total} rows -> ${valid.length} unique valid emails (${invalid} invalid, ${duplicates} duplicates)`);

    if (dryRun) {
        console.log('\n[DRY RUN] No database changes. Sample of accounts that would be created:');
        valid.slice(0, 5).forEach(u => console.log(`  ${u.email}  (${u.name})`));
        if (valid.length > 5) console.log(`  ... and ${valid.length - 5} more`);
        return;
    }

    const prisma = new PrismaClient();
    const credentials: string[] = ['email,name,tempPassword'];
    let created = 0;
    let existing = 0;
    let failed = 0;

    for (const u of valid) {
        try {
            const already = await prisma.user.findUnique({ where: { email: u.email } });
            if (already) { existing++; continue; }

            const tempPassword = genPassword();
            const passwordHash = await bcrypt.hash(tempPassword, await bcrypt.genSalt(10));
            await prisma.user.create({ data: { email: u.email, name: u.name, passwordHash } });

            credentials.push(`${u.email},"${u.name.replace(/"/g, "'")}",${tempPassword}`);
            created++;
        } catch (e: any) {
            if (e.code === 'P2002') { existing++; }
            else { failed++; console.error(`  Failed ${u.email}: ${e.message}`); }
        }
    }

    const outPath = path.join(path.dirname(path.resolve(csvPath)), 'credentials.csv');
    fs.writeFileSync(outPath, credentials.join('\n'));

    console.log('\nDone.');
    console.log(`  Created:  ${created}`);
    console.log(`  Existing: ${existing} (skipped)`);
    console.log(`  Failed:   ${failed}`);
    console.log(`\n  Credentials written to: ${outPath}`);
    console.log('  Distribute these to users. Delete the file once done — it contains plaintext passwords.');

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
