export const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Swapifhy Enterprise MVP API',
        version: '1.0.0',
        description: 'Interactive API Explorer for testing the Express/Prisma matching engine.'
    },
    servers: [{ url: 'http://localhost:3001', description: 'Local Development Server' }],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    paths: {
        '/api/health': {
            get: {
                summary: 'Health Check',
                responses: { 200: { description: 'Server natively running in Express TS' } }
            }
        },
        '/api/auth/waitlist': {
            post: {
                summary: 'Join Waitlist',
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', default: 'test@example.com' } } } } } },
                responses: { 201: { description: 'Success' }, 409: { description: 'Already Registered' } }
            }
        },
        '/api/auth/register': {
            post: {
                summary: 'Create User Profile',
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', default: 'newuser@matrix.com' }, name: { type: 'string', default: 'Neo' }, password: { type: 'string', default: 'matrix123' } } } } } },
                responses: { 201: { description: 'Created' }, 400: { description: 'Invalid Input' } }
            }
        },
        '/api/auth/login': {
            post: {
                summary: 'Login User',
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string', default: 'test@example.com' }, password: { type: 'string', default: 'password123' } } } } } },
                responses: { 200: { description: 'Returns JWT via JSON body' }, 401: { description: 'Invalid Credentials' } }
            }
        },
        '/api/user/profile': {
            get: {
                summary: 'Get My Profile (Requires JWT Auth)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Returns Profile object with relational dependencies' }, 401: { description: 'Missing Token' } }
            },
            put: {
                summary: 'Update Profile & Skills (Requires JWT Auth)',
                security: [{ bearerAuth: [] }],
                requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { bio: { type: 'string', default: 'Enterprise Developer in the Matrix.' }, avatarUrl: { type: 'string', default: 'https://i.pravatar.cc/150?u=karan' }, teach: { type: 'string', description: 'Comma-separated skills', default: 'React, TypeScript, Node.js' }, learn: { type: 'string', description: 'Comma-separated skills', default: 'Python, AI, Go' } } } } } },
                responses: { 200: { description: 'Returns mapped output of Prisma skills schema' }, 401: { description: 'Missing Token' } }
            }
        },
        '/api/match/explore': {
            get: {
                summary: 'Get Matchmaking Algorithm Feed (Requires JWT Auth)',
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Returns overlapping relational match objects' }, 401: { description: 'Missing Token' } }
            }
        }
    }
};
