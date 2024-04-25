import {Router} from "express";


import createChat from "../LLM/anthropic";


const router = Router();

router.post('/chat', createChat);

export default router;