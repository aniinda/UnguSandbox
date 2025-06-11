# Backend Development Access - Current Sandbox

## How to Work on This Sandbox

You have full access to modify the backend code in this sandbox while the API keys remain protected by the owner.

### Key Backend Files You Can Edit

#### Main API Logic
- **`server/routes.ts`** - All API endpoints and request handling
- **`server/storage.ts`** - Database operations and queries  
- **`server/openai.ts`** - AI processing and prompt engineering
- **`shared/schema.ts`** - Database schema and type definitions

#### File Upload Processing
Located in `server/routes.ts` around line 60:
```typescript
app.post('/api/data-engineer/upload', authenticateDataEngineer, upload.single('file'), async (req, res) => {
  // Your upload processing logic here
```

#### AI Provider Integration
In `server/openai.ts`:
```typescript
export async function extractRateCardDataOpenAI(text: string): Promise<any> {
  // Modify prompts and extraction logic here
```

### Current Issues to Fix

From the error logs, these need attention:

1. **File Path Error** (line 88 in routes.ts)
   ```
   Error: ENOENT: no such file or directory, open './test/data/05-versions-space.pdf'
   ```

2. **PDF Processing** - Fix file path handling in the upload endpoint

3. **Rate Card Extraction** - Improve AI prompts for better data extraction

### Making Changes

1. **Edit files directly** in the Replit editor
2. **Save changes** - Server automatically restarts
3. **Test immediately** using the live application URL
4. **Check logs** in the console for errors

### Testing Your Changes

- **Application URL**: https://9e8cb107-c911-4a8b-ba6d-4c577bcb97ca-00-1yx2gfpng3gq3.janeway.replit.dev/
- **API endpoints** available at `/api/data-engineer/*`
- **Database** already connected and populated
- **AI providers** configured and working

### Database Operations

The database is already set up with these tables:
- `processing_jobs` - Track document processing
- `ratecard_entries` - Store extracted data

You can modify schema in `shared/schema.ts` and run:
```bash
npm run db:push
```

### Environment Variables Available

These are already configured (you don't see the values):
- `ANTHROPIC_API_KEY` - For Claude Sonnet 4
- `OPENAI_API_KEY` - For GPT-4o  
- `DATABASE_URL` - PostgreSQL connection

### Development Workflow

1. **Identify the issue** (check console logs)
2. **Edit the relevant file** (usually `server/routes.ts`)
3. **Save and test** (server auto-restarts)
4. **Upload a test file** to verify fixes
5. **Monitor logs** for success/errors

### Common Fixes Needed

#### File Upload Path Issues
In `server/routes.ts`, ensure proper file path handling:
```typescript
const filePath = req.file.path; // Use this, not hardcoded paths
```

#### Improve AI Extraction
Modify prompts in `server/openai.ts` for better rate card data extraction.

#### Error Handling
Add better error handling throughout the upload process.

You have full read/write access to all code files while the API keys remain secure.