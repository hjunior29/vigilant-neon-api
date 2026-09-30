import { DATABASE_URL, PASSWORD, USERNAME } from "$constants/index";
import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { migrate } from "drizzle-orm/bun-sqlite/migrator";
import * as schema from "./models";
import { users } from "./models";
import { eq } from "drizzle-orm";
import { hashPassword } from "utils";

const sqlite = new Database(DATABASE_URL);
sqlite.run("PRAGMA journal_mode = WAL;");

export const db = drizzle(sqlite, { schema });

export async function checkDB() {
    try {
        sqlite.query("SELECT 1;").get();
        console.log("✅ Database connection verified");
        return true;
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        return false;
    }
}

export async function migrateDB() {
    try {
        migrate(db, { migrationsFolder: "./drizzle" });
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

export async function seed() {
    const username = USERNAME;
    const password = PASSWORD;

    if (!username || !password) return;

    const result = await db
        .select()
        .from(users)
        .where(eq(users.username, username))

    if (result.length === 0) {
        const hashedPassword = await hashPassword(password);

        await db
            .insert(users)
            .values({
                username,
                hashedPassword
            })
            .returning();

        console.log("🔑 Seeding database with user:", username);
        return true;
    } else {
        console.log("🔑 User already exists:", username);
        return false;
    }

}
