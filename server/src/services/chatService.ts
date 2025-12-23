import { prisma } from '../prisma';
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize the new GenAI Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

const SYSTEM_INSTRUCTION = `
You are a helpful customer support agent for "SpurStore".
- Shipping: We ship to USA, Canada, and UK. Free shipping over $50.
- Returns: 30-day return policy. Customer pays return shipping.
- Support Hours: Mon-Fri, 9am - 5pm EST.
- Tone: Professional, concise, and friendly. Do not use markdown formatting.
`;

export const handleChat = async (message: string, sessionId?: string) => {
  // 1. Validation
  if (!message || message.trim() === "") {
    throw new Error("Message cannot be empty");
  }

  // 2. Session Management
  let conversationId = sessionId;
  if (!conversationId) {
    const convo = await prisma.conversation.create({});
    conversationId = convo.id;
  }

  // 3. Save User Message to DB
  await prisma.message.create({
    data: { 
      content: message, 
      role: 'USER', 
      conversationId: conversationId 
    }
  });

  // 4. Fetch History for Context
  const history = await prisma.message.findMany({
    where: { conversationId: conversationId },
    orderBy: { createdAt: 'asc' },
    take: 10 // Limit context window
  });

  // 5. Format History for the new SDK
  // The new SDK expects 'contents' to be an array of objects with 'role' and 'parts'
  const contents = history.map((msg: any) => ({
    role: msg.role === 'USER' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }));

  // 6. Call Gemini (Latest SDK Syntax)
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
    },
    contents: contents, // This includes the latest user message we just saved
  });

  const aiReply = response.text || "I apologize, I couldn't generate a response.";

  // 7. Save AI Reply to DB
  await prisma.message.create({
    data: { 
      content: aiReply, 
      role: 'ASSISTANT', 
      conversationId: conversationId 
    }
  });

  return { reply: aiReply, sessionId: conversationId };
};