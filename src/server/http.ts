import { ORIGIN_URL } from "$constants/index";
import { auth } from "auth";
import { createTopic, deleteTopics, getSharedTopic, getTopicById, getTopics, shareTopic } from "pubsub";
import {createResponse, headers} from "utils";

export function httpServer() {
    const server = Bun.serve({
        routes: {
            ...cors,
            ...login,
            ...pubsub,
            ...ping
        }
    })

    console.log(`🚀 Server running at http://${server.hostname}:${server.port}`);

    return server;
}

const cors = {
    "/*": {
        OPTIONS: async () =>
            new Response(null, {
                status: 204,
                headers: headers,
            }),
    },
};

const login = {
    "/api/auth/login": {
        POST: async (req: Request) =>
            auth(req)
    }
}

const pubsub = {
    "/api/pubsub": {
        POST: (req: Request) =>
            createTopic(req),

        GET: (req: Request) =>
            getTopics(req),

        DELETE: (req: Request) =>
            deleteTopics(req)
    },

    "/api/pubsub/:id": {
        GET: (req: Request) =>
            getTopicById(req)
    },

    "/api/pubsub/:id/share": {
        GET: (req: Request) =>
            shareTopic(req)
    },

    "/api/pubsub/shared/:sharedId": {
        GET: (req: Request) =>
            getSharedTopic(req)
    }
}

const ping = {
    "/api/ping": {
        GET: async () =>
            createResponse(200, "pong"),
    }
}
