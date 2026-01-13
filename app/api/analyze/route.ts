import { NextResponse } from 'next/server';
import { getTodayArticles, storeArticles } from '@/lib/storage/kv';
import { analyzeArticles } from '@/lib/claude/analyzer';
import { storeSummary, getSummaryByDate } from '@/lib/storage/kv';
import { fetchAllFeeds, filterTodayArticles } from '@/lib/rss/parser';
import { DailySummary } from '@/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for Claude API call

/**
 * POST /api/analyze
 * Generates a daily summary using Claude API
 */
export async function POST(request: Request) {
  try {
    // Optional: Verify the request is from a cron job or authenticated source
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting daily analysis...');

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Check if summary already exists for today
    const existingSummary = await getSummaryByDate(today);
    if (existingSummary) {
      console.log('Summary already exists for today');
      return NextResponse.json({
        success: true,
        summary: existingSummary,
        message: 'Summary already generated for today',
      });
    }

    // First, collect fresh articles from RSS feeds
    console.log('Collecting articles from RSS feeds...');
    const allArticles = await fetchAllFeeds();
    const todayArticles = filterTodayArticles(allArticles);
    console.log(`Collected ${todayArticles.length} new articles from feeds`);

    // Store the newly collected articles
    if (todayArticles.length > 0) {
      await storeArticles(todayArticles);
      console.log('Articles stored successfully');
    }

    // Get all articles for today (including any previously collected)
    const articles = await getTodayArticles();
    console.log(`Total articles available for analysis: ${articles.length}`);

    if (articles.length === 0) {
      return NextResponse.json(
        {
          error: 'No articles available for analysis',
          message: 'No articles could be collected from RSS feeds. Please try again later.',
        },
        { status: 400 }
      );
    }

    // Analyze articles with Claude
    console.log('Analyzing articles with Claude...');
    const analysis = await analyzeArticles(articles);
    console.log('Analysis complete');

    // Create daily summary
    const summary: DailySummary = {
      id: `summary_${today}`,
      date: today,
      generatedAt: new Date().toISOString(),
      themes: analysis.themes,
      investmentIdeas: analysis.investmentIdeas,
      articleCount: articles.length,
      articleIds: articles.map(a => a.id),
    };

    // Store summary
    await storeSummary(summary);
    console.log('Summary stored successfully');

    return NextResponse.json({
      success: true,
      summary,
      message: 'Analysis completed successfully',
    });
  } catch (error) {
    console.error('Error generating analysis:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate analysis',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analyze
 * Returns today's summary if it exists
 */
export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const summary = await getSummaryByDate(today);

    if (!summary) {
      return NextResponse.json(
        {
          message: 'No summary available for today',
          date: today,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      summary,
      date: today,
    });
  } catch (error) {
    console.error('Error getting summary:', error);
    return NextResponse.json(
      {
        error: 'Failed to get summary',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
