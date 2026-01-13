import Link from 'next/link';
import { getTodayArticleCount, getSummaryByDate } from '@/lib/storage/kv';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const today = new Date().toISOString().split('T')[0];
  const articleCount = await getTodayArticleCount();
  const todaySummary = await getSummaryByDate(today);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Global Ledger
          </h1>
          <p className="text-lg text-slate-600">
            AI-Powered Macroeconomic & Geopolitical Investment Analysis
          </p>
        </header>

        {/* Navigation */}
        <nav className="flex gap-4 mb-8">
          <Link
            href="/"
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium"
          >
            Today
          </Link>
          <Link
            href="/archive"
            className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-50 border border-slate-200"
          >
            Archive
          </Link>
        </nav>

        {/* Main Content */}
        <div className="grid gap-6">
          {/* Article Collection Status */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Today&apos;s Article Collection
              </h2>
              <span className="text-sm text-slate-500">{today}</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-3xl font-bold text-slate-900">
                  {articleCount}
                </div>
                <div className="text-sm text-slate-600">
                  Articles collected today
                </div>
              </div>

              <div className="flex gap-2">
                <form action="/api/collect" method="POST">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Collect Now
                  </button>
                </form>
              </div>
            </div>

            <div className="mt-4 text-sm text-slate-500">
              Click &quot;Collect Now&quot; to manually gather articles from Reuters, BBC, AP News, FT, and other sources.
              Articles are also collected automatically during the daily 6pm ET analysis.
            </div>
          </div>

          {/* Daily Analysis */}
          {todaySummary ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Today&apos;s Analysis
                </h2>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Generated
                </span>
              </div>

              {/* Themes */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Key Themes ({todaySummary.themes.length})
                </h3>
                <div className="space-y-3">
                  {todaySummary.themes.slice(0, 3).map((theme, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-slate-900">
                          {theme.title}
                        </h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          theme.importance === 'high'
                            ? 'bg-red-100 text-red-800'
                            : theme.importance === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {theme.importance}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{theme.summary}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Investment Ideas */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-3">
                  Investment Ideas ({todaySummary.investmentIdeas.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {todaySummary.investmentIdeas.slice(0, 4).map((idea, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-mono font-bold text-slate-900">
                            {idea.ticker}
                          </span>
                          <span className="ml-2 text-xs text-slate-500 uppercase">
                            {idea.assetClass}
                          </span>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          idea.direction === 'long'
                            ? 'bg-green-100 text-green-800'
                            : idea.direction === 'short'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {idea.direction.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{idea.rationale}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={`/summary/${today}`}
                className="mt-6 block text-center px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
              >
                View Full Analysis
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  No Analysis Yet
                </h3>
                <p className="text-slate-600 mb-6">
                  {articleCount > 0
                    ? 'Articles have been collected. Generate your daily analysis now.'
                    : 'Collect articles first, then generate your daily analysis.'}
                </p>
                <form action="/api/analyze" method="POST">
                  <button
                    type="submit"
                    disabled={articleCount === 0}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                  >
                    Generate Analysis Now
                  </button>
                </form>
                <p className="mt-4 text-sm text-slate-500">
                  Analysis is automatically generated daily at 6pm ET.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
