import { useState } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';

export default function ZipSearch({ onZipSearch, searching }) {
  const [zip, setZip] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (zip.trim().length === 5) onZipSearch(zip.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        type="text"
        inputMode="numeric"
        value={zip}
        onChange={(e) => setZip(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
        placeholder="Search by zip code..."
        className="w-full pl-9 pr-9 py-2.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:border-foreground transition-colors"
      />
      {zip.length === 5 && (
        <button
          type="submit"
          disabled={searching}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
        >
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </button>
      )}
    </form>
  );
}