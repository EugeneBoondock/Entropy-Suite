import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile as _fetchFile } from '@ffmpeg/util';
import { toPng } from 'html-to-image';

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
      await this.ffmpeg.load({
        coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.js',
        wasmURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.wasm',
        workerURL: 'https://unpkg.com/@ffmpeg/core@0.12.4/dist/ffmpeg-core.worker.js'
      });
      this.isFFmpegLoaded = true;
    }
  }

  private async fetchRandomBackgroundMusic(): Promise<ArrayBuffer> {
    try {
      // Using Free Music Archive API to get a random track
      const response = await fetch('https://freemusicarchive.org/api/get/tracks.json?api_key=YOUR_FMA_API_KEY&limit=1&page=' + Math.floor(Math.random() * 100));
      const data = await response.json();
      
      if (data.dataset && data.dataset.length > 0) {
        const trackUrl = data.dataset[0].track_url;
        const audioResponse = await fetch(trackUrl);
        return await audioResponse.arrayBuffer();
      }
      throw new Error('No tracks found');
    } catch (error) {
      console.warn('Failed to fetch random music, using fallback:', error);
      // Fallback: Use a public domain music file
      const fallbackResponse = await fetch('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3');
      return await fallbackResponse.arrayBuffer();
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
    try {
      const videoData = await this.createVideoFromSlides(slideElements, durationPerSlide, progressCallback);
      return new Blob([videoData.buffer], { type: 'video/mp4' });
    } catch (error) {
      console.error('Error exporting video:', error);
      throw new Error('Failed to export video. Please try again.');
    }
  }
}

export const videoExportService = new VideoExportService();
