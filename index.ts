import { checkDB, migrateDB, seed } from "$core/index";
import { httpServer } from "server/http";
import {websocketServer, wsServer} from "server/websocket";
import {channelWsServer} from "./src/server/channel.ts";

async function bootstrap() {
    console.log("🚀 Starting application...");

    try {
        const dbConnected = await checkDB();
        if (!dbConnected) {
            console.error("❌ Database connection failed. Exiting...");
            process.exit(1);
        }

        const migrationsApplied = await migrateDB();
        if (!migrationsApplied) {
            console.error("❌ Migrations failed. Exiting...");
            process.exit(1);
        }

        await seed();
        httpServer();
        websocketServer();
    } catch (error) {
        console.error("❌ Critical error during startup:", error);
        process.exit(1);
    }
}

bootstrap();