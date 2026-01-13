import Link from 'next/link';
import { getSummaryByDate, getArticle } from '@/lib/storage/kv';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{
    date: string;
  }>;
}

export default async function SummaryPage({ params }: PageProps) {
  const { date } = await params;
  const summary = await getSummaryByDate(date);

  if (!summary) {
    notFound();
  }

  // Get a few sample articles to show source links
  const sampleArticles = await Promise.all(
    summary.articleIds.slice(0, 10).map(id => getArticle(id))
  );
  const articles = sampleArticles.filter(a => a !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/"
            className="text-sm text-slate-600 hover:text-slate-900 mb-4 inline-block"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Daily Analysis
          </h1>
          <div className="flex items-center gap-4 text-slate-600">
            <span>{date}</span>
            <span>•</span>
            <span>{summary.articleCount} articles analyzed</span>
            <span>•</span>
            <span>Generated at {new Date(summary.generatedAt).toLocaleTimeString()}</span>
          </div>
        </header>

        {/* Geopolitical Themes */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Key Geopolitical & Macro Themes
          </h2>
          <div className="space-y-4">
            {summary.themes.map((theme, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {idx + 1}. {theme.title}
                  </h3>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    theme.importance === 'high'
                      ? 'bg-red-100 text-red-800'
                      : theme.importance === 'medium'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {theme.importance.toUpperCase()}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed">{theme.summary}</p>
                {theme.relatedArticles.length > 0 && (
                  <div className="mt-4 text-sm text-slate-500">
                    Related to {theme.relatedArticles.length} article(s)
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Investment Ideas */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Investment Ideas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.investmentIdeas.map((idea, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-mono text-2xl font-bold text-slate-900">
                      {idea.ticker}
                    </div>
                    <div className="text-sm text-slate-500 uppercase mt-1">
                      {idea.assetClass}
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                    idea.direction === 'long'
                      ? 'bg-green-100 text-green-800'
                      : idea.direction === 'short'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {idea.direction.toUpperCase()}
                  </span>
                </div>

                <p className="text-slate-700 mb-3">{idea.rationale}</p>

                {idea.relatedThemes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {idea.relatedThemes.map((theme, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Source Articles */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Source Articles ({summary.articleCount})
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="space-y-4">
              {articles.map((article, idx) => (
                <div key={idx} className="pb-4 border-b border-slate-200 last:border-0">
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-900 hover:text-blue-600 font-medium"
                  >
                    {article.title}
                  </a>
                  <div className="text-sm text-slate-500 mt-1">
                    {article.source} • {new Date(article.pubDate).toLocaleDateString()}
                  </div>
                  {article.description && (
                    <p className="text-sm text-slate-600 mt-2">
                      {article.description.slice(0, 200)}...
                    </p>
                  )}
                </div>
              ))}
            </div>
            {summary.articleCount > 10 && (
              <div className="mt-4 text-center text-sm text-slate-500">
                Showing 10 of {summary.articleCount} articles
              </div>
            )}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-900">
            <strong>Disclaimer:</strong> This analysis is generated by AI and is for informational purposes only.
            It should not be considered financial advice. Always conduct your own research and consult with a
            qualified financial advisor before making investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
