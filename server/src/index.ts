import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { PrismaClient } from '@prisma/client';
import { supabase } from './supabaseAdmin';
import { buildQueue } from './buildQueue.js';
import authPlugin from './authMiddleware.js';
import subscriptionRoutes from './routes/subscription.js';
import plagiarismRoutes from './routes/plagiarism.js';
import youtubeRoutes from './routes/youtube.js';

const prisma = new PrismaClient();
const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(websocket);
await app.register(authPlugin);
await app.register(subscriptionRoutes);
await app.register(plagiarismRoutes, { prefix: '/api/plagiarism' });
await app.register(youtubeRoutes);

// Health
app.get('/health', async () => ({ status: 'ok' }));

// MCP CRUD (very minimal for now)
app.get('/v1/mcps', async (req: any, reply) => {
  const userId = req.userId as string;
  const list = await prisma.mCP.findMany({ where: { userId } });
  return list;
});

app.post('/v1/mcps', async (req: any, reply) => {
  const userId = req.userId as string;
  const body = req.body as { name: string; description?: string; tools: any };
  const mcp = await prisma.mCP.create({ data: { ...body, userId } });
  await buildQueue.add('build', { mcpId: mcp.id, tools: body.tools });
  return mcp;
});

app.get('/v1/mcps/:id', async (req: any, reply) => {
  // TODO: auth check
  const { id } = req.params as { id: string };
  const mcp = await prisma.mCP.findUnique({ where: { id } });
  if (!mcp) return reply.status(404).send({ error: 'not found' });
  return mcp;
});

// WebSocket for build logs
app.register(async (fastify) => {
  fastify.get('/v1/ws/builds/:mcpId', { websocket: true }, (connection: any, req) => {
    // For demo: stream hello every second
    const timer = setInterval(() => {
      connection.socket.send(JSON.stringify({ message: 'build log line' }));
    }, 1000);

    connection.socket.on('close', () => clearInterval(timer));
  });
});

app.setErrorHandler((err, _req, reply) => {
  app.log.error(err);
  reply.status(500).send({ error: 'internal' });
});

app.listen({ port: 4000, host: '0.0.0.0' }).then(() => {
  console.log('MCP Lite server listening on 4000');
}); 