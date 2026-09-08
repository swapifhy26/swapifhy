import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const possiblePaths = [
        path.join(__dirname, '../../credentials (1).csv'),
        path.join(__dirname, 'credentials (1).csv'),
        path.join(__dirname, 'credentials.csv'),
        path.join(__dirname, 'users.csv')
    ];
    const csvPath = possiblePaths.find(p => fs.existsSync(p)) || path.join(__dirname, 'users.csv');
    console.log(`Using credentials file: ${csvPath}`);
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    // Detect header format
    const headerLine = lines[0].toLowerCase();
    const isCredentialsFormat = headerLine.includes('temppassword');
    const dataLines = lines.slice(1);
    
    console.log(`Starting import of ${dataLines.length} users...`);
    
    let success = 0;
    let failed = 0;

    for (const line of dataLines) {
        let name = '';
        let email = '';
        let password = '';

        if (isCredentialsFormat) {
            // Format: email,name,tempPassword (handling quotes)
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
            const cleaned = matches.map(s => s.replace(/^"|"$/g, '').trim());
            email = cleaned[0]?.toLowerCase().trim() || '';
            name = cleaned[1]?.trim() || '';
            password = cleaned[2]?.trim() || '';
        } else {
            const parts = line.split(',');
            if (parts.length < 3) continue;
            password = parts.pop()?.trim() || '';
            email = parts.pop()?.trim() || '';
            name = parts.join(',').trim();
        }

        if (!email || !password) continue;

        try {
            const passwordHash = await bcrypt.hash(password, 10);
            
            await prisma.user.upsert({
                where: { email },
                update: {
                    name,
                    passwordHash
                },
                create: {
                    email,
                    name,
                    passwordHash
                }
            });
            success++;
            if (success % 10 === 0) console.log(`Imported ${success} users...`);
        } catch (error) {
            console.error(`Failed to import ${email}:`, error);
            failed++;
        }
    }
    
    console.log(`Done! Successfully imported ${success} users. Failed: ${failed}.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
