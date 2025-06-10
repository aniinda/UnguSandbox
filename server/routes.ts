import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { storage } from "./storage";
import { extractRateCardDataOpenAI } from "./openai";

import { Router } from 'express';
const router = Router();

// Anthropic setup
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY_ENV_VAR || "default_key",
});

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Multer setup for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Authentication middleware (simple token-based for data engineer access)
const authenticateDataEngineer = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader !== "Bearer data_engineer_test_token") {
    return res.status(401).json({ error: "Unauthorized access" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Authentication check
  app.get('/api/auth/check', authenticateDataEngineer, (req, res) => {
    res.json({ authenticated: true, role: 'data_engineer' });
  });

  // File upload and processing
  app.post('/api/data-engineer/upload', authenticateDataEngineer, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { mediaOwner = 'Unknown', notes = '', aiProvider = 'anthropic' } = req.body;
      const filePath = req.file.path;
      const fileName = req.file.originalname;
      const fileExt = path.extname(fileName).toLowerCase();

      // Create processing job
      const job = await storage.createProcessingJob({
        jobType: 'rate_card_extraction',
        fileName,
        mediaOwner,
        status: 'processing',
        progress: 0,
        totalChunks: 1,
        processedChunks: 0,
        extractionNotes: notes,
      });

      // Extract text based on file type
      let extractedText = '';
      
      try {
        if (fileExt === '.pdf') {
          const { default: pdfParse } = await import('pdf-parse');
          const dataBuffer = fs.readFileSync(filePath);
          const data = await pdfParse(dataBuffer);
          extractedText = data.text;
        } else if (fileExt === '.docx' || fileExt === '.doc') {
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ path: filePath });
          extractedText = result.value;
        }

        // Process with selected AI provider
        let results = [];
        
        if (aiProvider === 'openai') {
          // Use OpenAI for extraction
          try {
            const openaiResults = await extractRateCardDataOpenAI(extractedText);
            // Convert OpenAI format to our standard format
            results = [];
            if (openaiResults.mediaTypes) {
              for (const mediaType of openaiResults.mediaTypes) {
                for (const placement of mediaType.placements || []) {
                  results.push({
                    mediaType: mediaType.type,
                    mediaFormat: placement.size || placement.name,
                    placementName: placement.name,
                    dimensions: placement.size,
                    costMedia4weeks: placement.baseRate ? `${placement.currency || '$'}${placement.baseRate}` : null,
                    productionCost: placement.discountedRate ? `${placement.currency || '$'}${placement.discountedRate}` : null,
                    totalCost: placement.baseRate ? `${placement.currency || '$'}${placement.baseRate}` : null,
                    notes: placement.notes || openaiResults.additionalTerms,
                    confidence: "medium"
                  });
                }
              }
            }
          } catch (error) {
            console.error('OpenAI processing error:', error);
            throw error;
          }
        } else {
          // Use Anthropic Claude (default)
          // the newest Anthropic model is "claude-sonnet-4-20250514" which was released May 14, 2025. Use this by default unless user has already selected claude-3-7-sonnet-20250219
          const prompt = `
You are a data extraction specialist. Extract rate card information from this document text.

Extract the following information for each advertising placement:
- Media Type (Print, Digital, Radio, TV, etc.)
- Media Format (Full Page, Half Page, Banner, etc.)
- Placement Name
- Dimensions
- Cost for 4 weeks of media
- Production Cost
- Total Cost
- Any special notes

Return the data as a JSON array with this structure:
[
  {
    "mediaType": "Print",
    "mediaFormat": "Full Page",
    "placementName": "Premium Placement",
    "dimensions": "210mm x 297mm",
    "costMedia4weeks": "$5,000",
    "productionCost": "$800",
    "totalCost": "$5,800",
    "notes": "Prime position",
    "confidence": "high"
  }
]

Document text:
${extractedText}
`;

          const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            messages: [{ role: 'user', content: prompt }],
          });

          try {
            const content = response.content[0];
            if (content.type === 'text') {
              const jsonMatch = content.text.match(/\[[\s\S]*\]/);
              if (jsonMatch) {
                results = JSON.parse(jsonMatch[0]);
              }
            }
          } catch (parseError) {
            console.error('Error parsing Claude response:', parseError);
          }
        }

        // Save results to database
        for (const result of results) {
          await storage.createRatecardEntry({
            jobId: job.id,
            originalFileName: fileName,
            ...result,
          });
        }

        // Update job status
        await storage.updateProcessingJob(job.id, {
          status: 'completed',
          progress: 100,
          processedChunks: 1,
          resultData: results,
        });

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.json({
          jobId: job.id,
          status: 'completed',
          results: results.length,
          message: `Successfully extracted ${results.length} rate card entries`
        });

      } catch (processingError) {
        // Update job with error status
        await storage.updateProcessingJob(job.id, {
          status: 'failed',
          errorMessage: processingError instanceof Error ? processingError.message : 'Processing failed',
        });

        // Clean up uploaded file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }

        throw processingError;
      }

    } catch (error) {
      console.error('Upload processing error:', error);
      res.status(500).json({ 
        error: 'Processing failed', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get available AI providers
  app.get('/api/data-engineer/providers', authenticateDataEngineer, async (req, res) => {
    try {
      const providers = [];
      
      if (process.env.ANTHROPIC_API_KEY) {
        providers.push({
          id: 'anthropic',
          name: 'Anthropic Claude Sonnet 4',
          description: 'Advanced document analysis with superior reasoning',
          available: true
        });
      }
      
      if (process.env.OPENAI_API_KEY) {
        providers.push({
          id: 'openai', 
          name: 'OpenAI GPT-4o',
          description: 'Fast structured extraction with vision capabilities',
          available: true
        });
      }
      
      res.json(providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
      res.status(500).json({ error: 'Failed to fetch available providers' });
    }
  });

  // Get processing jobs
  app.get('/api/data-engineer/jobs', authenticateDataEngineer, async (req, res) => {
    try {
      const jobs = await storage.getProcessingJobs(50);
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  });

  // Get job details with results
  app.get('/api/data-engineer/jobs/:id', authenticateDataEngineer, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      const job = await storage.getProcessingJob(jobId);
      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      const results = await storage.getRatecardEntriesByJobId(jobId);
      res.json({ ...job, results });
    } catch (error) {
      console.error('Error fetching job details:', error);
      res.status(500).json({ error: 'Failed to fetch job details' });
    }
  });

  // Get all results
  app.get('/api/data-engineer/results', authenticateDataEngineer, async (req, res) => {
    try {
      const results = await storage.getAllRatecardEntries();
      res.json(results);
    } catch (error) {
      console.error('Error fetching results:', error);
      res.status(500).json({ error: 'Failed to fetch results' });
    }
  });

  // Export results as CSV
  app.get('/api/data-engineer/jobs/:id/export', authenticateDataEngineer, async (req, res) => {
    try {
      const jobId = parseInt(req.params.id);
      
      const results = await storage.getRatecardEntriesByJobId(jobId);
      if (results.length === 0) {
        return res.status(404).json({ error: 'No results found for this job' });
      }

      const headers = [
        'Media Type', 'Media Format', 'Placement Name', 'Dimensions',
        'Media Cost (4 weeks)', 'Production Cost', 'Total Cost', 'Notes', 'Confidence'
      ];

      const csvRows = [
        headers.join(','),
        ...results.map(r => [
          r.mediaType || '',
          r.mediaFormat || '',
          r.placementName || '',
          r.dimensions || '',
          r.costMedia4weeks || '',
          r.productionCost || '',
          r.totalCost || '',
          r.notes || '',
          r.confidence || ''
        ].map(field => `"${field}"`).join(','))
      ];

      const csvContent = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="rate_card_results.csv"');
      res.send(csvContent);

    } catch (error) {
      console.error('Error exporting results:', error);
      res.status(500).json({ error: 'Failed to export results' });
    }
  });

  // Export all results as CSV
  app.get('/api/data-engineer/export-all', authenticateDataEngineer, async (req, res) => {
    try {
      const results = await storage.getAllRatecardEntries();
      if (results.length === 0) {
        return res.status(404).json({ error: 'No results found' });
      }

      const headers = [
        'Media Type', 'Media Format', 'Placement Name', 'Dimensions',
        'Media Cost (4 weeks)', 'Production Cost', 'Total Cost', 'Notes', 'Confidence', 'Source File'
      ];

      const csvRows = [
        headers.join(','),
        ...results.map(r => [
          r.mediaType || '',
          r.mediaFormat || '',
          r.placementName || '',
          r.dimensions || '',
          r.costMedia4weeks || '',
          r.productionCost || '',
          r.totalCost || '',
          r.notes || '',
          r.confidence || '',
          r.originalFileName || ''
        ].map(field => `"${field}"`).join(','))
      ];

      const csvContent = csvRows.join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="all_rate_card_results.csv"');
      res.send(csvContent);

    } catch (error) {
      console.error('Error exporting all results:', error);
      res.status(500).json({ error: 'Failed to export results' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
