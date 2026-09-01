import { PrismaClient } from '@prisma/client';

let url = process.env.DATABASE_URL || '';
if (url && !url.includes('pgbouncer=true')) {
    url += (url.includes('?') ? '&' : '?') + 'pgbouncer=true&connection_limit=20&pool_timeout=0';
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url
        }
    }
});

export default prisma;
