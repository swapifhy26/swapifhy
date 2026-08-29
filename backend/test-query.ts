import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.$queryRaw`
    SELECT
        TO_CHAR(DATE_TRUNC('day', generated_date), 'YYYY-MM-DD') AS date,
        COALESCE(COUNT(DISTINCT u.id), 0)::int AS users,
        COALESCE(COUNT(DISTINCT w.id), 0)::int AS waitlist
    FROM
        GENERATE_SERIES(CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE, '1 day') AS generated_date
    LEFT JOIN "User" u ON DATE_TRUNC('day', u."createdAt") = DATE_TRUNC('day', generated_date)
    LEFT JOIN "Waitlist" w ON DATE_TRUNC('day', w."createdAt") = DATE_TRUNC('day', generated_date)
    GROUP BY generated_date
    ORDER BY generated_date ASC;
`.then(console.log).catch(console.error).finally(() => prisma.$disconnect());
