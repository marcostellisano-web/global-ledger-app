import { NextResponse } from 'next/server';
import { fetchAllFeeds, filterTodayArticles } from '@/lib/rss/parser';
import { storeArticles, getTodayArticleCount } from '@/lib/storage/kv';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // 60 seconds timeout for Vercel

/**
 * POST /api/collect
 * Collects articles from all RSS feeds and stores them
 */
export async function POST(request: Request) {
  try {
    // Optional: Verify the request is from a cron job or authenticated source
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting article collection...');

    // Fetch all articles
    const allArticles = await fetchAllFeeds();
    console.log(`Fetched ${allArticles.length} total articles`);

    // Filter to only today's articles
    const todayArticles = filterTodayArticles(allArticles);
    console.log(`Filtered to ${todayArticles.length} articles from today`);

    // Store articles
    if (todayArticles.length > 0) {
      await storeArticles(todayArticles);
      console.log('Articles stored successfully');
    }

    // Get total count for today
    const totalCount = await getTodayArticleCount();

    return NextResponse.json({
      success: true,
      collected: todayArticles.length,
      totalToday: totalCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error collecting articles:', error);
    return NextResponse.json(
      {
        error: 'Failed to collect articles',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/collect
 * Returns the current count of articles collected today
 */
export async function GET() {
  try {
    const count = await getTodayArticleCount();

    return NextResponse.json({
      count,
      date: new Date().toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error getting article count:', error);
    return NextResponse.json(
      {
        error: 'Failed to get article count',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
