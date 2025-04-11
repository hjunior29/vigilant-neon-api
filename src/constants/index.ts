export const DATABASE_HOST = Bun.env.DATABASE_HOST;
export const DATABASE_USER = Bun.env.DATABASE_USER;
export const DATABASE_PASS = Bun.env.DATABASE_PASS;
export const DATABASE_NAME = Bun.env.DATABASE_NAME;
export const DATABASE_PORT = Bun.env.DATABASE_PORT;

export const DATABASE_URL = Bun.env.DATABASE_URL
    ? Bun.env.DATABASE_URL
    : `postgres://${DATABASE_USER}:${DATABASE_PASS}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;

export const ORIGIN_URL = Bun.env.ORIGIN_URL;