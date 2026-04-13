'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DashboardSidebar from '@/components/DashboardSidebar';

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
    <td className={`px-4 py-3 text-center text-sm font-medium ${isBest ? 'text-green-600 bg-green-50' : 'text-gray-700'}`}>
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
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <main className="ml-64 flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy" />
        </main>
      </div>
    );
  }

  if (ids.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <main className="ml-64 flex-1 p-8">
          <h1 className="text-2xl font-bold text-navy mb-4">Compare Colleges</h1>
          <p className="text-gray-500">
            Add colleges to compare by visiting a college page and using the compare feature, or navigate to{' '}
            <code className="bg-gray-100 px-2 py-1 rounded">/discover/compare?ids=id1,id2,id3</code>
          </p>
          <Link href="/discover/search" className="mt-4 inline-block bg-coral text-white px-6 py-2 rounded-lg font-semibold">
            Search Colleges
          </Link>
        </main>
      </div>
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
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="ml-64 flex-1 p-8">
        <h1 className="text-2xl font-bold text-navy mb-6">Compare Colleges</h1>
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-navy text-white">
                <th className="px-4 py-3 text-left text-sm font-semibold w-40">Metric</th>
                {colleges.map((c) => (
                  <th key={c.id} className="px-4 py-3 text-center text-sm font-semibold">
                    <div>{c.name}</div>
                    <div className="text-xs text-blue-200 font-normal">{c.location}</div>
                    {c.match_type && (
                      <span className={`text-xs font-bold uppercase ${badgeColors[c.match_type] || 'text-blue-200'}`}>
                        {c.match_type}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={row.label} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 text-sm font-medium text-gray-600">{row.label}</td>
                  {row.values.map((val, ci) => (
                    <CompareCell key={ci} value={val} best={row.best === ci} isBest={row.best === ci} />
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">Green highlights indicate the best value for each metric.</p>
      </main>
    </div>
  );
}
