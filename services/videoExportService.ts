import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile as _fetchFile } from '@ffmpeg/util';
import { toPng } from 'html-to-image';

// Get the base URL for FFmpeg files
const getFFmpegCorePath = (filename: string) => {
  return new URL(`/node_modules/@ffmpeg/core/dist/${filename}`, import.meta.url).href;
};

const JAMENDO_CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID || '';
const JAMENDO_API_URL = import.meta.env.VITE_JAMENDO_API_URL || 'https://api.jamendo.com/v3.0';

interface JamendoTrack {
  id: string;
  name: string;
  audio: string;
  audiodownload: string;
  duration: number;
  artist_name: string;
  album_name: string;
  audio_download_allowed: boolean;
}

type ProgressCallback = (progress: number) => void;

export class VideoExportService {
  private ffmpeg: FFmpeg;
  private isFFmpegLoaded = false;
  
  constructor() {
    this.ffmpeg = new FFmpeg();
    this.ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });
  }

  private async ensureFFmpegLoaded() {
    if (!this.isFFmpegLoaded) {
      try {
        const corePath = getFFmpegCorePath('ffmpeg-core.js');
        const wasmPath = getFFmpegCorePath('ffmpeg-core.wasm');
        const workerPath = getFFmpegCorePath('ffmpeg-core.worker.js');
        
        console.log('Loading FFmpeg with paths:', { corePath, wasmPath, workerPath });
        
        await this.ffmpeg.load({
          coreURL: corePath,
          wasmURL: wasmPath,
          workerURL: workerPath,
        });
        
        this.isFFmpegLoaded = true;
        console.log('FFmpeg loaded successfully');
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
        throw new Error(`Failed to load FFmpeg: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  private async fetchRandomBackgroundMusic(): Promise<ArrayBuffer> {
    try {
      if (!JAMENDO_CLIENT_ID) {
        throw new Error('Jamendo client ID not configured');
      }

      // Fetch a random track from Jamendo
      const response = await fetch(
        `${JAMENDO_API_URL}/tracks/?client_id=${JAMENDO_CLIENT_ID}` +
        '&format=json' +
        '&limit=1' +
        '&audioformat=mp32' +
        '&groupby=artist_id' +
        '&order=popularity_total' +
        `&offset=${Math.floor(Math.random() * 100)}`
      );

      if (!response.ok) {
        throw new Error(`Jamendo API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const track: JamendoTrack = data.results[0];
        
        if (!track.audio_download_allowed) {
          throw new Error('Track download not allowed');
        }

        // Use the download URL if available, otherwise fall back to streaming URL
        const audioUrl = track.audiodownload || track.audio;
        console.log(`Using track: ${track.name} by ${track.artist_name}`);
        
        const audioResponse = await fetch(audioUrl);
        if (!audioResponse.ok) {
          throw new Error(`Failed to fetch audio: ${audioResponse.statusText}`);
        }
        
        return await audioResponse.arrayBuffer();
      }
      
      throw new Error('No tracks found in Jamendo response');
    } catch (error) {
      console.warn('Failed to fetch music from Jamendo, using fallback:', error);
      // Fallback: Use a public domain music file
      try {
        const fallbackResponse = await fetch('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
        if (!fallbackResponse.ok) {
          throw new Error('Failed to load fallback music');
        }
        return await fallbackResponse.arrayBuffer();
      } catch (fallbackError) {
        console.error('Failed to load fallback music:', fallbackError);
        // Return empty array buffer as last resort
        return new ArrayBuffer(0);
      }
    }
  }

  private async createVideoFromSlides(
    slideElements: HTMLElement[],
    durationPerSlide: number,
    progressCallback: ProgressCallback
  ): Promise<Uint8Array> {
    await this.ensureFFmpegLoaded();
    // Convert slides to images and write them to FFmpeg's virtual filesystem
    const imageFiles: string[] = [];
    const totalSlides = slideElements.length;
    
    for (let i = 0; i < totalSlides; i++) {
      const element = slideElements[i];
      const dataUrl = await toPng(element, { 
        quality: 1,
        backgroundColor: '#ffffff'
      });
      
      const response = await fetch(dataUrl);
      const buffer = await response.arrayBuffer();
      const fileName = `slide_${i.toString().padStart(4, '0')}.png`;
      
      await this.ffmpeg.writeFile(fileName, new Uint8Array(buffer));
      imageFiles.push(fileName);
      
      progressCallback((i / totalSlides) * 50);
    }
    
    // Create a text file with the slide sequence
    const concatText = imageFiles.map(file => {
      return `file '${file}'\nduration ${durationPerSlide}`;
    }).join('\n');
    
    await this.ffmpeg.writeFile('concat.txt', concatText);
    
    // Get background music
    const musicBuffer = await this.fetchRandomBackgroundMusic();
    await this.ffmpeg.writeFile('background.mp3', new Uint8Array(musicBuffer));
    
    // Run FFmpeg to create the video
    await this.ffmpeg.exec([
      '-f', 'concat',
      '-safe', '0',
      '-i', 'concat.txt',
      '-i', 'background.mp3',
      '-c:v', 'libx264',
      '-pix_fmt', 'yuv420p',
      '-vf', 'fps=30',
      '-tune', 'stillimage',
      '-c:a', 'aac',
      '-shortest',
      '-y',
      'output.mp4'
    ]);
    
    progressCallback(90);
    
    // Get the result
    const data = await this.ffmpeg.readFile('output.mp4');
    const videoData = new Uint8Array(data as ArrayBuffer);
    
    // Clean up
    await Promise.all([
      this.ffmpeg.deleteFile('output.mp4'),
      this.ffmpeg.deleteFile('background.mp3'),
      this.ffmpeg.deleteFile('concat.txt'),
      ...imageFiles.map(file => this.ffmpeg.deleteFile(file))
    ]);
    
    progressCallback(100);
    return videoData;
  }

  public async exportAsVideo(
    slideElements: HTMLElement[],
    durationPerSlide: number = 5,
    progressCallback: ProgressCallback = () => {}
  ): Promise<Blob> {
    console.log('Starting video export with', slideElements.length, 'slides');
    try {
      await this.ensureFFmpegLoaded();
      const videoData = await this.createVideoFromSlides(slideElements, durationPerSlide, progressCallback);
      console.log('Video export completed successfully');
      return new Blob([videoData.buffer], { type: 'video/mp4' });
    } catch (error) {
      console.error('Error in exportAsVideo:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to export video: ${error.message}`);
      }
      throw new Error('Failed to export video. Please check the console for details.');
    }
  }
}

export const videoExportService = new VideoExportService();
