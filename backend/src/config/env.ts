export const env = {
    DATABASE_URL: process.env.DATABASE_URL || '',
};

if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}