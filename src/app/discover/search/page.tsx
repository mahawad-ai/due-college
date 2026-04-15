'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import CollegeLogo from '@/components/CollegeLogo';

interface College {
  id: string;
  name: string;
  location: string;
  sat_25th: number;
  sat_75th: number;
  acceptance_rate: number;
  tuition_out_of_state: number;
  size: string;
  majors_offered: string[];
}

const inputClass =
  'border border-[#d2d2d7] rounded-xl px-3 py-2 text-[13px] text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:border-[#ff3b30] transition-colors bg-white';

export default function CollegeSearchPage() {
  const router = useRouter();
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    sat_min: '',
    sat_max: '',
    acceptance_rate_max: '',
    size: '',
    location: '',
    major: '',
  });

  useEffect(() => {
    loadColleges();
  }, []);

  async function loadColleges() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.sat_min) params.append('sat_min', filters.sat_min);
      if (filters.sat_max) params.append('sat_max', filters.sat_max);
      if (filters.acceptance_rate_max) params.append('acceptance_rate_max', filters.acceptance_rate_max);
      if (filters.size) params.append('size', filters.size);
      if (filters.location) params.append('location', filters.location);
      if (filters.major) params.append('major', filters.major);

      const res = await fetch(`/api/college-search?${params}`);
      if (!res.ok) throw new Error('Failed to load colleges');
      const data = await res.json();
      setColleges(data.colleges || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading colleges');
    } finally {
      setLoading(false);
    }
  }

  async function handleFilter() {
    loadColleges();
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-5xl mx-auto px-6">
          {/* Hero */}
          <div className="mb-10">
            <h1 className="text-[34px] font-[700] tracking-[-0.5px] text-[#1d1d1f] leading-tight">
              Discover <span className="text-[#ff3b30]">Colleges</span>
            </h1>
            <p className="text-[15px] text-[#86868b] mt-1">
              Search and filter colleges that match your profile
            </p>
          </div>

          {/* Filters */}
          <div className="bg-[#f5f5f7] rounded-2xl p-6 mb-8">
            <h2 className="text-[13px] font-[600] text-[#86868b] uppercase tracking-wide mb-4">
              Filter Colleges
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-4">
              <input
                type="number"
                placeholder="Min SAT"
                value={filters.sat_min}
                onChange={(e) => setFilters({ ...filters, sat_min: e.target.value })}
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Max SAT"
                value={filters.sat_max}
                onChange={(e) => setFilters({ ...filters, sat_max: e.target.value })}
                className={inputClass}
              />
              <input
                type="number"
                placeholder="Max Accept %"
                value={filters.acceptance_rate_max}
                onChange={(e) => setFilters({ ...filters, acceptance_rate_max: e.target.value })}
                className={inputClass}
              />
              <select
                value={filters.size}
                onChange={(e) => setFilters({ ...filters, size: e.target.value })}
                className={inputClass}
              >
                <option value="">Size</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              <input
                type="text"
                placeholder="Location"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Major"
                value={filters.major}
                onChange={(e) => setFilters({ ...filters, major: e.target.value })}
                className={inputClass}
              />
            </div>
            <button
              onClick={handleFilter}
              className="bg-[#ff3b30] hover:bg-[#e6352b] text-white font-[600] text-[14px] px-6 py-2 rounded-xl transition-colors"
            >
              Search
            </button>
          </div>

          {error && (
            <div className="bg-[rgba(255,59,48,0.06)] border border-[#ff3b30]/20 text-[#ff3b30] rounded-2xl p-4 mb-6 text-[13px]">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-[#ff3b30] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : colleges.length === 0 ? (
            <div className="bg-[#f5f5f7] rounded-2xl p-12 text-center">
              <p className="text-[15px] text-[#86868b]">No colleges found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {colleges.map((c) => (
                <Link
                  key={c.id}
                  href={`/discover/college/${c.id}`}
                  className="flex items-center gap-4 bg-[#f5f5f7] rounded-2xl p-5 hover:shadow-sm transition-shadow group"
                >
                  <CollegeLogo name={c.name} />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-[600] text-[#1d1d1f] group-hover:text-[#ff3b30] transition-colors truncate">
                      {c.name}
                    </h3>
                    <p className="text-[13px] text-[#86868b] mt-0.5">{c.location}</p>
                  </div>
                  <div className="hidden md:grid grid-cols-4 gap-6 shrink-0">
                    <div className="text-center">
                      <p className="text-[11px] text-[#86868b] mb-0.5">SAT</p>
                      <p className="text-[13px] font-[600] text-[#1d1d1f]">
                        {c.sat_25th}–{c.sat_75th}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] text-[#86868b] mb-0.5">Acceptance</p>
                      <p className="text-[13px] font-[600] text-[#1d1d1f]">
                        {Math.round(c.acceptance_rate * 100)}%
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] text-[#86868b] mb-0.5">Cost</p>
                      <p className="text-[13px] font-[600] text-[#1d1d1f]">
                        ${(c.tuition_out_of_state / 1000).toFixed(0)}k
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-[11px] text-[#86868b] mb-0.5">Size</p>
                      <p className="text-[13px] font-[600] text-[#1d1d1f] capitalize">{c.size}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[22px] font-[700] text-[#ff3b30]">85%</div>
                    <div className="text-[11px] text-[#86868b]">Fit Score</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
