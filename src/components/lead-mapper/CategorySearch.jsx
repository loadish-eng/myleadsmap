import { useState } from 'react';
import { Search, X } from 'lucide-react';

const SUGGESTIONS = ['Dental', 'Legal Services', 'Medical', 'Restaurant', 'Real Estate', 'Accounting', 'Auto Repair', 'Beauty Salon', 'Gym', 'Pharmacy'];

export default function CategorySearch({ onSearch, searching, initialValue }) {
  const [query, setQuery] = useState(initialValue || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search business type..."
          className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
        />
        {query && (
          <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        )}
      </form>
      {!query && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onClick={() => { setQuery(s); onSearch(s); }}
              className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}