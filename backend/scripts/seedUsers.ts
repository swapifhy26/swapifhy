import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const csvPath = path.join(__dirname, 'users.csv');
    const content = fs.readFileSync(csvPath, 'utf8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    
    // Skip header
    const dataLines = lines.slice(1);
    
    console.log(`Starting import of ${dataLines.length} users...`);
    
    let success = 0;
    let failed = 0;

    for (const line of dataLines) {
        const parts = line.split(',');
        if (parts.length < 3) continue;
        
        const password = parts.pop()?.trim() || '';
        const email = parts.pop()?.trim() || '';
        const name = parts.join(',').trim();

        try {
            const passwordHash = await bcrypt.hash(password, 10);
            
            await prisma.user.upsert({
                where: { email },
                update: {}, // Don't update if they already exist
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
