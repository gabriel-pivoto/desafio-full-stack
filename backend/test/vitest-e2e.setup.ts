import 'reflect-metadata';
import { randomUUID } from 'crypto';

// Ensure unique database name per run if needed by future tests.
process.env.TEST_RUN_ID = randomUUID();
