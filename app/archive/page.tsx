import Link from 'next/link';
import {
  getAllSummaries,
  searchSummariesByTicker,
  searchSummariesByTheme,
  searchSummariesByAssetClass,
} from '@/lib/storage/kv';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    search?: string;
    type?: 'ticker' | 'theme' | 'asset';
    asset?: 'equity' | 'etf' | 'commodity' | 'forex';
  }>;
}

export default async function ArchivePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { search, type, asset } = params;

  let summaries;

  if (search && type === 'ticker') {
    summaries = await searchSummariesByTicker(search);
  } else if (search && type === 'theme') {
    summaries = await searchSummariesByTheme(search);
  } else if (asset && type === 'asset') {
    summaries = await searchSummariesByAssetClass(asset);
  } else {
    summaries = await getAllSummaries(50);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Analysis Archive
          </h1>
          <p className="text-lg text-slate-600">
            Browse past daily analyses and search by ticker, theme, or asset class
          </p>
        </header>

        {/* Navigation */}
        <nav className="flex gap-4 mb-8">
          <Link
            href="/"
            className="px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-slate-50 border border-slate-200"
          >
            Today
          </Link>
          <Link
            href="/archive"
            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium"
          >
            Archive
          </Link>
        </nav>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Search Archive
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search by Ticker */}
            <form method="GET" action="/archive">
              <input type="hidden" name="type" value="ticker" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search by Ticker
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="search"
                    placeholder="e.g. AAPL, SPY, GLD"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={type === 'ticker' ? search : ''}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Search by Theme */}
            <form method="GET" action="/archive">
              <input type="hidden" name="type" value="theme" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Search by Theme
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="search"
                    placeholder="e.g. inflation, trade"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={type === 'theme' ? search : ''}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Search
                  </button>
                </div>
              </div>
            </form>

            {/* Filter by Asset Class */}
            <form method="GET" action="/archive">
              <input type="hidden" name="type" value="asset" />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Filter by Asset Class
                </label>
                <div className="flex gap-2">
                  <select
                    name="asset"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={asset || ''}
                  >
                    <option value="">All</option>
                    <option value="equity">Equities</option>
                    <option value="etf">ETFs</option>
                    <option value="commodity">Commodities</option>
                    <option value="forex">Forex</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Filter
                  </button>
                </div>
              </div>
            </form>
          </div>

          {(search || asset) && (
            <div className="mt-4">
              <Link
                href="/archive"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </Link>
            </div>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {summaries.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <p className="text-slate-600 text-lg">
                No analyses found matching your search criteria.
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-slate-600 mb-4">
                Found {summaries.length} {summaries.length === 1 ? 'analysis' : 'analyses'}
              </div>
              {summaries.map((summary) => (
                <div
                  key={summary.id}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">
                        {new Date(summary.date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        {summary.articleCount} articles • {summary.themes.length} themes • {summary.investmentIdeas.length} investment ideas
                      </p>
                    </div>
                    <Link
                      href={`/summary/${summary.date}`}
                      className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium"
                    >
                      View Details
                    </Link>
                  </div>

                  {/* Preview of themes */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      Top Themes:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.themes.slice(0, 3).map((theme, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                        >
                          {theme.title}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preview of investment ideas */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2">
                      Featured Tickers:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {summary.investmentIdeas.slice(0, 6).map((idea, idx) => (
                        <span
                          key={idx}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            idea.direction === 'long'
                              ? 'bg-green-100 text-green-800'
                              : idea.direction === 'short'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {idea.ticker} {idea.direction === 'long' ? '↑' : idea.direction === 'short' ? '↓' : '•'}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
