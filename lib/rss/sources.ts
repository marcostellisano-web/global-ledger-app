import { RSSSource } from '@/types';

// Free RSS feeds for macroeconomic and geopolitical news
export const RSS_SOURCES: RSSSource[] = [
  // Reuters
  {
    name: 'Reuters World News',
    url: 'https://www.reutersagency.com/feed/?taxonomy=best-topics&post_type=best',
    category: 'geopolitical',
  },
  {
    name: 'Reuters Business',
    url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best',
    category: 'financial',
  },

  // BBC
  {
    name: 'BBC World News',
    url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'geopolitical',
  },
  {
    name: 'BBC Business',
    url: 'http://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'financial',
  },

  // AP News
  {
    name: 'AP World News',
    url: 'https://apnews.com/hub/world-news?rss=true',
    category: 'geopolitical',
  },
  {
    name: 'AP Business',
    url: 'https://apnews.com/hub/business?rss=true',
    category: 'financial',
  },

  // Financial Times (free content)
  {
    name: 'FT World',
    url: 'https://www.ft.com/world?format=rss',
    category: 'geopolitical',
  },
  {
    name: 'FT Markets',
    url: 'https://www.ft.com/markets?format=rss',
    category: 'financial',
  },

  // Al Jazeera
  {
    name: 'Al Jazeera English',
    url: 'https://www.aljazeera.com/xml/rss/all.xml',
    category: 'geopolitical',
  },

  // The Guardian
  {
    name: 'Guardian World News',
    url: 'https://www.theguardian.com/world/rss',
    category: 'geopolitical',
  },
  {
    name: 'Guardian Business',
    url: 'https://www.theguardian.com/business/rss',
    category: 'financial',
  },
];
