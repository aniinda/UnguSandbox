# Data Engineer Portal - Replit Sandbox Access

## Getting Started

This is a fully functional Replit sandbox for the Data Engineer Portal. You have complete access to modify the backend code, database, and frontend.

**Access URL:** https://9e8cb107-c911-4a8b-ba6d-4c577bcb97ca-00-1yx2gfpng3gq3.janeway.replit.dev/

## How to Access & Edit Code

1. **Fork this Replit** - Click "Fork" to create your own copy
2. **Direct file editing** - Use the Replit editor to modify any backend files
3. **Live development** - Changes automatically reload the server

# Data Engineer Portal - Backend Development Guide

## Project Structure

```
server/
├── index.ts          # Main server entry point
├── routes.ts         # API routes and endpoints
├── db.ts            # Database connection (PostgreSQL)
├── storage.ts       # Database operations and models
├── anthropic.ts     # Anthropic Claude integration (not yet created)
├── openai.ts        # OpenAI GPT-4o integration
└── vite.ts          # Vite development server setup

shared/
└── schema.ts        # Database schema and types

client/
└── src/             # React frontend application
```

## Backend API Endpoints

### Authentication
- No authentication required (simplified for development)

### Core Endpoints
- `GET /api/data-engineer/providers` - List available AI providers
- `GET /api/data-engineer/jobs` - Get all processing jobs
- `GET /api/data-engineer/jobs/:id` - Get job details with results
- `POST /api/data-engineer/upload` - Upload and process documents
- `GET /api/data-engineer/results` - Get all extracted rate card entries
- `GET /api/data-engineer/export/:jobId` - Export job results as CSV

## Database Schema

### Tables
1. **processing_jobs** - Tracks document processing jobs
2. **ratecard_entries** - Stores extracted rate card data

### Key Models
```typescript
// Processing Job
{
  id: number;
  jobType: string;
  fileName: string;
  mediaOwner: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  totalChunks: number;
  processedChunks: number;
  resultData: any;
  extractionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Rate Card Entry
{
  id: number;
  jobId: number;
  originalFileName: string;
  mediaType: string;
  mediaFormat: string;
  placementName: string;
  dimensions: string;
  costMedia4weeks: string;
  productionCost: string;
  totalCost: string;
  notes: string;
  confidence: string;
  createdAt: Date;
}
```

## AI Provider Integration

### Anthropic Claude Sonnet 4
- File: `server/anthropic.ts` (needs to be created)
- Environment variable: `ANTHROPIC_API_KEY`
- Model: `claude-sonnet-4-20250514`

### OpenAI GPT-4o
- File: `server/openai.ts`
- Environment variable: `OPENAI_API_KEY`
- Model: `gpt-4o`

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run db:push
```

## File Upload Processing Flow

1. **Upload** (`POST /api/data-engineer/upload`)
   - Accepts PDF, DOC, DOCX, XLS, XLSX files
   - Creates processing job in database
   - Extracts text from document
   - Processes with selected AI provider
   - Saves results to ratecard_entries table
   - Updates job status

2. **AI Provider Selection**
   - Frontend sends `aiProvider` parameter ('anthropic' or 'openai')
   - Backend routes to appropriate processing function
   - Both providers extract structured rate card data

## Common Issues & Fixes

### File Upload Errors
- Check file path handling in routes.ts
- `uploads/` directory is created automatically if missing
- Verify file type validation

### AI Processing Errors
- Verify API keys are set in environment
- Check prompt formatting for each provider
- Handle JSON parsing errors from AI responses

### Database Connection Issues
- Check DATABASE_URL environment variable
- Verify PostgreSQL is running
- Run database migrations if needed

## Environment Variables Required

```
DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

## Making Backend Changes

1. **Modify API routes** in `server/routes.ts`
2. **Update database schema** in `shared/schema.ts`
3. **Add new storage methods** in `server/storage.ts`
4. **Customize AI processing** in `server/openai.ts` or create `server/anthropic.ts`

The development server will automatically restart when you make changes to server files.