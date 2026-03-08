export const env = {
    DATABASE_URL: process.env.DATABASE_URL || '',
    PUBLIC_IP: process.env.PUBLIC_IP
};

if (!env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
}