import Parser from 'rss-parser';
import { RSSArticle, RSSSource } from '@/types';
import { RSS_SOURCES } from './sources';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'Global Ledger News Aggregator/1.0',
  },
});

/**
 * Fetches articles from a single RSS feed
 */
export async function fetchFeed(source: RSSSource): Promise<RSSArticle[]> {
  try {
    const feed = await parser.parseURL(source.url);
    const articles: RSSArticle[] = [];

    for (const item of feed.items) {
      if (!item.title || !item.link) continue;

      const article: RSSArticle = {
        id: generateArticleId(item.link, item.pubDate || new Date().toISOString()),
        title: item.title,
        description: item.contentSnippet || item.content || '',
        link: item.link,
        pubDate: item.pubDate || new Date().toISOString(),
        source: source.name,
        collectedAt: new Date().toISOString(),
        content: item.content,
      };

      articles.push(article);
    }

    return articles;
  } catch (error) {
    console.error(`Error fetching feed from ${source.name}:`, error);
    return [];
  }
}

/**
 * Fetches articles from all configured RSS feeds
 */
export async function fetchAllFeeds(): Promise<RSSArticle[]> {
  const results = await Promise.allSettled(
    RSS_SOURCES.map(source => fetchFeed(source))
  );

  const allArticles: RSSArticle[] = [];

  for (const result of results) {
    if (result.status === 'fulfilled') {
      allArticles.push(...result.value);
    }
  }

  // Sort by publication date (newest first)
  allArticles.sort((a, b) => {
    const dateA = new Date(a.pubDate).getTime();
    const dateB = new Date(b.pubDate).getTime();
    return dateB - dateA;
  });

  // Remove duplicates based on title similarity
  const uniqueArticles = deduplicateArticles(allArticles);

  return uniqueArticles;
}

/**
 * Generates a unique ID for an article based on URL and date
 */
function generateArticleId(url: string, pubDate: string): string {
  const hash = simpleHash(url + pubDate);
  return `article_${hash}`;
}

/**
 * Simple hash function for generating article IDs
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Removes duplicate articles based on title similarity
 */
function deduplicateArticles(articles: RSSArticle[]): RSSArticle[] {
  const seen = new Map<string, RSSArticle>();

  for (const article of articles) {
    const normalizedTitle = article.title.toLowerCase().trim();

    if (!seen.has(normalizedTitle)) {
      seen.set(normalizedTitle, article);
    }
  }

  return Array.from(seen.values());
}

/**
 * Filters articles by date (only articles from today)
 */
export function filterTodayArticles(articles: RSSArticle[]): RSSArticle[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return articles.filter(article => {
    const pubDate = new Date(article.pubDate);
    pubDate.setHours(0, 0, 0, 0);
    return pubDate.getTime() >= today.getTime();
  });
}
