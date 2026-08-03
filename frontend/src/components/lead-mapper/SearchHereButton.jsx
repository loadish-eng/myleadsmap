import { Search, Loader2 } from 'lucide-react';

export default function SearchHereButton({ onClick, searching }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
      <button
        onClick={onClick}
        disabled={searching}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-medium shadow-lg hover:bg-foreground/90 transition-colors disabled:opacity-60"
      >
        {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        Search this area
      </button>
    </div>
  );
}