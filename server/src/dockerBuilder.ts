import fs from 'fs';
import path from 'path';
import os from 'os';
import { promisify } from 'util';
import tar from 'tar-fs';
import Docker from 'dockerode';

const docker = new Docker();
const mkdtemp = promisify(fs.mkdtemp);
const writeFile = promisify(fs.writeFile);
const rmDir = promisify(fs.rm);

interface ToolDef {
  name: string;
  description?: string;
  inputSchema?: any;
}

export async function buildAndPushImage(mcpId: string, tools: ToolDef[]): Promise<string> {
  const tmpDir = await mkdtemp(path.join(os.tmpdir(), `mcp-${mcpId}-`));
  try {
    // 1. Generate index.js
    const functions = tools.map(t => `  ${t.name}: async function(args) { return { ok: true, args }; }`).join(',\n');
    const indexJs = `const jayson = require('jayson');\nconst server = new jayson.Server({\n${functions}\n});\nserver.http().listen(8080);`;
    await writeFile(path.join(tmpDir, 'index.js'), indexJs, 'utf8');

    // 2. Dockerfile
    const dockerfile = `FROM node:18-alpine\nWORKDIR /app\nCOPY index.js ./index.js\nRUN npm install jayson\nEXPOSE 8080\nCMD [\"node\", \"index.js\"]`;
    await writeFile(path.join(tmpDir, 'Dockerfile'), dockerfile, 'utf8');

    // 3. Build image
    const registry = process.env.CONTAINER_REGISTRY || '';
    const tag = `${registry ? registry + '/' : ''}mcp-lite-${mcpId}:latest`;
    const tarStream = tar.pack(tmpDir);

    await new Promise((resolve, reject) => {
      docker.buildImage(tarStream, { t: tag }, (err, output) => {
        if (err) return reject(err);
        output?.on('data', (d: Buffer) => process.stdout.write(d.toString()));
        output?.on('end', resolve);
      });
    });

    // 4. Push (if registry set + credentials)
    if (registry) {
      const authconfig = process.env.DOCKER_USERNAME ? {
        username: process.env.DOCKER_USERNAME,
        password: process.env.DOCKER_PASSWORD,
      } : undefined;
      await new Promise((resolve, reject) => {
        docker.getImage(tag).push({ authconfig }, (err, stream) => {
          if (err) return reject(err);
          if (!stream) return reject(new Error('No stream'));
          stream.on('data', (d: Buffer) => process.stdout.write(d.toString()));
          stream.on('end', resolve);
        });
      });
    }

    // 5. Return endpoint URL placeholder
    const baseDomain = process.env.MCP_BASE_DOMAIN || 'example.com';
    return `https://mcp-${mcpId}.${baseDomain}/rpc`;
  } finally {
    // Clean temp dir
    await rmDir(tmpDir, { recursive: true, force: true });
  }
} 