import type { Topic } from "pubsub/models";
import { saveTopic } from "pubsub";
import { createResponse, verifyToken } from "utils";

export function wsServer() {
    const server = Bun.serve<{ topicId: string; publisherId: string; subscriberId: string; messages: string[] }, {}>({
        port: Number(process.env.WS_PORT || 3001),

        async fetch(req, server) {
            const tokenResponse = await verifyToken(req.headers.get("Authorization"));
            if (tokenResponse instanceof Response) {
                return tokenResponse;
            }

            const url = new URL(req.url);
            const topicId = url.searchParams.get("topicId");

            if (req.method !== "GET") return createResponse(405, "Method not allowed");
            if (url.pathname !== "/") return createResponse(404, "Not found");
            if (!topicId) return createResponse(400, "Missing topicId");

            const success = server.upgrade(req, {
                data: {
                    topicId,
                    messages: [],
                },
            });

            if (success) return createResponse(101, "Switching protocols");

            return undefined;
        },

        websocket: {
            open(ws) {
                try {
                    ws.subscribe(ws.data.topicId);
                } catch (e) {
                    ws.close(1011, (e as Error).message);
                }
            },

            message(ws, message) {
                try {
                    let parsed;
                    try {
                        parsed = JSON.parse(message.toString());
                        ws.data.messages.push(parsed);
                        server.publish(ws.data.topicId, JSON.stringify(parsed));
                    } catch {
                        const text = message.toString();
                        ws.data.messages.push(text);
                        server.publish(ws.data.topicId, text);
                    }
                } catch (e) {
                    ws.send(JSON.stringify({ error: (e as Error).message }));
                }
            },


            close(ws) {
                try {
                    ws.unsubscribe(ws.data.topicId);;

                    const topic: Topic = {
                        id: ws.data.topicId ?? "",
                        content: { messages: ws.data.messages },
                    }

                    const result = saveTopic(topic);

                    if (!result) {
                        console.log("❌ Failed to save topic");
                    }
                } catch (e) {
                    ws.close(1011, (e as Error).message);
                }
            },
        },
    });

    console.log(`🚀 Websocket server running at ws://${server.hostname}:${server.port}`);

    return server;
}