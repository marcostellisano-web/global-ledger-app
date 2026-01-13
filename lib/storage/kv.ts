import { kv } from '@vercel/kv';
import { RSSArticle, DailySummary } from '@/types';

// Key prefixes for different data types
const ARTICLE_PREFIX = 'article:';
const ARTICLES_BY_DATE_PREFIX = 'articles:date:';
const SUMMARY_PREFIX = 'summary:';
const SUMMARIES_LIST = 'summaries:list';

/**
 * Stores a single article in KV
 */
export async function storeArticle(article: RSSArticle): Promise<void> {
  const key = `${ARTICLE_PREFIX}${article.id}`;
  await kv.set(key, article);

  // Add article ID to date-based list
  const dateKey = getDateKey(article.collectedAt);
  await kv.sadd(`${ARTICLES_BY_DATE_PREFIX}${dateKey}`, article.id);
}

/**
 * Stores multiple articles in KV
 */
export async function storeArticles(articles: RSSArticle[]): Promise<void> {
  const pipeline = kv.pipeline();

  for (const article of articles) {
    const key = `${ARTICLE_PREFIX}${article.id}`;
    pipeline.set(key, article);

    const dateKey = getDateKey(article.collectedAt);
    pipeline.sadd(`${ARTICLES_BY_DATE_PREFIX}${dateKey}`, article.id);
  }

  await pipeline.exec();
}

/**
 * Retrieves a single article by ID
 */
export async function getArticle(id: string): Promise<RSSArticle | null> {
  const key = `${ARTICLE_PREFIX}${id}`;
  return await kv.get<RSSArticle>(key);
}

/**
 * Retrieves articles for a specific date
 */
export async function getArticlesByDate(date: string): Promise<RSSArticle[]> {
  const dateKey = getDateKey(date);
  const articleIds = await kv.smembers(`${ARTICLES_BY_DATE_PREFIX}${dateKey}`);

  if (!articleIds || articleIds.length === 0) {
    return [];
  }

  const pipeline = kv.pipeline();
  for (const id of articleIds) {
    pipeline.get(`${ARTICLE_PREFIX}${id}`);
  }

  const results = await pipeline.exec();
  return results.filter((article): article is RSSArticle => article !== null);
}

/**
 * Retrieves articles for today
 */
export async function getTodayArticles(): Promise<RSSArticle[]> {
  const today = new Date().toISOString().split('T')[0];
  return await getArticlesByDate(today);
}

/**
 * Stores a daily summary
 */
export async function storeSummary(summary: DailySummary): Promise<void> {
  const key = `${SUMMARY_PREFIX}${summary.id}`;

  const pipeline = kv.pipeline();
  pipeline.set(key, summary);
  pipeline.zadd(SUMMARIES_LIST, {
    score: new Date(summary.date).getTime(),
    member: summary.id,
  });

  await pipeline.exec();
}

/**
 * Retrieves a summary by ID
 */
export async function getSummary(id: string): Promise<DailySummary | null> {
  const key = `${SUMMARY_PREFIX}${id}`;
  return await kv.get<DailySummary>(key);
}

/**
 * Retrieves a summary for a specific date
 */
export async function getSummaryByDate(date: string): Promise<DailySummary | null> {
  const summaryId = `summary_${getDateKey(date)}`;
  return await getSummary(summaryId);
}

/**
 * Retrieves all summaries, sorted by date (newest first)
 */
export async function getAllSummaries(
  limit: number = 50,
  offset: number = 0
): Promise<DailySummary[]> {
  const summaryIds = await kv.zrange(SUMMARIES_LIST, offset, offset + limit - 1, {
    rev: true,
  });

  if (!summaryIds || summaryIds.length === 0) {
    return [];
  }

  const pipeline = kv.pipeline();
  for (const id of summaryIds) {
    pipeline.get(`${SUMMARY_PREFIX}${id}`);
  }

  const results = await pipeline.exec();
  return results.filter((summary): summary is DailySummary => summary !== null);
}

/**
 * Searches summaries by ticker
 */
export async function searchSummariesByTicker(ticker: string): Promise<DailySummary[]> {
  const allSummaries = await getAllSummaries(100); // Get more for searching
  return allSummaries.filter(summary =>
    summary.investmentIdeas.some(
      idea => idea.ticker.toLowerCase() === ticker.toLowerCase()
    )
  );
}

/**
 * Searches summaries by theme
 */
export async function searchSummariesByTheme(theme: string): Promise<DailySummary[]> {
  const allSummaries = await getAllSummaries(100);
  const lowerTheme = theme.toLowerCase();

  return allSummaries.filter(summary =>
    summary.themes.some(
      t => t.title.toLowerCase().includes(lowerTheme) ||
           t.summary.toLowerCase().includes(lowerTheme)
    )
  );
}

/**
 * Searches summaries by asset class
 */
export async function searchSummariesByAssetClass(
  assetClass: 'equity' | 'etf' | 'commodity' | 'forex'
): Promise<DailySummary[]> {
  const allSummaries = await getAllSummaries(100);
  return allSummaries.filter(summary =>
    summary.investmentIdeas.some(idea => idea.assetClass === assetClass)
  );
}

/**
 * Helper function to get date key in YYYY-MM-DD format
 */
function getDateKey(dateString: string): string {
  return new Date(dateString).toISOString().split('T')[0];
}

/**
 * Gets the count of articles for today
 */
export async function getTodayArticleCount(): Promise<number> {
  const today = getDateKey(new Date().toISOString());
  const count = await kv.scard(`${ARTICLES_BY_DATE_PREFIX}${today}`);
  return count || 0;
}
