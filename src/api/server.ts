import express, { Express, Request, Response } from 'express';
import { Agent } from '../agent/Agent';

export function createServer(app: Express, agent: Agent): void {
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'appflash-ai-agent' });
  });

  app.post('/chat', async (req: Request, res: Response) => {
    const { prompt } = req.body as { prompt?: string };

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const result = await agent.run(prompt);
    res.json(result);
  });
}
