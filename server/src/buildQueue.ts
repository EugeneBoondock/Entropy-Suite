import { Queue, Worker, Job } from 'bullmq';
import Docker from 'dockerode';
import { PrismaClient } from '@prisma/client';
import { buildEvents } from './buildEvents.js';
import { deployMcp } from './scheduler.js';

const connection = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export interface BuildJobData {
  mcpId: string;
  tools: any;
}

export const buildQueue = new Queue<BuildJobData>('mcp-builds', { connection });

const prisma = new PrismaClient();
const docker = new Docker();

// Worker to process builds
export const buildWorker = new Worker<BuildJobData>(
  'mcp-builds',
  async (job: Job<BuildJobData>) => {
    const { mcpId, tools } = job.data;
    try {
      await prisma.mCP.update({ where: { id: mcpId }, data: { status: 'BUILDING' } });

      // 🔧  TODO: programmatically generate Dockerfile & context containing user tools
      const tag = `mcp-lite/${mcpId}:latest`;

      await new Promise((resolve, reject) => {
        docker.buildImage({ context: process.cwd(), src: [] }, { t: tag }, (err, output) => {
          if (err) return reject(err);
          output?.on('data', (d: Buffer) => {
            const line = d.toString();
            process.stdout.write(line);
            buildEvents.emit('log', { mcpId, message: line });
          });
          output?.on('end', resolve);
        });
      });
      // Push to registry if configured

      const endpointUrl = await deployMcp(mcpId, tag);
      await prisma.mCP.update({ where: { id: mcpId }, data: { status: 'READY', endpointUrl } });
      buildEvents.emit('log', { mcpId, message: '[BUILD] Completed\n' });
      buildEvents.emit('done', { mcpId });
    } catch (err) {
      console.error('Build failed', err);
      await prisma.mCP.update({ where: { id: mcpId }, data: { status: 'ERROR' } });
      buildEvents.emit('log', { mcpId, message: '[BUILD] Failed\n' });
      buildEvents.emit('done', { mcpId });
    }
  },
  { connection }
);

buildWorker.on('completed', (job) => {
  console.log('Build completed', job.id);
});

buildWorker.on('failed', (job, err) => {
  console.error('Build failed', job?.id, err);
}); 