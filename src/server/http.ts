import { auth } from "auth";
import { createPubSub } from "pubsub";
import { createResponse } from "utils";

export function httpServer() {
    const server = Bun.serve({
        routes: {
            ...login,
            ...pubsub,
            ...ping
        }
    })

    console.log(`🚀 Server running at http://${server.hostname}:${server.port}`);

    return server;
}

const login = {
    "/api/login": {
        POST: async (req: Request) =>
            auth(req)
    }
}

const pubsub = {
    "/api/pubsub": {
        POST: async (req: Request) =>
            createPubSub(req)
    }
}

const ping = {
    "/api/ping": {
        GET: async () =>
            createResponse(200, "pong"),
    }
}