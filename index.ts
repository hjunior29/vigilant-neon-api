import {checkDB, migrateDB, seed} from "$core/index";
import {httpHandler} from "server/http";
import {websocketFetch, websocketHandler} from "server/websocket";
import {setServer} from "./src/server/instance.ts";
import {PORT} from "$constants/index.ts";

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

        const app = Bun.serve<{ type: "topic" | "realtime"; id: string }, {}>({
            port: PORT,
            routes: httpHandler,
            fetch: websocketFetch,
            websocket: websocketHandler(),
        });

        setServer(app);

        console.log(`✅ Application started successfully on port ${app.port}`);

    } catch (error) {
        console.error("❌ Critical error during startup:", error);
        process.exit(1);
    }
}

bootstrap();