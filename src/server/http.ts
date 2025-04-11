import { createPubSub } from "pubsub";
import { createResponse } from "utils";

export function httpServer() {
    const server = Bun.serve({
        routes: {
            ...pubsub,
            ...ping
        }
    })

    console.log(`🚀 Server running at http://${server.hostname}:${server.port}`);

    return server;
}

const pubsub = {
    "/api/pubsub": {
        POST: async () =>
            createPubSub()
    }
}

const ping = {
    "/api/ping": {
        GET: async () =>
            createResponse(200, "pong"),
    }
}