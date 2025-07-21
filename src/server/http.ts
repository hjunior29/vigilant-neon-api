import {createApiKey, deleteApiKey, getApiKeys, login} from "auth";
import {createTopic, deleteTopics, getSharedTopic, getTopicById, getTopics, shareTopic} from "pubsub";
import {headers, response} from "utils";

const cors = {
    "/*": {
        OPTIONS: async () =>
            new Response(null, {
                status: 204,
                headers: headers,
            }),
    },
};

const home = {
    "/": {
        GET: async () =>
            response(200, "API from Vigilant Neon Project", {
                name: "Vigilant Neon API",
                description: "Real‑time Pub/Sub topic management with REST & WebSocket powered by Bun + TypeScript + Svelte.",
                author: "github.com/hjunior29",
            }),
    }
}

const auth = {
    "/api/auth/login": {
        POST: async (req: Request) =>
            login(req)
    },

    "/api/auth/apikey": {
        POST: async (req: Request) =>
            createApiKey(req),

        GET: async (req: Request) =>
            getApiKeys(req)
    },

    "/api/auth/apikey/:id": {
        DELETE: async (req: Request) =>
            deleteApiKey(req)

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
            response(200, "pong"),
    }
}

export const httpHandler = {
    ...home,
    ...cors,
    ...auth,
    ...pubsub,
    ...ping
}
