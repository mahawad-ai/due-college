'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';

type College = {
  id: string;
  name: string;
  location: string;
  sat_25th: number;
  sat_75th: number;
  gpa_avg: number;
  acceptance_rate: number;
  tuition_out_of_state: number;
  tuition_in_state: number;
  size: string;
  majors_offered: string[];
  avg_starting_salary: number;
  placement_rate: number;
};

type MatchData = {
  chancing_percentage: number | null;
  overall_fit_score: number | null;
  match_type: string | null;
  message?: string;
};

type AffordabilityData = {
  sticker_price: number;
  estimated_merit_aid: number;
  estimated_need_aid: number;
  estimated_net_cost: number;
  affordability_score: number;
};

const badgeColors: Record<string, string> = {
  reach: 'bg-red-100 text-red-700 border border-red-200',
  target: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  likely: 'bg-green-100 text-green-700 border border-green-200',
};

export default function CollegeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [college, setCollege] = useState<College | null>(null);
  const [match, setMatch] = useState<MatchData | null>(null);
  const [affordability, setAffordability] = useState<AffordabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [collegeRes, matchRes, affordRes] = await Promise.all([
        fetch(`/api/college-search?id=${id}`),
        fetch(`/api/college-match?id=${id}`),
        fetch(`/api/affordability?college_id=${id}`),
      ]);
      const collegeData = await collegeRes.json();
      const matchData = await matchRes.json();
      const affordData = await affordRes.json();
      setCollege(collegeData.college || null);
      setMatch(matchData);
      setAffordability(affordData.error ? null : affordData);
      setLoading(false);
    }
    load();
  }, [id]);

  async function handleAddToList() {
    setAdding(true);
    await fetch('/api/user-colleges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collegeIds: [id] }),
    });
    setAdded(true);
    setAdding(false);
  }

  const fmt = (n: number) =>
    n?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  if (loading) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white pt-[90px] pb-28 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff3b30]" />
        </main>
        <MobileNav />
      </>
    );
  }

  if (!college) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white pt-[90px] pb-28 flex items-center justify-center">
          <p className="text-[#86868b]">College not found.</p>
        </main>
        <MobileNav />
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-[860px] mx-auto px-6 py-8 page-fade">
          {/* Eyebrow */}
          <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">College Discovery</p>

          {/* Hero */}
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <button onClick={() => router.back()} className="text-sm text-[#86868b] hover:text-[#1d1d1f] mb-2 block transition-colors">
                &larr; Back
              </button>
              <h1 className="text-[40px] font-[800] tracking-[-2px] text-[#1d1d1f] leading-tight">
                {college.name}
              </h1>
              <p className="text-[16px] text-[#6e6e73] mt-1">{college.location}</p>
            </div>
            <div className="flex flex-col items-end gap-3 flex-shrink-0">
              {match?.match_type && (
                <span className={`px-4 py-2 rounded-full text-sm font-bold uppercase ${badgeColors[match.match_type]}`}>
                  {match.match_type}
                </span>
              )}
              <button
                onClick={handleAddToList}
                disabled={adding || added}
                className="bg-[#ff3b30] text-white px-6 py-2 rounded-xl font-[600] hover:opacity-85 disabled:opacity-60 transition-opacity"
              >
                {added ? 'Added!' : adding ? 'Adding...' : 'Add to My List'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {match?.overall_fit_score != null && (
                <div className="bg-[#f5f5f7] rounded-2xl p-6">
                  <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">Your Personalized Fit</h2>
                  <div className="flex gap-8 mb-4">
                    <div className="text-center">
                      <div className="text-4xl font-[800] text-[#ff3b30]">{match.overall_fit_score}%</div>
                      <div className="text-sm text-[#86868b] mt-1">Fit Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-[800] text-[#1d1d1f]">{match.chancing_percentage}%</div>
                      <div className="text-sm text-[#86868b] mt-1">Acceptance Chance</div>
                    </div>
                  </div>
                  <div className="h-3 bg-[#e8e8ed] rounded-full overflow-hidden">
                    <div className="h-full bg-[#ff3b30] rounded-full" style={{ width: `${match.overall_fit_score}%` }} />
                  </div>
                </div>
              )}
              {match?.message && !match?.overall_fit_score && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-yellow-700 text-sm">
                  {match.message}
                </div>
              )}

              <div className="bg-[#f5f5f7] rounded-2xl p-6">
                <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">Academic Profile</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-[#86868b]">SAT Range</div>
                    <div className="font-[600] text-[#1d1d1f]">{college.sat_25th} &ndash; {college.sat_75th}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#86868b]">Average GPA</div>
                    <div className="font-[600] text-[#1d1d1f]">{college.gpa_avg?.toFixed(2) || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-[#86868b]">Acceptance Rate</div>
                    <div className="font-[600] text-[#1d1d1f]">
                      {college.acceptance_rate != null ? `${college.acceptance_rate}%` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#86868b]">School Size</div>
                    <div className="font-[600] text-[#1d1d1f] capitalize">{college.size || 'N/A'}</div>
                  </div>
                </div>
              </div>

              {college.majors_offered?.length > 0 && (
                <div className="bg-[#f5f5f7] rounded-2xl p-6">
                  <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">Popular Majors</h2>
                  <div className="flex flex-wrap gap-2">
                    {college.majors_offered.map((m) => (
                      <span key={m} className="bg-white border border-[#e8e8ed] text-[#1d1d1f] px-3 py-1 rounded-full text-sm font-[500]">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-[#f5f5f7] rounded-2xl p-6">
                <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">Career Outcomes</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-[#86868b]">Avg Starting Salary</div>
                    <div className="font-[600] text-[#1d1d1f]">
                      {college.avg_starting_salary ? fmt(college.avg_starting_salary) : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-[#86868b]">Job Placement Rate</div>
                    <div className="font-[600] text-[#1d1d1f]">
                      {college.placement_rate != null ? `${college.placement_rate}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#f5f5f7] rounded-2xl p-6">
                <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">Tuition &amp; Costs</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#86868b]">In-State</span>
                    <span className="font-[600] text-[#1d1d1f]">{college.tuition_in_state ? fmt(college.tuition_in_state) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#86868b]">Out-of-State</span>
                    <span className="font-[600] text-[#1d1d1f]">{college.tuition_out_of_state ? fmt(college.tuition_out_of_state) : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {affordability && (
                <div className="bg-[#f5f5f7] rounded-2xl p-6">
                  <h2 className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-4">Affordability Estimate</h2>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#86868b]">Sticker Price</span>
                      <span className="font-[600] text-[#1d1d1f]">{fmt(affordability.sticker_price)}</span>
                    </div>
                    {affordability.estimated_merit_aid > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Merit Aid</span>
                        <span>- {fmt(affordability.estimated_merit_aid)}</span>
                      </div>
                    )}
                    {affordability.estimated_need_aid > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Need-Based Aid</span>
                        <span>- {fmt(affordability.estimated_need_aid)}</span>
                      </div>
                    )}
                    <div className="border-t border-[#e8e8ed] pt-2 flex justify-between font-[700] text-[#1d1d1f]">
                      <span>Est. Net Cost</span>
                      <span>{fmt(affordability.estimated_net_cost)}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-[#86868b] mb-1">
                      <span>Affordability Score</span>
                      <span>{affordability.affordability_score}/100</span>
                    </div>
                    <div className="h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${affordability.affordability_score}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <MobileNav />
    </>
  );
}
