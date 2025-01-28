import { config } from 'dotenv';
import fs from 'fs';

const testEnvFile = `.env.test`;
const envFile = `.env`;

if (!fs.existsSync(envFile)) {
  throw new Error('.env file not found');
}

if (!fs.existsSync(testEnvFile)) {
  throw new Error('.env.test file found');
}

config({ path: envFile });
config({ path: testEnvFile, override: true });
