# Global Ledger

An AI-powered web application that aggregates macroeconomic and geopolitical news from RSS feeds and provides daily investment analysis using Claude AI.

## Features

- **Automated News Collection**: Collects articles daily at 6pm ET from multiple trusted sources (Reuters, BBC, AP News, Financial Times, Al Jazeera, The Guardian)
- **AI-Powered Analysis**: Daily analysis at 6pm ET using Claude Sonnet 4 to identify key themes and investment opportunities
- **Investment Ideas**: Generates specific, actionable trade ideas with tickers across equities, ETFs, commodities, and forex
- **Searchable Archive**: Browse past analyses by date, search by ticker symbol, theme, or asset class
- **Real-time Progress**: View article collection status throughout the day
- **Manual Generation**: On-demand analysis with a single button click

## Tech Stack

- **Framework**: Next.js 15 with App Router and TypeScript
- **Styling**: Tailwind CSS
- **AI**: Anthropic Claude API (Sonnet 4)
- **Database**: Vercel KV (Redis)
- **Hosting**: Vercel with Cron Jobs
- **RSS Parsing**: rss-parser

## Prerequisites

- Node.js 18+ and npm
- [Anthropic API key](https://console.anthropic.com/)
- Vercel account (for deployment and KV storage)

## Local Development

1. **Clone the repository**

```bash
git clone <repository-url>
cd global-ledger-app
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

Note: For local development, Vercel KV won't work. You'll need to either:
- Deploy to Vercel and test there, or
- Mock the KV functions for local testing

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Deployment to Vercel

### 1. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Or use the Vercel CLI:

```bash
npm i -g vercel
vercel
```

### 2. Add Vercel KV Storage

1. Go to your project dashboard on Vercel
2. Navigate to the "Storage" tab
3. Click "Create Database" and select "KV"
4. Follow the prompts to create your KV store
5. The environment variables will be automatically added to your project

### 3. Configure Environment Variables

In your Vercel project settings, add:

- `ANTHROPIC_API_KEY`: Your Anthropic API key
- `CRON_SECRET` (optional): A random secret to secure your cron endpoints

Generate a cron secret:

```bash
openssl rand -base64 32
```

### 4. Cron Jobs (Optional)

**The app works perfectly with manual triggers only - cron jobs are optional!**

Vercel Hobby plan limitations:
- Maximum 2 cron jobs per team (across all projects)
- Each cron job must run once per day maximum

**If you want automated daily analysis**, create a `vercel.json` file:

```json
{
  "crons": [
    {
      "path": "/api/analyze",
      "schedule": "0 22 * * *"
    }
  ]
}
```

This runs daily at 10pm UTC (~6pm ET) and:
- Collects fresh articles from all RSS feeds
- Analyzes articles with Claude AI
- Generates daily summary with themes and investment ideas

**If you don't need automated scheduling**, simply use the "Collect Now" and "Generate Analysis Now" buttons in the UI whenever you want an update.

## API Endpoints

### POST /api/collect

Collects articles from all RSS feeds and stores them.

**Authentication**: Optional Bearer token matching `CRON_SECRET`

**Response**:
```json
{
  "success": true,
  "collected": 45,
  "totalToday": 120,
  "timestamp": "2024-01-15T10:00:00.000Z"
}
```

### GET /api/collect

Returns the count of articles collected today.

**Response**:
```json
{
  "count": 120,
  "date": "2024-01-15"
}
```

### POST /api/analyze

Generates a daily summary using Claude AI based on collected articles.

**Authentication**: Optional Bearer token matching `CRON_SECRET`

**Response**:
```json
{
  "success": true,
  "summary": {
    "id": "summary_2024-01-15",
    "date": "2024-01-15",
    "themes": [...],
    "investmentIdeas": [...],
    "articleCount": 120
  }
}
```

### GET /api/analyze

Returns today's summary if it exists.

**Response**: Summary object or 404 if not generated yet.

## Project Structure

```
global-ledger-app/
├── app/
│   ├── api/
│   │   ├── collect/route.ts      # Article collection endpoint
│   │   └── analyze/route.ts      # Analysis generation endpoint
│   ├── archive/
│   │   └── page.tsx              # Archive page with search
│   ├── summary/[date]/
│   │   └── page.tsx              # Individual summary view
│   └── page.tsx                  # Homepage
├── lib/
│   ├── claude/
│   │   └── analyzer.ts           # Claude API integration
│   ├── rss/
│   │   ├── parser.ts             # RSS feed parser
│   │   └── sources.ts            # RSS source configuration
│   └── storage/
│       └── kv.ts                 # Vercel KV storage utilities
├── types/
│   └── index.ts                  # TypeScript type definitions
└── vercel.json                   # Vercel cron configuration
```

## Usage

### Homepage

- View today's article collection count
- See today's analysis (if generated)
- Click "Collect Now" to manually trigger article collection
- Click "Generate Analysis Now" to create today's summary

### Summary Page

- View detailed geopolitical themes with importance ratings
- Browse all investment ideas with tickers and rationales
- See links to source articles
- Each theme shows related articles and investment implications

### Archive

- Browse all past daily analyses
- Search by ticker symbol (e.g., "AAPL", "SPY")
- Search by theme (e.g., "inflation", "trade war")
- Filter by asset class (equity, ETF, commodity, forex)

## Customization

### Adding New RSS Feeds

Edit `lib/rss/sources.ts` and add new sources:

```typescript
{
  name: 'Source Name',
  url: 'https://example.com/rss',
  category: 'geopolitical' | 'economic' | 'financial' | 'general',
}
```

### Adjusting Analysis Prompt

Edit the `ANALYSIS_PROMPT` in `lib/claude/analyzer.ts` to customize how Claude analyzes articles.

### Setting Up Automated Cron Jobs

Create a `vercel.json` file to enable automated daily analysis:

```json
{
  "crons": [
    {
      "path": "/api/analyze",
      "schedule": "0 22 * * *"   // 10pm UTC (~6pm ET)
    }
  ]
}
```

**Cron Schedule Examples:**
- `0 22 * * *` - 10pm UTC / ~6pm ET
- `0 14 * * *` - 2pm UTC / ~10am ET
- `0 0 * * *` - Midnight UTC
- `0 12 * * 1` - Noon UTC every Monday

**Note**: Vercel Hobby plan limitations:
- Maximum 2 cron jobs per team (check other projects)
- Each cron must run once per day maximum

**For Pro plan users**, you can add frequent collection:

```json
{
  "crons": [
    {
      "path": "/api/collect",
      "schedule": "0 */2 * * *"  // Collect articles every 2 hours
    },
    {
      "path": "/api/analyze",
      "schedule": "0 22 * * *"   // Analyze at 6pm ET
    }
  ]
}
```

## Cost Considerations

### Anthropic API

- Claude Sonnet 4: ~$3 per million input tokens, ~$15 per million output tokens
- Typical daily analysis: ~2,000 input tokens + ~1,500 output tokens
- Estimated cost: ~$0.03 per analysis or ~$1/month

### Vercel

- Hobby plan: Free (includes KV and cron jobs)
- Pro plan: $20/month (if you exceed hobby limits)

### RSS Feeds

All RSS feeds used are free and publicly available.

## Limitations

- RSS feeds may have rate limits or access restrictions
- Some feeds may not include full article content
- Claude AI may occasionally misinterpret themes or generate suboptimal investment ideas
- Historical data is limited to what's stored in KV (no pre-deployment history)

## Disclaimer

**This application is for informational and educational purposes only.**

The investment ideas and analysis generated by this application:
- Are created by AI and may contain errors
- Should not be considered financial advice
- Do not constitute recommendations to buy or sell securities
- Should not be the sole basis for investment decisions

Always conduct your own research and consult with qualified financial advisors before making investment decisions. Past performance does not guarantee future results.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT License - see LICENSE file for details

## Support

For issues or questions:
1. Check existing GitHub issues
2. Create a new issue with detailed information
3. Include relevant error messages and steps to reproduce

## Roadmap

- [ ] Email notifications for daily summaries
- [ ] Advanced search with date ranges
- [ ] Export summaries to PDF
- [ ] Chart integration for tickers
- [ ] Sentiment analysis visualization
- [ ] Multi-language support
- [ ] Mobile app version

## Acknowledgments

- [Anthropic](https://www.anthropic.com/) for Claude AI
- [Vercel](https://vercel.com/) for hosting and infrastructure
- [Next.js](https://nextjs.org/) for the framework
- News sources: Reuters, BBC, AP News, FT, Al Jazeera, The Guardian
