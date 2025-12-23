import { Request, Response } from 'express';
import { handleChat } from '../services/chatService';
import { prisma } from '../prisma';

export const chat = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;
    const response = await handleChat(message, sessionId);
    res.json(response);
  } catch (error: any) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    
    const messages = await prisma.message.findMany({
      where: { conversationId: sessionId },
      orderBy: { createdAt: 'asc' },
    });

    // Frontend ke format me convert karo
    const formattedHistory = messages.map(msg => ({
      id: msg.id, // Number/String issue ho sakta hai, ensure types match
      text: msg.content,
      sender: msg.role === 'USER' ? 'user' : 'ai'
    }));

    res.json(formattedHistory);
  } catch (error) {
    console.error("History Error:", error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};