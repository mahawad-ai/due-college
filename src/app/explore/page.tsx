'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import { cn } from '@/lib/utils';

interface CollegeResult {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  type: string | null;
  region: string | null;
  setting: string | null;
  acceptance_rate: number | null;
  avg_gpa: number | null;
  sat_25: number | null;
  sat_75: number | null;
  act_25: number | null;
  act_75: number | null;
  tuition_in_state: number | null;
  tuition_out_state: number | null;
  enrollment: number | null;
  common_app: boolean;
  website: string | null;
  fit?: 'reach' | 'match' | 'safety' | null;
}

interface StudentProfile {
  best_sat: number | null;
  best_act: number | null;
  gpa: number | null;
  preferred_regions: string[] | null;
  preferred_settings: string[] | null;
  preferred_size: string | null;
}

const REGIONS = ['Northeast', 'South', 'Midwest', 'West', 'Southwest', 'Southeast'];
const SETTINGS = ['urban', 'suburban', 'rural', 'small_town'];
const TYPES = ['private', 'public', 'liberal_arts'];

function getFit(college: CollegeResult, profile: StudentProfile | null): 'reach' | 'match' | 'safety' | null {
  if (!profile) return null;
  const sat = profile.best_sat;
  const act = profile.best_act;
  if (!sat && !act) return null;
  if (!college.sat_25 || !college.sat_75) return null;

  // Use SAT if available, convert ACT to SAT equivalent otherwise
  let score = sat;
  if (!score && act) {
    // ACT to SAT rough conversion
    const actToSat: Record<number, number> = { 36: 1590, 35: 1540, 34: 1500, 33: 1460, 32: 1430, 31: 1400, 30: 1370, 29: 1340, 28: 1310, 27: 1280, 26: 1240, 25: 1210, 24: 1180, 23: 1140, 22: 1110, 21: 1080, 20: 1040 };
    score = actToSat[act] || act * 42;
  }
  if (!score) return null;

  const mid = (college.sat_25 + college.sat_75) / 2;
  if (score < college.sat_25 - 50) return 'reach';
  if (score >= college.sat_75 - 30) return 'safety';
  if (Math.abs(score - mid) <= 80) return 'match';
  if (score < mid) return 'reach';
  return 'safety';
}

const FIT_CONFIG = {
  reach:  { label: 'Reach',  color: 'bg-red-100 text-red-700',   border: 'border-red-200' },
  match:  { label: 'Match',  color: 'bg-yellow-100 text-yellow-700', border: 'border-yellow-200' },
  safety: { label: 'Safety', color: 'bg-green-100 text-green-700', border: 'border-green-200' },
};

export default function ExplorePage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [colleges, setColleges] = useState<CollegeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [addingId, setAddingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filters
  const [q, setQ] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterRegion, setFilterRegion] = useState('');
  const [filterSetting, setFilterSetting] = useState('');
  const [filterMaxAcceptance, setFilterMaxAcceptance] = useState('');
  const [filterFit, setFilterFit] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    // Load student profile and added colleges
    Promise.all([
      fetch('/api/student-profile').then(r => r.json()),
      fetch('/api/user-colleges/status').then(r => r.json()),
    ]).then(([profileData, collegesData]) => {
      setStudentProfile(profileData.profile);
      const ids = new Set<string>((collegesData.colleges || []).map((c: { college_id: string }) => c.college_id));
      setAddedIds(ids);
    });
    search();
  }, [isLoaded, user, router]);

  const search = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (filterType) params.set('type', filterType);
    if (filterRegion) params.set('region', filterRegion);
    if (filterSetting) params.set('setting', filterSetting);
    if (filterMaxAcceptance) params.set('maxAcceptance', filterMaxAcceptance);
    params.set('limit', '40');
    const res = await fetch(`/api/college-search?${params}`);
    const data = await res.json();
    setColleges(data.colleges || []);
    setLoading(false);
  }, [q, filterType, filterRegion, filterSetting, filterMaxAcceptance]);

  useEffect(() => {
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function handleAdd(college: CollegeResult) {
    setAddingId(college.id);
    try {
      await fetch('/api/user-colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collegeIds: [college.id] }),
      });
      setAddedIds(prev => new Set([...prev, college.id]));
    } finally {
      setAddingId(null);
    }
  }

  const displayColleges = colleges.map(c => ({ ...c, fit: getFit(c, studentProfile) }))
    .filter(c => !filterFit || c.fit === filterFit);

  const hasProfile = studentProfile?.best_sat || studentProfile?.best_act;
  const hasActiveFilters = filterType || filterRegion || filterSetting || filterMaxAcceptance || filterFit;

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <Link href="/more" className="text-sm text-gray-500 hover:text-navy font-medium mb-1 block">← More</Link>
              <h1 className="text-2xl font-extrabold text-navy">Explore Colleges</h1>
            </div>
            <Link href="/profile" className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
              {hasProfile ? '✓ Profile set' : 'Set profile →'}
            </Link>
          </div>

          {/* No profile nudge */}
          {!hasProfile && (
            <div className="bg-yellow-50 border border-yellow rounded-2xl p-4 mb-4">
              <p className="text-sm font-semibold text-navy">Add your SAT/ACT scores to see Reach / Match / Safety labels</p>
              <Link href="/profile" className="text-sm text-coral font-semibold hover:underline mt-1 block">Set up academic profile →</Link>
            </div>
          )}

          {/* Search bar */}
          <div className="relative mb-3">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search colleges..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
            />
          </div>

          {/* Filter toggle */}
          <div className="flex gap-2 mb-3 flex-wrap">
            <button onClick={() => setShowFilters(v => !v)} className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors', showFilters || hasActiveFilters ? 'bg-navy text-white border-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-navy')}>
              🔧 Filters{hasActiveFilters ? ` (${[filterType, filterRegion, filterSetting, filterMaxAcceptance, filterFit].filter(Boolean).length})` : ''}
            </button>
            {hasProfile && (['reach', 'match', 'safety'] as const).map(fit => (
              <button key={fit} onClick={() => setFilterFit(filterFit === fit ? '' : fit)} className={cn('text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors', filterFit === fit ? 'bg-navy text-white border-navy' : cn('bg-white border', FIT_CONFIG[fit].border, FIT_CONFIG[fit].color, 'hover:border-navy'))}>
                {FIT_CONFIG[fit].label}
              </button>
            ))}
            {hasActiveFilters && (
              <button onClick={() => { setFilterType(''); setFilterRegion(''); setFilterSetting(''); setFilterMaxAcceptance(''); setFilterFit(''); }} className="text-xs text-coral font-semibold hover:underline">Clear all</button>
            )}
          </div>

          {/* Filter panel */}
          {showFilters && (
            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Type</label>
                  <select value={filterType} onChange={e => setFilterType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none">
                    <option value="">All types</option>
                    {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Region</label>
                  <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none">
                    <option value="">All regions</option>
                    {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Setting</label>
                  <select value={filterSetting} onChange={e => setFilterSetting(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none">
                    <option value="">Any setting</option>
                    {SETTINGS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 block mb-1">Max acceptance rate</label>
                  <select value={filterMaxAcceptance} onChange={e => setFilterMaxAcceptance(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none">
                    <option value="">Any</option>
                    <option value="10">Under 10%</option>
                    <option value="20">Under 20%</option>
                    <option value="35">Under 35%</option>
                    <option value="50">Under 50%</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          {loading && <div className="text-center py-8 text-gray-400 text-sm">Searching...</div>}

          {!loading && displayColleges.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-3">🏫</div>
              <p className="text-gray-500 text-sm">No colleges found. Try adjusting your filters.</p>
            </div>
          )}

          <div className="space-y-3">
            {displayColleges.map(college => {
              const isAdded = addedIds.has(college.id);
              const isExpanded = expandedId === college.id;
              const fit = college.fit;

              return (
                <div key={college.id} className={cn('bg-white rounded-2xl border overflow-hidden', fit ? FIT_CONFIG[fit].border : 'border-gray-200')}>
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : college.id)}>
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <span className="font-bold text-navy text-sm">{college.name}</span>
                          {fit && (
                            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', FIT_CONFIG[fit].color)}>{FIT_CONFIG[fit].label}</span>
                          )}
                          {college.common_app && (
                            <span className="text-xs bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">Common App</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400">{college.city && `${college.city}, `}{college.state} · {college.type?.replace('_', ' ')} · {college.setting}</p>
                        {college.acceptance_rate !== null && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-semibold">{college.acceptance_rate}%</span> acceptance
                            {college.sat_25 && ` · SAT ${college.sat_25}–${college.sat_75}`}
                            {college.act_25 && ` · ACT ${college.act_25}–${college.act_75}`}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => !isAdded && handleAdd(college)}
                        disabled={isAdded || addingId === college.id}
                        className={cn('flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl border transition-all', isAdded ? 'bg-green-50 text-green-700 border-green-200 cursor-default' : 'bg-coral text-white border-coral hover:bg-coral/90 active:scale-95')}
                      >
                        {addingId === college.id ? '...' : isAdded ? '✓ Added' : '+ Add'}
                      </button>
                    </div>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-x-4 gap-y-2">
                        {college.tuition_out_state && (
                          <div>
                            <p className="text-xs text-gray-400">Tuition (out-of-state)</p>
                            <p className="text-sm font-semibold text-navy">${college.tuition_out_state.toLocaleString()}</p>
                          </div>
                        )}
                        {college.tuition_in_state && (
                          <div>
                            <p className="text-xs text-gray-400">Tuition (in-state)</p>
                            <p className="text-sm font-semibold text-navy">${college.tuition_in_state.toLocaleString()}</p>
                          </div>
                        )}
                        {college.avg_gpa && (
                          <div>
                            <p className="text-xs text-gray-400">Avg GPA</p>
                            <p className="text-sm font-semibold text-navy">{college.avg_gpa}</p>
                          </div>
                        )}
                        {college.enrollment && (
                          <div>
                            <p className="text-xs text-gray-400">Enrollment</p>
                            <p className="text-sm font-semibold text-navy">{college.enrollment.toLocaleString()}</p>
                          </div>
                        )}
                        {college.region && (
                          <div>
                            <p className="text-xs text-gray-400">Region</p>
                            <p className="text-sm font-semibold text-navy">{college.region}</p>
                          </div>
                        )}
                        <div className="col-span-2 flex gap-3 mt-1">
                          {college.website && (
                            <a href={college.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 font-medium hover:underline">Visit website →</a>
                          )}
                          <Link href={`/school/${college.id}`} className="text-xs text-navy font-medium hover:underline">View deadlines →</Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && displayColleges.length > 0 && (
            <p className="text-xs text-center text-gray-400 mt-4">{displayColleges.length} colleges shown · <Link href="/suggest" className="text-coral hover:underline">Get AI suggestions →</Link></p>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  );
}
