import type { Topic } from "pubsub/models";
import { saveTopic } from "pubsub";

export function wsServer() {
    const server = Bun.serve<{ topicId: string; publisherId: string; subscriberId: string; messages: string[] }, {}>({
        port: Number(process.env.WS_PORT || 3001),

        fetch(req, server) {
            const url = new URL(req.url);
            const topicId = url.searchParams.get("topicId");

            if (req.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
            if (url.pathname !== "/") return new Response("Not Found", { status: 404 });
            if (!topicId) return new Response("Bad Request: topicId missing", { status: 400 });

            const success = server.upgrade(req, {
                data: {
                    topicId,
                    messages: [],
                },
            });

            if (success) return new Response("Switching Protocols", { status: 101 });

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