import { EventEmitter } from 'node:events';

export interface BuildLogEvent {
  mcpId: string;
  message: string;
}

class BuildEvents extends EventEmitter {}

export const buildEvents = new BuildEvents(); 