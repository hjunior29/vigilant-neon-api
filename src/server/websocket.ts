import {response, verifyToken, appendMessage} from "utils";
import {fetchAllTopics} from "../pubsub";

let publishToRealtime: ((action: string) => Promise<void>) | null = null;

export function websocketServer() {
    const server = Bun.serve<{ type: "topic" | "realtime"; id: string }, {}>({
        port: Number(process.env.WS_PORT || 3001),

        async fetch(req, server) {
            const url = new URL(req.url);
            if (req.method !== "GET") return response(405, "Method not allowed");

            if (url.pathname === "/topic") {
                const tokenRes = await verifyToken(req.headers.get("Authorization"));
                if (tokenRes instanceof Response) return tokenRes;

                const id = url.searchParams.get("id");
                if (!id) return response(400, "Missing id");

                return server.upgrade(req, { data: { type: "topic", id: id } })
                    ? response(101, "Switching protocols")
                    : response(500, "WebSocket upgrade failed");

            } else if (url.pathname === "/realtime") {
                const tokenRes = await verifyToken(url.searchParams.get("authorization"));
                if (tokenRes instanceof Response) return tokenRes;

                return server.upgrade(req, { data: { type: "realtime" } })
                    ? response(101, "Switching protocols")
                    : response(500, "WebSocket upgrade failed");

            } else {
                return response(404, "Not Found");
            }
        },

        websocket: {
            open(ws) {
                console.log(`Client connected to ${ws.data.type}: ${ws.data.id}`);
                ws.subscribe(ws.data.id || "realtime");
            },

            async message(ws, raw) {
                let payload: any;
                try {
                    payload = JSON.parse(raw.toString());
                } catch {
                    payload = { data: raw.toString() };
                }

                const message = {
                    type: ws.data.type,
                    id: ws.data.id,
                    payload
                };

                if (ws.data.type === "topic") {
                    await appendMessage(ws.data.id, payload);
                    server.publish(ws.data.id, JSON.stringify(message));

                    await publishToRealtime?.("update");
                }
            },

            close(ws) {
                ws.unsubscribe(ws.data.id);
            }
        }
    });

    console.log(`🚀 Unified WS server running at ws://${server.hostname}:${server.port}`);

    publishToRealtime = async (action: string) => {
        const topics = await fetchAllTopics();
        const realtimeMessage = {
            type: "realtime",
            action: action,
            data: topics
        };

        server.publish("realtime", JSON.stringify(realtimeMessage));
    };

    return server;
}


export async function realtimeUpdate(action: string) {
    if (publishToRealtime) {
        await publishToRealtime(action);
    }
}