import {appendMessage, response, verifyToken} from "utils";
import {fetchAllTopics} from "../pubsub";
import type {ServerWebSocket} from "bun";
import {server} from "./instance.ts";

export const websocketFetch = async (req: Request, server: Bun.Server) => {
    const url = new URL(req.url);
    if (req.method !== "GET") return response(405, "Method not allowed");

    const basePath = "/ws";

    if (url.pathname === `${basePath}/topic`) {
        const tokenRes = await verifyToken(req.headers.get("Authorization"));
        if (tokenRes instanceof Response) return tokenRes;

        const id = url.searchParams.get("id");
        if (!id) return response(400, "Missing id");

        return server.upgrade(req, {data: {type: "topic", id}})
            ? response(101, "Switching protocols")
            : response(500, "WebSocket upgrade failed");

    } else if (url.pathname === `${basePath}/realtime`) {
        const tokenRes = await verifyToken(url.searchParams.get("authorization"));
        if (tokenRes instanceof Response) return tokenRes;

        return server.upgrade(req, {data: {type: "realtime", id: ""}})
            ? response(101, "Switching protocols")
            : response(500, "WebSocket upgrade failed");

    } else {
        return response(404, "Not Found");
    }
};

export function websocketHandler() {
    return {
        open(ws: ServerWebSocket<{ type: string; id: string }>) {
            ws.subscribe(ws.data.id || "realtime");
        },

        async message(ws: ServerWebSocket<{ type: string; id: string }>, raw: string | Buffer) {
            let payload: any;
            try {
                payload = JSON.parse(raw.toString());
            } catch {
                payload = {data: raw.toString()};
            }

            const message = {
                type: ws.data.type,
                id: ws.data.id,
                payload
            };

            if (ws.data.type === "topic") {
                await appendMessage(ws.data.id, payload);
                server?.publish(ws.data.id, JSON.stringify(message));

                await realtimeUpdate("update");
            }
        },

        close(ws: ServerWebSocket<{ type: string; id: string }>) {
            ws.unsubscribe(ws.data.id);
        }
    };
}

export async function realtimeUpdate(action: string) {
    if (!server) {
        console.error("❌ Server instance is not initialized.");
        return;
    }

    const topics = await fetchAllTopics();
    const realtimeMessage = {
        type: "realtime",
        action,
        data: topics
    };

    server.publish("realtime", JSON.stringify(realtimeMessage));
}