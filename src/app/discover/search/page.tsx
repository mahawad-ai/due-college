'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';

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
      <DashboardSidebar />
      <main className="min-h-screen bg-gray-50 ml-64 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-navy mb-2">Discover Colleges</h1>
          <p className="text-gray-600 mb-8">Search and filter colleges that match your profile</p>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-navy mb-4">Filter Colleges</h2>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-4">
              <input type="number" placeholder="Min SAT" value={filters.sat_min} onChange={(e) => setFilters({...filters, sat_min: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20" />
              <input type="number" placeholder="Max SAT" value={filters.sat_max} onChange={(e) => setFilters({...filters, sat_max: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20" />
              <input type="number" placeholder="Max Accept %" value={filters.acceptance_rate_max} onChange={(e) => setFilters({...filters, acceptance_rate_max: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20" />
              <select value={filters.size} onChange={(e) => setFilters({...filters, size: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20"><option value="">Size</option><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select>
              <input type="text" placeholder="Location" value={filters.location} onChange={(e) => setFilters({...filters, location: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20" />
              <input type="text" placeholder="Major" value={filters.major} onChange={(e) => setFilters({...filters, major: e.target.value})} className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-navy/20" />
            </div>
            <button onClick={handleFilter} className="bg-coral hover:bg-coral/90 text-white font-semibold px-6 py-2 rounded-lg transition-colors">Search</button>
          </div>

          {error && <div className="bg-red-50 text-red-700 rounded-lg p-4 mb-6">{error}</div>}

          {loading ? (
            <div className="flex justify-center py-12"><div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" /></div>
          ) : colleges.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center"><p className="text-gray-600">No colleges found</p></div>
          ) : (
            <div className="space-y-4">
              {colleges.map((c) => (
                <Link key={c.id} href={`/discover/college/${c.id}`} className="block bg-white rounded-2xl border border-gray-200 p-6 hover:border-coral hover:shadow-lg transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div><h3 className="text-lg font-bold text-navy">{c.name}</h3><p className="text-sm text-gray-600">{c.location}</p></div>
                    <div className="text-right"><div className="text-2xl font-bold text-coral">85%</div><div className="text-xs text-gray-600">Fit Score</div></div>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div><p className="text-gray-600">SAT</p><p className="font-semibold text-navy">{c.sat_25th} - {c.sat_75th}</p></div>
                    <div><p className="text-gray-600">Acceptance</p><p className="font-semibold text-navy">{Math.round(c.acceptance_rate * 100)}%</p></div>
                    <div><p className="text-gray-600">Cost</p><p className="font-semibold text-navy">${(c.tuition_out_of_state / 1000).toFixed(0)}k</p></div>
                    <div><p className="text-gray-600">Size</p><p className="font-semibold text-navy capitalize">{c.size}</p></div>
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
