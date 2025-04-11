import { defineConfig } from "drizzle-kit";

const DATABASE_HOST = Bun.env.DATABASE_HOST;
const DATABASE_USER = Bun.env.DATABASE_USER;
const DATABASE_PASS = Bun.env.DATABASE_PASS;
const DATABASE_NAME = Bun.env.DATABASE_NAME;
const DATABASE_PORT = Bun.env.DATABASE_PORT;

export const DATABASE_URL = Bun.env.DATABASE_URL
    ? Bun.env.DATABASE_URL
    : `postgres://${DATABASE_USER}:${DATABASE_PASS}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}`;

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/db/models.ts",
    out: "./drizzle",

    dbCredentials: {
        url: DATABASE_URL,
    },
});