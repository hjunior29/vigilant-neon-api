import { DATABASE_URL } from "$constants/index";
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from "drizzle-orm/node-postgres/migrator";

export const db = drizzle(DATABASE_URL);

export async function checkDB() {
    try {
        await db.execute('select 1');
        console.log("✅ Database connection verified");
        return true;
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        return false;
    }
}

export async function migrateDB() {
    try {
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("✅ Database migration successful");
        return true;
    } catch (error) {
        const message = (error instanceof Error ? error.message.toLowerCase() : "") || "";

        if (message.includes("already exists") || message.includes("relation") && message.includes("already exists")) {
            console.warn("⚠️ Migration attempted to create existing table. Skipping...");
            return true;
        }

        console.error("❌ Database migration failed:", error);
        return false;
    }
}