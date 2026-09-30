import { defineConfig } from "drizzle-kit";

export const DATABASE_URL = process.env.DATABASE_URL || "./vigilant.db";

export default defineConfig({
    dialect: "sqlite",
    schema: "./src/db/models.ts",
    out: "./drizzle",

    dbCredentials: {
        url: DATABASE_URL,
    },
});