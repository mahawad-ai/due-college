'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';

type College = {
  id: string;
  name: string;
  location: string;
  sat_25th: number;
  sat_75th: number;
  acceptance_rate: number;
  tuition_out_of_state: number;
  size: string;
  avg_starting_salary: number;
  placement_rate: number;
};

type MatchData = {
  chancing_percentage: number | null;
  overall_fit_score: number | null;
  match_type: string | null;
};

type CollegeWithMatch = College & MatchData;

const badgeColors: Record<string, string> = {
  reach: 'text-red-600',
  target: 'text-yellow-600',
  likely: 'text-green-600',
};

function CompareCell({ value, best, isBest }: { value: string; best: boolean; isBest: boolean }) {
  return (
    <td className={`px-4 py-3 text-center text-sm font-[500] ${isBest ? 'text-green-600 bg-green-50' : 'text-[#1d1d1f]'}`}>
      {value}
    </td>
  );
}

export default function ComparePage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids') || '';
  const ids = idsParam.split(',').filter(Boolean).slice(0, 3);

  const [colleges, setColleges] = useState<CollegeWithMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) { setLoading(false); return; }
    async function load() {
      setLoading(true);
      const results = await Promise.all(
        ids.map(async (id) => {
          const [cRes, mRes] = await Promise.all([
            fetch(`/api/college-search?id=${id}`),
            fetch(`/api/college-match?id=${id}`),
          ]);
          const cData = await cRes.json();
          const mData = await mRes.json();
          return cData.college ? { ...cData.college, ...mData } : null;
        })
      );
      setColleges(results.filter(Boolean) as CollegeWithMatch[]);
      setLoading(false);
    }
    load();
  }, [idsParam]);

  const fmt = (n: number) =>
    n?.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const pct = (n: number | null) => (n != null ? `${Math.round(n * 100)}%` : 'N/A');

  const maxIdx = (arr: (number | null)[]) => {
    let best = -1, bestVal = -Infinity;
    arr.forEach((v, i) => { if (v != null && v > bestVal) { bestVal = v; best = i; } });
    return best;
  };
  const minIdx = (arr: (number | null)[]) => {
    let best = -1, bestVal = Infinity;
    arr.forEach((v, i) => { if (v != null && v < bestVal) { bestVal = v; best = i; } });
    return best;
  };

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

  if (ids.length === 0) {
    return (
      <>
        <TopNav />
        <main className="min-h-screen bg-white pt-[90px] pb-28">
          <div className="max-w-[860px] mx-auto px-6 py-8 page-fade">
            <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">College Discovery</p>
            <h1 className="text-[40px] font-[800] tracking-[-2px] text-[#1d1d1f] mb-2">
              Compare<br /><span className="text-[#ff3b30]">Side by side.</span>
            </h1>
            <p className="text-[16px] text-[#6e6e73] mb-10">
              Add colleges to compare by visiting a college page, or navigate to{' '}
              <code className="bg-[#f5f5f7] px-2 py-1 rounded-lg text-sm">/discover/compare?ids=id1,id2,id3</code>
            </p>
            <Link href="/discover/search" className="bg-[#ff3b30] text-white px-6 py-3 rounded-xl font-[600] hover:opacity-85 transition-opacity inline-block">
              Search Colleges
            </Link>
          </div>
        </main>
        <MobileNav />
      </>
    );
  }

  const satRanges = colleges.map((c) => c.sat_75th);
  const acceptanceRates = colleges.map((c) => c.acceptance_rate);
  const tuitions = colleges.map((c) => c.tuition_out_of_state);
  const fitScores = colleges.map((c) => c.overall_fit_score);
  const chancing = colleges.map((c) => c.chancing_percentage);
  const salaries = colleges.map((c) => c.avg_starting_salary);
  const placements = colleges.map((c) => c.placement_rate);

  const bestSAT = maxIdx(satRanges);
  const bestAcceptance = maxIdx(acceptanceRates);
  const bestTuition = minIdx(tuitions);
  const bestFit = maxIdx(fitScores);
  const bestChancing = maxIdx(chancing);
  const bestSalary = maxIdx(salaries);
  const bestPlacement = maxIdx(placements);

  const rows = [
    {
      label: 'SAT Range',
      values: colleges.map((c) => `${c.sat_25th} - ${c.sat_75th}`),
      best: bestSAT,
    },
    {
      label: 'Acceptance Rate',
      values: colleges.map((c) => pct(c.acceptance_rate)),
      best: bestAcceptance,
    },
    {
      label: 'Out-of-State Tuition',
      values: colleges.map((c) => (c.tuition_out_of_state ? fmt(c.tuition_out_of_state) : 'N/A')),
      best: bestTuition,
    },
    {
      label: 'Fit Score',
      values: colleges.map((c) => (c.overall_fit_score != null ? `${c.overall_fit_score}%` : 'N/A')),
      best: bestFit,
    },
    {
      label: 'Your Acceptance Chance',
      values: colleges.map((c) => (c.chancing_percentage != null ? `${c.chancing_percentage}%` : 'N/A')),
      best: bestChancing,
    },
    {
      label: 'School Size',
      values: colleges.map((c) => c.size || 'N/A'),
      best: -1,
    },
    {
      label: 'Avg Starting Salary',
      values: colleges.map((c) => (c.avg_starting_salary ? fmt(c.avg_starting_salary) : 'N/A')),
      best: bestSalary,
    },
    {
      label: 'Placement Rate',
      values: colleges.map((c) => (c.placement_rate != null ? pct(c.placement_rate) : 'N/A')),
      best: bestPlacement,
    },
  ];

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-[860px] mx-auto px-6 py-8 page-fade">
          <p className="text-[11px] font-[700] uppercase tracking-[0.7px] text-[#86868b] mb-3">College Discovery</p>
          <h1 className="text-[40px] font-[800] tracking-[-2px] text-[#1d1d1f] mb-8">
            Compare<br /><span className="text-[#ff3b30]">Side by side.</span>
          </h1>

          <div className="bg-[#f5f5f7] rounded-3xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-[#1d1d1f] text-white">
                  <th className="px-4 py-4 text-left text-[11px] font-[700] uppercase tracking-[0.7px] w-40">Metric</th>
                  {colleges.map((c) => (
                    <th key={c.id} className="px-4 py-4 text-center text-sm font-[600]">
                      <div className="text-white">{c.name}</div>
                      <div className="text-[#86868b] text-xs font-[400] mt-0.5">{c.location}</div>
                      {c.match_type && (
                        <span className={`text-xs font-[700] uppercase ${badgeColors[c.match_type] || 'text-[#86868b]'}`}>
                          {c.match_type}
                        </span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={row.label} className={ri % 2 === 0 ? 'bg-white' : 'bg-[#f5f5f7]'}>
                    <td className="px-4 py-3 text-sm font-[600] text-[#86868b]">{row.label}</td>
                    {row.values.map((val, ci) => (
                      <CompareCell key={ci} value={val} best={row.best === ci} isBest={row.best === ci} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-[#86868b] mt-3">Green highlights indicate the best value for each metric.</p>
        </div>
      </main>
      <MobileNav />
    </>
  );
}
