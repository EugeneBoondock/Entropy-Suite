declare module 'tar-fs' {
  import { Readable } from 'node:stream';
  function pack(dir: string): Readable;
  export = { pack };
} 