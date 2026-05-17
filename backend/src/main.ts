import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import app from './app';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        // Here you would connect to the DB if needed 
        // await prisma.$connect();
        // console.log("Database connected successfully");

        app.listen(PORT, () => {
            console.log(`Swapifhy TS Engine running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();
