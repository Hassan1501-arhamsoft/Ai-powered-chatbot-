import api from "../../../api/axios.js";

export const getConversation = async (conversationId) => {
  const response = await api.get(`/conversations/${conversationId}`);
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get("/conversations");
  return response.data;
};

export const sendMessageStream = async ({ conversationId, message, category, onInit, onChunk, onError }) => {
  try {
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // CRITICAL: This sends the HTTP-Only JWT cookie with the fetch request
      body: JSON.stringify({ conversationId, message, category }),
    });

    if (!response.ok) {
      // Let's capture the actual backend error message instead of a generic safety string
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || errorData.message || "Failed to connect to chat service.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop(); 

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;

        if (trimmedLine.startsWith("data: ")) {
          try {
            const dataStr = trimmedLine.slice(6);
            const parsed = JSON.parse(dataStr);
            
           if (parsed.event === "init" && onInit) {
              onInit(parsed.conversationId);
            } else if (parsed.event === "chunk" && onChunk) {
              onChunk(parsed.content);
            } else if (parsed.event === "error" && onError) {
              onError(parsed.message);
            }
          } catch (e) {
            console.error("Stream parsing error:", e);
          }
        }
      }
    }
  } catch (error) {
    if (onError) onError(error.message);
  }
};