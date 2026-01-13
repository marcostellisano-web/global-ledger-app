import Anthropic from '@anthropic-ai/sdk';
import { RSSArticle, AnalysisResponse, GeopoliticalTheme, InvestmentIdea } from '@/types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ANALYSIS_PROMPT = `You are a world-class geopolitical and macroeconomic analyst specializing in investment strategy.

You will receive a collection of news articles from today. Your task is to:

1. Identify the top 3-5 most significant geopolitical and macroeconomic themes
2. For each theme, provide a clear summary and assess its importance (high/medium/low)
3. Generate 5-10 specific, actionable investment ideas based on these themes
4. For each investment idea, provide:
   - Specific ticker symbols (stocks, ETFs, commodities, forex pairs)
   - Asset class (equity, etf, commodity, forex)
   - Direction (long, short, neutral)
   - Clear rationale linking to the identified themes

Focus on:
- Liquid, tradeable securities with clear ticker symbols
- Practical ideas that retail investors can execute
- Both directional plays and hedges
- Multiple asset classes for diversification

Be specific with ticker symbols. For example:
- Equities: AAPL, GOOGL, JPM
- ETFs: SPY, QQQ, GLD, USO, EEM
- Commodities: Gold, Oil, Natural Gas
- Forex: EUR/USD, USD/JPY, GBP/USD

Return your analysis in JSON format with this structure:
{
  "themes": [
    {
      "title": "Theme title",
      "summary": "Detailed summary",
      "importance": "high|medium|low",
      "relatedArticles": []
    }
  ],
  "investmentIdeas": [
    {
      "ticker": "TICKER",
      "assetClass": "equity|etf|commodity|forex",
      "direction": "long|short|neutral",
      "rationale": "Why this trade makes sense",
      "relatedThemes": ["Theme title"]
    }
  ]
}`;

/**
 * Analyzes articles using Claude and generates investment insights
 */
export async function analyzeArticles(articles: RSSArticle[]): Promise<AnalysisResponse> {
  if (articles.length === 0) {
    throw new Error('No articles to analyze');
  }

  // Prepare articles text for Claude
  const articlesText = articles.map((article, index) => {
    return `
Article ${index + 1}:
Title: ${article.title}
Source: ${article.source}
Date: ${article.pubDate}
Description: ${article.description}
Link: ${article.link}
---`;
  }).join('\n\n');

  const userMessage = `${ANALYSIS_PROMPT}

Here are today's articles:

${articlesText}

Please provide your analysis in the JSON format specified.`;

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      temperature: 0.7,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract the text response
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    // Parse the JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from Claude response');
    }

    const analysis = JSON.parse(jsonMatch[0]) as AnalysisResponse;

    // Add article IDs to themes
    const articleMap = new Map(articles.map(a => [a.title, a.id]));
    analysis.themes.forEach(theme => {
      theme.relatedArticles = articles
        .filter(article => {
          const titleLower = article.title.toLowerCase();
          const themeLower = theme.title.toLowerCase();
          return titleLower.includes(themeLower) || themeLower.includes(titleLower);
        })
        .map(a => a.id)
        .slice(0, 5); // Limit to 5 articles per theme
    });

    return analysis;
  } catch (error) {
    console.error('Error analyzing articles with Claude:', error);
    throw error;
  }
}

/**
 * Validates the analysis response structure
 */
function validateAnalysis(analysis: any): analysis is AnalysisResponse {
  return (
    analysis &&
    Array.isArray(analysis.themes) &&
    Array.isArray(analysis.investmentIdeas) &&
    analysis.themes.every((theme: any) =>
      theme.title && theme.summary && theme.importance
    ) &&
    analysis.investmentIdeas.every((idea: any) =>
      idea.ticker && idea.assetClass && idea.direction && idea.rationale
    )
  );
}
