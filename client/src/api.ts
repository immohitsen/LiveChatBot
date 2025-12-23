const API_URL = "http://localhost:3000/api/chat";

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export const sendMessage = async (message: string, sessionId?: string | null): Promise<ChatResponse> => {
  const response = await fetch(`${API_URL}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!response.ok) {
    throw new Error("Failed to send message");
  }

  return response.json();
};

export interface Message {
  id: number;
  text: string;
  sender: "user" | "ai";
}

export const fetchHistory = async (sessionId: string): Promise<Message[]> => {
  const response = await fetch(`${API_URL}/history/${sessionId}`);
  if (!response.ok) throw new Error("Failed to load history");
  return response.json();
};