import { importPKCS8, importSPKI } from "jose";

export const DATABASE_HOST = Bun.env.DATABASE_HOST;
export const DATABASE_USER = Bun.env.DATABASE_USER;
export const DATABASE_PASS = Bun.env.DATABASE_PASS;
export const DATABASE_NAME = Bun.env.DATABASE_NAME;
export const DATABASE_PORT = Bun.env.DATABASE_PORT;

export const DATABASE_URL = Bun.env.DATABASE_URL
    ? Bun.env.DATABASE_URL
    : `postgres://${DATABASE_USER}:${DATABASE_PASS}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;

export const ORIGIN_URL = Bun.env.ORIGIN_URL;

export const USERNAME = Bun.env.USERNAME;
export const PASSWORD = Bun.env.PASSWORD;

export const PRIVATE_KEY = await (async () => {
    if (!Bun.env.PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY is not defined in environment variables.");
    }
    const rawKey = Bun.env.PRIVATE_KEY;
    const key = rawKey.replace(/\\n/g, "\n");
    return importPKCS8(key, "RS256");
})();

export const PUBLIC_KEY = await (async () => {
    if (!Bun.env.PUBLIC_KEY) {
        throw new Error("PUBLIC_KEY is not defined in environment variables.");
    }
    const rawKey = Bun.env.PUBLIC_KEY;
    const key = rawKey.replace(/\\n/g, "\n");
    return importSPKI(key, "RS256");
})();