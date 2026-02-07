import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { searchApi } from '../../utils/api';
import { useNavigate } from 'react-router-dom';

interface SearchAutocompleteProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
  showHistory?: boolean;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  onSearch,
  placeholder = 'Search products...',
  className = '',
  showHistory = true,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [history, setHistory] = useState<Array<{ id: string; query: string; createdAt: Date }>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch search history
  useEffect(() => {
    if (showHistory) {
      const fetchHistory = async () => {
        try {
          const response = await searchApi.getHistory(5);
          if (response.data && (response.data as any).success) {
            setHistory((response.data as any).history || []);
          }
        } catch (error) {
          // Silently fail - history is optional
        }
      };
      fetchHistory();
    }
  }, [showHistory]);

  // Fetch suggestions
  useEffect(() => {
    if (query.trim().length >= 2) {
      const fetchSuggestions = async () => {
        setIsLoading(true);
        try {
          const response = await searchApi.autocomplete(query, 5);
          if (response.data && (response.data as any).success) {
            setSuggestions((response.data as any).suggestions || []);
            setShowSuggestions(true);
          }
        } catch (error) {
          setSuggestions([]);
        } finally {
          setIsLoading(false);
        }
      };

      const timer = setTimeout(fetchSuggestions, 300); // Debounce
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setShowSuggestions(query.trim().length > 0);
    }
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    setShowSuggestions(false);
    
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const deleteHistoryItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await searchApi.deleteHistoryItem(id);
      setHistory(history.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete history item:', error);
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {/* Suggestions */}
          {query.trim().length >= 2 && (
            <>
              {isLoading ? (
                <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
              ) : suggestions.length > 0 ? (
                <div className="py-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Suggestions
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(suggestion)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </>
          )}

          {/* Search History */}
          {showHistory && history.length > 0 && query.trim().length < 2 && (
            <div className="py-2 border-t border-gray-200">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent Searches
              </div>
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 group"
                >
                  <button
                    onClick={() => handleSearch(item.query)}
                    className="flex-1 text-left flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{item.query}</span>
                  </button>
                  <button
                    onClick={(e) => deleteHistoryItem(item.id, e)}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* No results */}
          {query.trim().length >= 2 && !isLoading && suggestions.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              No suggestions found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;

