import { FastifyInstance } from 'fastify';
import { PythonShell } from 'python-shell';
import path from 'path';

export default async function plagiarismRoutes(fastify: FastifyInstance) {
  // Plagiarism detection endpoint
  fastify.post('/detect-plagiarism', async (request, reply) => {
    try {
      const { text } = request.body as { text: string };

      if (!text || text.trim().length < 10) {
        reply.status(400);
        return { error: 'Text is required and must be at least 10 characters' };
      }

      // Path to Python script
      const scriptPath = path.join(__dirname, '../../python_services/plagiarism_detector.py');

      // Run Python script
      const options = {
        mode: 'text' as const,
        pythonPath: 'python', // or 'python3' on some systems
        args: [text],
        scriptPath: path.dirname(scriptPath)
      };

      try {
        const results = await PythonShell.run('plagiarism_detector_simple.py', options);
        const result = JSON.parse(results[0]);
        
        return {
          success: true,
          plagiarism: result
        };
      } catch (pythonError: any) {
        console.error('Python script error:', pythonError);
        
        // Fallback to basic analysis if Python fails
        return {
          success: true,
          plagiarism: {
            score: 0,
            matches: [],
            message: 'Python analysis unavailable, using basic analysis',
            fallback: true
          }
        };
      }

    } catch (error) {
      console.error('Plagiarism detection error:', error);
      reply.status(500);
      return { error: 'Failed to analyze text for plagiarism' };
    }
  });

  // AI detection endpoint
  fastify.post('/detect-ai', async (request, reply) => {
    try {
      const { text } = request.body as { text: string };

      if (!text || text.trim().length < 10) {
        reply.status(400);
        return { error: 'Text is required and must be at least 10 characters' };
      }

      // Path to Python script
      const scriptPath = path.join(__dirname, '../../python_services/ai_detector.py');

      // Run Python script
      const options = {
        mode: 'text' as const,
        pythonPath: 'python', // or 'python3' on some systems
        args: [text],
        scriptPath: path.dirname(scriptPath)
      };

      try {
        const results = await PythonShell.run('ai_detector_simple.py', options);
        const result = JSON.parse(results[0]);
        
        return {
          success: true,
          aiDetection: result
        };
      } catch (pythonError: any) {
        console.error('Python AI detection error:', pythonError);
        
        // Fallback to basic analysis if Python fails
        return {
          success: true,
          aiDetection: {
            score: 0,
            indicators: [],
            message: 'Python AI detection unavailable, using basic analysis',
            fallback: true
          }
        };
      }

    } catch (error) {
      console.error('AI detection error:', error);
      reply.status(500);
      return { error: 'Failed to analyze text for AI content' };
    }
  });

  // Combined analysis endpoint
  fastify.post('/analyze-content', async (request, reply) => {
    try {
      const { text } = request.body as { text: string };

      if (!text || text.trim().length < 10) {
        reply.status(400);
        return { error: 'Text is required and must be at least 10 characters' };
      }

      // Run both analyses in parallel
      const plagiarismPromise = fastify.inject({
        method: 'POST',
        url: '/api/plagiarism/detect-plagiarism',
        payload: { text }
      });

      const aiPromise = fastify.inject({
        method: 'POST',
        url: '/api/plagiarism/detect-ai',
        payload: { text }
      });

      const [plagiarismResponse, aiResponse] = await Promise.all([
        plagiarismPromise,
        aiPromise
      ]);

      const plagiarismResult = JSON.parse(plagiarismResponse.payload);
      const aiResult = JSON.parse(aiResponse.payload);

      // Calculate overall risk
      const plagiarismScore = plagiarismResult.plagiarism?.score || 0;
      const aiScore = aiResult.aiDetection?.score || 0;
      const maxScore = Math.max(plagiarismScore, aiScore);
      
      let overallRisk: 'Low' | 'Medium' | 'High' = 'Low';
      if (maxScore > 60) overallRisk = 'High';
      else if (maxScore > 30) overallRisk = 'Medium';

      // Text analysis
      const words = text.trim().split(/\s+/);
      const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
      const uniqueWords = new Set(words.map(w => w.toLowerCase())).size;

      return {
        success: true,
        analysis: {
          plagiarismScore,
          aiScore,
          overallRisk,
          plagiarismMatches: plagiarismResult.plagiarism?.matches || [],
          aiIndicators: aiResult.aiDetection?.indicators || [],
          textStats: {
            totalWords: words.length,
            uniqueWords,
            sentences: sentences.length,
            avgWordsPerSentence: words.length / sentences.length,
            vocabularyDiversity: (uniqueWords / words.length) * 100
          }
        }
      };

    } catch (error) {
      console.error('Content analysis error:', error);
      reply.status(500);
      return { error: 'Failed to analyze content' };
    }
  });
} 