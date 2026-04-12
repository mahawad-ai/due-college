'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { College } from '@/lib/types';
import { cn } from '@/lib/utils';

interface CollegeSearchProps {
  selectedColleges: College[];
  onAdd: (college: College) => void;
  onRemove: (collegeId: string) => void;
}

const POPULAR_COLLEGES = [
  'Harvard University',
  'Stanford University',
  'UCLA',
  'New York University',
  'University of Michigan',
  'UT Austin',
  'Duke University',
  'Georgetown University',
];

export default function CollegeSearch({ selectedColleges, onAdd, onRemove }: CollegeSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<College[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/colleges?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.colleges || []);
      setOpen(true);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query), 180);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(college: College) {
    const alreadyAdded = selectedColleges.some((c) => c.id === college.id);
    if (!alreadyAdded) onAdd(college);
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  }

  async function addPopular(name: string) {
    try {
      const res = await fetch(`/api/colleges?q=${encodeURIComponent(name)}&exact=true`);
      const data = await res.json();
      if (data.colleges?.[0]) {
        handleSelect(data.colleges[0]);
      }
    } catch {
      // ignore
    }
  }

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a college..."
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-navy transition-colors bg-white shadow-sm"
          onFocus={() => query && setOpen(true)}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute inset-y-0 right-4 flex items-center">
            <div className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Dropdown */}
        {open && results.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 max-h-72 overflow-y-auto"
          >
            {results.map((college) => {
              const alreadyAdded = selectedColleges.some((c) => c.id === college.id);
              return (
                <button
                  key={college.id}
                  onClick={() => handleSelect(college)}
                  disabled={alreadyAdded}
                  className={cn(
                    'w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between',
                    alreadyAdded && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div>
                    <div className="font-semibold text-navy">{college.name}</div>
                    <div className="text-sm text-gray-500">
                      {college.city}, {college.state}
                    </div>
                  </div>
                  {alreadyAdded ? (
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">Added</span>
                  ) : (
                    <span className="text-navy opacity-40">+</span>
                  )}
                </button>
              );
            })}
            {open && results.length === 0 && !loading && query && (
              <div className="px-4 py-3 text-sm text-gray-500">
                No results for &quot;{query}&quot;.{' '}
                <a href="mailto:hello@due.college?subject=Add college: ${query}" className="text-coral underline">
                  Request this school
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Schools */}
      {selectedColleges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedColleges.map((college) => (
            <span
              key={college.id}
              className="inline-flex items-center gap-1.5 bg-navy text-white pl-3 pr-2 py-1.5 rounded-full text-sm font-medium"
            >
              {college.name}
              <button
                onClick={() => onRemove(college.id)}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
                aria-label={`Remove ${college.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Popular Schools */}
      {selectedColleges.length === 0 && (
        <div>
          <p className="text-sm text-gray-400 mb-2">Popular schools</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_COLLEGES.map((name) => (
              <button
                key={name}
                onClick={() => addPopular(name)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors"
              >
                {name.replace('University', '').replace('University of California, ', 'UC ').trim()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
