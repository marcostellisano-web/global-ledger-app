// Core data types for the Global Ledger application

export interface RSSArticle {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  collectedAt: string;
  content?: string;
}

export interface InvestmentIdea {
  ticker: string;
  assetClass: 'equity' | 'etf' | 'commodity' | 'forex';
  direction: 'long' | 'short' | 'neutral';
  rationale: string;
  relatedThemes: string[];
}

export interface GeopoliticalTheme {
  title: string;
  summary: string;
  relatedArticles: string[]; // Article IDs
  importance: 'high' | 'medium' | 'low';
}

export interface DailySummary {
  id: string;
  date: string;
  generatedAt: string;
  themes: GeopoliticalTheme[];
  investmentIdeas: InvestmentIdea[];
  articleCount: number;
  articleIds: string[];
}

export interface RSSSource {
  name: string;
  url: string;
  category: 'geopolitical' | 'economic' | 'financial' | 'general';
}

export interface AnalysisRequest {
  articles: RSSArticle[];
  date: string;
}

export interface AnalysisResponse {
  themes: GeopoliticalTheme[];
  investmentIdeas: InvestmentIdea[];
}
