import dotenv from 'dotenv';

dotenv.config();

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  port: Number(getEnv('PORT', '4000')),
  databaseUrl: getEnv('DATABASE_URL'),
  accessSecret: getEnv('JWT_ACCESS_SECRET'),
  refreshSecret: getEnv('JWT_REFRESH_SECRET'),
  accessExpiresIn: getEnv('JWT_ACCESS_EXPIRES_IN', '15m'),
  refreshExpiresIn: getEnv('JWT_REFRESH_EXPIRES_IN', '7d'),
  uploadDir: getEnv('UPLOAD_DIR', './uploads'),
  clientUrl: getEnv('CLIENT_URL', 'http://localhost:5173')
};
