import Anthropic from "@anthropic-ai/sdk";
import { Request, Response } from "express";
import dotenv from 'dotenv';
import YaeMiko from '../characters/index';


dotenv.config()

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const createChat = async (req: Request, res: Response) => {
  console.log(req.body)
  try {
 
    const systemMessage = ``
    const userMessage = {
      role: "assistant",
      content: "hello, Yae Miko. I am excited to meet you. I have heard so much about you and your wisdom. I hope you can guide me on my journey of self-discovery and enlightenment"
    };
    //@ts-ignore
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 2000,
      temperature: 1,
      system: systemMessage,
      messages: [
        {
          "role": "user",
          "content": [{"type": "text", text:userMessage.content}]
        }
      ]
    });

    return res.status(200).json(response.content);
  } catch (error) {
    console.error("Error creating chat:", error);
    return res.status(500).json({ error: "An error occurred while creating the chat." });
  }
};

export default createChat;
