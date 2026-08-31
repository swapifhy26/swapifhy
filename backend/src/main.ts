import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';
import app from './app';
import throng from 'throng';

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;
const WORKERS = process.env.WEB_CONCURRENCY || 2; // Default to 2 workers minimum on VMs to leverage multi-core concurrency

function startWorker(id: number) {
    app.listen(PORT, () => {
        console.log(`Swapifhy Worker ${id} (PID: ${process.pid}) running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
    });
}

function startMaster() {
    console.log(`Swapifhy Master Process (PID: ${process.pid}) started. Scaling across ${WORKERS} workers.`);
    // Initialize cron jobs ONLY on the master thread to prevent duplicate executions
    require('./cron/archiveChats');
}

if (process.env.NODE_ENV === 'production') {
    throng({
        workers: WORKERS,
        lifetime: Infinity,
        master: startMaster,
        worker: startWorker
    });
} else {
    // In development mode, run as a simple single-threaded app so nodemon/tsx hot reloading works cleanly
    require('./cron/archiveChats');
    app.listen(PORT, () => {
        console.log(`Swapifhy DEV Engine running in development on port ${PORT}`);
    });
}
