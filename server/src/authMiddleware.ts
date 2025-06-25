import fp from 'fastify-plugin';
import type { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET as string;

export interface JwtPayload {
  sub: string;
  email?: string;
  [key: string]: any;
}

export default fp(async (fastify) => {
  fastify.decorateRequest('userId', null as string | null);

  fastify.addHook('preHandler', async (req: FastifyRequest, reply: FastifyReply) => {
    const auth = req.headers['authorization'];
    if (!auth?.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'missing auth' });
    }

    const token = auth.slice(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      (req as any).userId = decoded.sub;
    } catch {
      return reply.status(401).send({ error: 'invalid token' });
    }
  });
}); 