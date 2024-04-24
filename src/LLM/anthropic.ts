import Anthropic from "@anthropic-ai/sdk";
import { Request, Response } from "express";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const createChat = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const systemMessage = {
      role: "system",
      content: {
        type: "text",
        text: "You are an AI assistant with a deep understanding of dream interpretation and symbolism. Your task is to provide users with insightful and meaningful analyses of the symbols, emotions, and narratives present in their dreams. Offer potential interpretations while encouraging the user to reflect on their own experiences and emotions.",
      },
    };

    const userMessage = {
      role: "user",
      content: {
        type: "text",
        text: text,
      },
    };
        //@ts-ignore
      const response = await anthropic.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 2000,
          temperature: 1,
          messages: [systemMessage, userMessage],
      }) 

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ error: "An error occurred while creating the chat." });
  }
};

export default createChat;