import { describe, test, expect, beforeAll, afterAll } from "bun:test";

const BASE_URL = "http://localhost:3000";
let authToken: string;
let createdTopicIds: string[] = [];

// Helper function to login
async function login() {
  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: process.env.USERNAME || "opisylacti",
      password: process.env.PASSWORD || "KK9Lv125CeJao92Qx7SDr4jYz",
    }),
  });
  const loginData = await loginResponse.json();
  return loginData.data.token;
}

// Helper function to create topic
async function createTopic(token: string) {
  const response = await fetch(`${BASE_URL}/api/pubsub`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await response.json();
  return data.data[0];
}

// Helper function to cleanup topics
async function cleanupTopics(token: string, ids: string[]) {
  if (ids.length > 0) {
    await fetch(`${BASE_URL}/api/pubsub`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ids }),
    });
  }
}

describe("PubSub API Tests", () => {
  beforeAll(async () => {
    authToken = await login();
    expect(authToken).toBeDefined();
  });

  afterAll(async () => {
    await cleanupTopics(authToken, createdTopicIds);
  });

  describe("Topic Creation", () => {
    test("should create a new topic", async () => {
      const response = await fetch(`${BASE_URL}/api/pubsub`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Pubsub created");
      expect(data.data).toBeDefined();
      expect(data.data[0].id).toBeDefined();
      expect(data.data[0].publisherId).toBeDefined();
      expect(data.data[0].subscriberId).toBeDefined();

      createdTopicIds.push(data.data[0].id);
    });

    test("should create multiple topics", async () => {
      const topicsToCreate = 3;

      for (let i = 0; i < topicsToCreate; i++) {
        const response = await fetch(`${BASE_URL}/api/pubsub`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();
        expect(response.status).toBe(200);
        createdTopicIds.push(data.data[0].id);
      }

      expect(createdTopicIds.length).toBeGreaterThanOrEqual(topicsToCreate);
    });

    test("should fail to create topic without auth", async () => {
      const response = await fetch(`${BASE_URL}/api/pubsub`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Topic Retrieval", () => {
    test("should get all topics", async () => {
      const response = await fetch(`${BASE_URL}/api/pubsub`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Topics retrieved");
      expect(Array.isArray(data.data)).toBe(true);
    });

    test("should get a specific topic by ID", async () => {
      const topicId = createdTopicIds[0];

      const response = await fetch(`${BASE_URL}/api/pubsub/${topicId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Topic retrieved");
      expect(data.data[0].id).toBe(topicId);
    });
  });

  describe("Topic Sharing", () => {
    test("should generate a share link for a topic", async () => {
      const topicId = createdTopicIds[0];

      const response = await fetch(`${BASE_URL}/api/pubsub/${topicId}/share`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Topic shared");
      expect(data.data.sharedId).toBeDefined();
      expect(data.data.sharedId.length).toBe(16);
    });

    test("should access shared topic without auth", async () => {
      const topicId = createdTopicIds[0];

      // First get the sharedId
      const shareResponse = await fetch(
        `${BASE_URL}/api/pubsub/${topicId}/share`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      const shareData = await shareResponse.json();
      const sharedId = shareData.data.sharedId;

      // Access the shared topic without auth
      const response = await fetch(
        `${BASE_URL}/api/pubsub/shared/${sharedId}`,
        {
          method: "GET",
        }
      );

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Topic retrieved");
      expect(data.data.id).toBe(topicId);
    });
  });
});

describe("WebSocket Message Tests", () => {
  beforeAll(async () => {
    authToken = await login();
  });

  test("should connect to WebSocket and send message to topic", async () => {
    // Create a dedicated topic for this test
    const topic = await createTopic(authToken);
    const topicId = topic.id;
    createdTopicIds.push(topicId);

    const wsUrl = `ws://localhost:3000/ws/topic?id=${topicId}`;

    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const messageReceived = new Promise<any>((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("WebSocket timeout"));
      }, 5000);

      ws.onopen = () => {
        ws.send(JSON.stringify({ text: "Hello from test!", timestamp: Date.now() }));
      };

      ws.onmessage = (event) => {
        clearTimeout(timeout);
        const data = JSON.parse(event.data);
        resolve(data);
        ws.close();
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
    });

    const receivedMessage = await messageReceived;

    expect(receivedMessage.type).toBe("topic");
    expect(receivedMessage.id).toBe(topicId);
    expect(receivedMessage.payload.text).toBe("Hello from test!");
  });

  test("should persist messages in topic content", async () => {
    // Create a dedicated topic for this test
    const topic = await createTopic(authToken);
    const topicId = topic.id;
    createdTopicIds.push(topicId);

    const wsUrl = `ws://localhost:3000/ws/topic?id=${topicId}`;

    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const testMessage = { text: "Persisted message", value: 42 };

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("WebSocket timeout"));
      }, 5000);

      ws.onopen = () => {
        ws.send(JSON.stringify(testMessage));
      };

      ws.onmessage = () => {
        clearTimeout(timeout);
        ws.close();
        resolve();
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
    });

    // Wait a bit for the message to be persisted
    await new Promise((r) => setTimeout(r, 500));

    // Verify the message was persisted
    const topicResponse = await fetch(`${BASE_URL}/api/pubsub/${topicId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const topicData = await topicResponse.json();

    expect(topicData.data).toBeDefined();
    expect(topicData.data.length).toBeGreaterThan(0);

    const fetchedTopic = topicData.data[0];
    const content = fetchedTopic.content;

    expect(content).toBeDefined();
    expect(content.messages).toBeDefined();
    expect(Array.isArray(content.messages)).toBe(true);
    expect(content.messages.length).toBeGreaterThan(0);

    const lastMessage = content.messages[content.messages.length - 1];
    expect(lastMessage.text).toBe("Persisted message");
    expect(lastMessage.value).toBe(42);
  });

  test("should send multiple messages to a topic", async () => {
    // Create a dedicated topic for this test
    const topic = await createTopic(authToken);
    const topicId = topic.id;
    createdTopicIds.push(topicId);

    const wsUrl = `ws://localhost:3000/ws/topic?id=${topicId}`;
    const ws = new WebSocket(wsUrl, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const messagesToSend = [
      { text: "Message 1", order: 1 },
      { text: "Message 2", order: 2 },
      { text: "Message 3", order: 3 },
    ];

    let receivedCount = 0;

    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        ws.close();
        reject(new Error("WebSocket timeout"));
      }, 10000);

      ws.onopen = () => {
        messagesToSend.forEach((msg) => {
          ws.send(JSON.stringify(msg));
        });
      };

      ws.onmessage = () => {
        receivedCount++;
        if (receivedCount === messagesToSend.length) {
          clearTimeout(timeout);
          ws.close();
          resolve();
        }
      };

      ws.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
    });

    // Wait for persistence
    await new Promise((r) => setTimeout(r, 500));

    // Verify all messages were persisted
    const verifyResponse = await fetch(`${BASE_URL}/api/pubsub/${topicId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const verifyData = await verifyResponse.json();
    const messages = verifyData.data[0].content?.messages || [];

    expect(messages.length).toBe(3);
    expect(messages[0].order).toBe(1);
    expect(messages[1].order).toBe(2);
    expect(messages[2].order).toBe(3);
  });

  test("should fail WebSocket connection without auth", async () => {
    const topic = await createTopic(authToken);
    const topicId = topic.id;
    createdTopicIds.push(topicId);

    const wsUrl = `ws://localhost:3000/ws/topic?id=${topicId}`;

    const ws = new WebSocket(wsUrl);

    const connectionResult = await new Promise<string>((resolve) => {
      const timeout = setTimeout(() => {
        ws.close();
        resolve("timeout");
      }, 3000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve("connected");
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        resolve("error");
      };

      ws.onclose = (event) => {
        clearTimeout(timeout);
        if (event.code !== 1000) {
          resolve("closed_with_error");
        }
      };
    });

    // Should fail to connect or be closed immediately
    expect(["error", "closed_with_error", "timeout"]).toContain(connectionResult);
  });
});

describe("Topic Deletion", () => {
  beforeAll(async () => {
    authToken = await login();
  });

  test("should delete topics", async () => {
    // Create a topic to delete
    const topic = await createTopic(authToken);
    const topicToDelete = topic.id;

    // Delete the topic
    const deleteResponse = await fetch(`${BASE_URL}/api/pubsub`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ ids: [topicToDelete] }),
    });

    const deleteData = await deleteResponse.json();

    expect(deleteResponse.status).toBe(200);
    expect(deleteData.message).toBe("Topics deleted");

    // Verify the topic is no longer accessible
    const getResponse = await fetch(`${BASE_URL}/api/pubsub/${topicToDelete}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const getData = await getResponse.json();
    expect(getData.data).toEqual([]);
  });
});
