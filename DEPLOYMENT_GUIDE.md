# Data Engineer Portal - Independent Deployment Guide

## Creating Your Own Instance

To work on this project with your own API keys and database:

### Option 1: Fork to New Replit (Recommended)

1. **Create new Replit project**
   - Go to replit.com
   - Click "Create Repl"
   - Choose "Import from GitHub" or "Blank Repl"

2. **Copy project files**
   - Download/copy all files from this sandbox
   - Upload to your new Replit project

3. **Set up your own secrets**
   ```
   ANTHROPIC_API_KEY=your_anthropic_key_here
   OPENAI_API_KEY=your_openai_key_here
   DATABASE_URL=your_postgres_url_here
   ```

### Option 2: Local Development

1. **Clone/download the code**
2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create `.env` file:
   ```
   DATABASE_URL=postgresql://localhost:5432/dataengineer
   ANTHROPIC_API_KEY=sk-ant-your-key
   OPENAI_API_KEY=sk-your-key
   ```

4. **Run locally**
   ```bash
   npm run dev
   ```

### Required API Keys

#### Anthropic Claude
- Visit: https://console.anthropic.com/
- Create account and get API key
- Add to secrets as `ANTHROPIC_API_KEY`

#### OpenAI GPT-4o
- Visit: https://platform.openai.com/api-keys
- Create API key
- Add to secrets as `OPENAI_API_KEY`

#### PostgreSQL Database
- Use Replit's built-in PostgreSQL
- Or external service like Neon, Supabase, Railway
- Add connection string as `DATABASE_URL`

### Project Structure You'll Work With

```
server/
├── routes.ts        # Main API endpoints (modify here)
├── storage.ts       # Database operations
├── openai.ts        # OpenAI integration
├── db.ts           # Database connection
└── index.ts        # Server setup

shared/
└── schema.ts       # Database schema definitions

client/src/         # Frontend (React)
```

### Key Backend Files to Modify

#### `server/routes.ts`
- Upload endpoint: `/api/data-engineer/upload`
- File processing logic
- AI provider selection
- Error handling

#### `server/openai.ts`
- Rate card extraction prompts
- Response parsing
- Error handling

#### `shared/schema.ts`
- Database table definitions
- Add new fields or tables
- Type definitions

### Testing the Setup

1. **Start the server** - Should see "serving on port 5000"
2. **Check providers** - Visit `/api/data-engineer/providers`
3. **Upload a test file** - Use the upload interface
4. **Monitor logs** - Check for errors in console

### Common Development Tasks

#### Add New Rate Card Fields
1. Update `shared/schema.ts`
2. Run `npm run db:push`
3. Modify extraction prompts in AI files
4. Update frontend displays

#### Improve AI Extraction
1. Edit prompts in `server/openai.ts`
2. Adjust response parsing logic
3. Test with sample documents

#### Fix File Upload Issues
1. Check file path handling in `server/routes.ts`
2. Verify upload directory permissions
3. Add better error handling

### Deployment Options

- **Replit**: Automatic deployment on save
- **Vercel**: Connect GitHub repo for auto-deploy
- **Railway**: Database + app hosting
- **Heroku**: Traditional PaaS deployment

Your instance will be completely independent with your own API keys and database.