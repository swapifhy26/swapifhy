import { PrismaClient } from '@prisma/client';

let url = process.env.DATABASE_URL || '';
if (url && !url.includes('pgbouncer=true')) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true';
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url
        }
    }
});

export default prisma;
