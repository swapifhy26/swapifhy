const fs = require('fs');

let appTs = fs.readFileSync('../backend/src/app.ts', 'utf8');

if (!appTs.includes('mentorshipRoutes')) {
    appTs = appTs.replace(
        `import adminRoutes from './routes/admin.routes';`,
        `import adminRoutes from './routes/admin.routes';\nimport mentorshipRoutes from './routes/mentorship.routes';`
    );

    appTs = appTs.replace(
        `app.use('/api/admin', adminRoutes);   // Admin Command Center`,
        `app.use('/api/admin', adminRoutes);   // Admin Command Center\napp.use('/api/mentorships', mentorshipRoutes); // Learning & Teaching Hub`
    );
    
    fs.writeFileSync('../backend/src/app.ts', appTs);
    console.log('Mentorship routes mounted in app.ts');
} else {
    console.log('Already mounted.');
}
