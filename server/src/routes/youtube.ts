import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { v4 as uuidv4 } from 'uuid';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

interface VideoFormat {
  format_id: string;
  ext: string;
  quality: string;
  filesize: number;
  format_note: string;
  acodec?: string;
  vcodec?: string;
  abr?: number;
  vbr?: number;
  height?: number;
}

interface VideoInfo {
  title: string;
  thumbnail: string;
  duration: number;
  uploader: string;
  description: string;
  view_count: number;
  upload_date: string;
  formats: any[];
}

interface TrimSettings {
  startTime: number;
  endTime: number;
}

interface YouTubeInfoRequest {
  url: string;
}

interface YouTubeDownloadRequest {
  url: string;
  format_id: string;
  format_ext: string;
  trim?: TrimSettings;
  filename?: string;
}

// Function to execute yt-dlp commands
const executeYtDlp = (args: string[]): Promise<string> => {
  return new Promise((resolve, reject) => {
    const process = spawn('yt-dlp', args);
    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve(stdout);
      } else {
        reject(new Error(`yt-dlp failed: ${stderr}`));
      }
    });
  });
};

// Function to execute ffmpeg commands for trimming
const executeFFmpeg = (args: string[]): Promise<void> => {
  return new Promise((resolve, reject) => {
    const process = spawn('ffmpeg', args);
    let stderr = '';

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`ffmpeg failed: ${stderr}`));
      }
    });
  });
};

async function youtubeRoutes(fastify: FastifyInstance) {
  // Route to get video information
  fastify.post<{ Body: YouTubeInfoRequest }>('/api/youtube/info', async (request, reply) => {
    try {
      const { url } = request.body;

      if (!url) {
        return reply.status(400).send({ error: 'URL is required' });
      }

      // Validate YouTube URL
      const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/;
      if (!youtubeRegex.test(url)) {
        return reply.status(400).send({ error: 'Invalid YouTube URL' });
      }

      // Get video info using yt-dlp
      const args = [
        '--dump-json',
        '--no-playlist',
        '--format', 'best',
        url
      ];

      const output = await executeYtDlp(args);
      const videoInfo: VideoInfo = JSON.parse(output);

      // Process and clean up the response
      const processedInfo = {
        title: videoInfo.title,
        thumbnail: videoInfo.thumbnail,
        duration: videoInfo.duration,
        uploader: videoInfo.uploader,
        description: videoInfo.description || '',
        view_count: videoInfo.view_count || 0,
        upload_date: videoInfo.upload_date,
        formats: videoInfo.formats.filter((format: any) => {
          // Filter out formats without proper file sizes or broken formats
          return format.filesize || format.filesize_approx;
        }).map((format: any) => ({
          format_id: format.format_id,
          ext: format.ext,
          quality: format.height ? `${format.height}p` : format.format_note || 'Unknown',
          filesize: format.filesize || format.filesize_approx || 0,
          format_note: format.format_note || `${format.height || 'Unknown'}p ${format.ext?.toUpperCase() || ''}`,
          height: format.height,
          vcodec: format.vcodec,
          acodec: format.acodec,
          abr: format.abr,
          vbr: format.vbr
        }))
      };

      return processedInfo;
    } catch (error) {
      fastify.log.error('Error fetching video info:', error);
      return reply.status(500).send({ error: 'Failed to fetch video information' });
    }
  });

  // Route to download video
  fastify.post<{ Body: YouTubeDownloadRequest }>('/api/youtube/download', async (request, reply) => {
    const tempDir = path.join(__dirname, '../../temp');
    let tempFilePath = '';
    let finalFilePath = '';

    try {
      const { url, format_id, format_ext, trim, filename } = request.body;

      if (!url || !format_id || !format_ext) {
        return reply.status(400).send({ error: 'URL, format_id, and format_ext are required' });
      }

      // Create temp directory if it doesn't exist
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const uniqueId = uuidv4();
      const originalFilename = `${uniqueId}_original.${format_ext}`;
      const finalFilename = filename || `${uniqueId}.${format_ext}`;
      
      tempFilePath = path.join(tempDir, originalFilename);
      finalFilePath = path.join(tempDir, finalFilename);

      // Download video using yt-dlp
      const ytDlpArgs = [
        '--format', format_id,
        '--output', tempFilePath,
        '--no-playlist',
        url
      ];

      // Add audio conversion for MP3
      if (format_ext === 'mp3') {
        ytDlpArgs.push('--extract-audio', '--audio-format', 'mp3', '--audio-quality', '0');
      }

      await executeYtDlp(ytDlpArgs);

      // Handle trimming if requested
      if (trim && trim.startTime !== undefined && trim.endTime !== undefined) {
        const { startTime, endTime } = trim as TrimSettings;
        
        // Validate trim times
        if (startTime >= endTime) {
          throw new Error('Invalid trim settings: start time must be less than end time');
        }

        // Use ffmpeg to trim the video/audio
        const ffmpegArgs = [
          '-i', tempFilePath,
          '-ss', startTime.toString(),
          '-to', endTime.toString(),
          '-c', 'copy', // Copy streams without re-encoding for speed
          '-avoid_negative_ts', 'make_zero',
          finalFilePath,
          '-y' // Overwrite output file
        ];

        await executeFFmpeg(ffmpegArgs);
        
        // Remove the original file
        await unlink(tempFilePath);
      } else {
        // No trimming, just rename/move the file
        fs.renameSync(tempFilePath, finalFilePath);
      }

      // Send the file using Fastify's sendFile
      const stream = fs.createReadStream(finalFilePath);
      
      reply.header('Content-Disposition', `attachment; filename="${finalFilename}"`);
      reply.type(format_ext === 'mp3' ? 'audio/mpeg' : 'video/mp4');
      
      // Clean up the file after sending
      stream.on('end', () => {
        fs.unlink(finalFilePath, (unlinkErr) => {
          if (unlinkErr) {
            fastify.log.error('Error cleaning up file:', unlinkErr);
          }
        });
      });

      return reply.send(stream);

    } catch (error) {
      fastify.log.error('Error downloading video:', error);
      
      // Clean up temp files on error
      [tempFilePath, finalFilePath].forEach(filePath => {
        if (filePath && fs.existsSync(filePath)) {
          fs.unlink(filePath, (err) => {
            if (err) fastify.log.error('Error cleaning up temp file:', err);
          });
        }
      });

      return reply.status(500).send({ error: 'Failed to download video' });
    }
  });

  // Route to get supported formats for a video
  fastify.post<{ Body: YouTubeInfoRequest }>('/api/youtube/formats', async (request, reply) => {
    try {
      const { url } = request.body;

      if (!url) {
        return reply.status(400).send({ error: 'URL is required' });
      }

      // Get available formats using yt-dlp
      const args = [
        '--list-formats',
        '--no-playlist',
        url
      ];

      const output = await executeYtDlp(args);
      
      // Parse the formats output (this is a simplified version)
      const formats = output.split('\n')
        .filter(line => line.includes('mp4') || line.includes('webm') || line.includes('m4a'))
        .map(line => {
          const parts = line.trim().split(/\s+/);
          return {
            format_id: parts[0],
            ext: parts[1],
            quality: parts[2] || 'unknown',
            note: parts.slice(3).join(' ')
          };
        });

      return { formats };
    } catch (error) {
      fastify.log.error('Error fetching formats:', error);
      return reply.status(500).send({ error: 'Failed to fetch video formats' });
    }
  });

  // Health check route
  fastify.get('/api/youtube/health', async (request, reply) => {
    return { 
      status: 'ok', 
      message: 'YouTube downloader service is running',
      dependencies: {
        ytdlp: 'Required for video info and download',
        ffmpeg: 'Required for video trimming'
      }
    };
  });
}

export default youtubeRoutes; 