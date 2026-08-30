const fs = require('fs');

let appTs = fs.readFileSync('src/app.ts', 'utf8');

if (!appTs.includes('notification.routes')) {
    appTs = appTs.replace(
        "import mentorshipRoutes from './routes/mentorship.routes';",
        "import mentorshipRoutes from './routes/mentorship.routes';\nimport notificationRoutes from './routes/notification.routes';"
    );

    appTs = appTs.replace(
        "app.use('/api/mentorships', mentorshipRoutes); // Learning & Teaching Hub",
        "app.use('/api/mentorships', mentorshipRoutes); // Learning & Teaching Hub\napp.use('/api/notifications', notificationRoutes);"
    );

    fs.writeFileSync('src/app.ts', appTs);
    console.log('Injected notificationRoutes into app.ts');
}
