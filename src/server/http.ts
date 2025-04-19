import { auth } from "auth";
import { createPubSub, deleteTopics, getTopicById, getTopics } from "pubsub";
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
    "/api/auth/login": {
        POST: async (req: Request) =>
            auth(req)
    }
}

const pubsub = {
    "/api/pubsub": {
        POST: (req: Request) =>
            createPubSub(req),

        GET: (req: Request) =>
            getTopics(req),

        DELETE: (req: Request) =>
            deleteTopics(req)
    },

    "/api/pubsub/:id": {
        GET: (req: Request) =>
            getTopicById(req)
    }
}

const ping = {
    "/api/ping": {
        GET: async () =>
            createResponse(200, "pong"),
    }
}