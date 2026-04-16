'use client';

import { useEffect, useState } from 'react';
import TopNav from '@/components/TopNav';
import MobileNav from '@/components/MobileNav';
import CollegeLogo from '@/components/CollegeLogo';

type CollegeRec = {
  id: string;
  name: string;
  location: string;
  overall_fit_score: number;
  chancing_percentage: number;
  match_type: 'reach' | 'target' | 'likely';
};

const badgeStyles: Record<string, string> = {
  reach: 'bg-[#ff3b30]/10 text-[#ff3b30]',
  target: 'bg-[#ff9f0a]/10 text-[#ff9f0a]',
  likely: 'bg-[#34c759]/10 text-[#34c759]',
};

const fitBarColor: Record<string, string> = {
  reach: '#ff3b30',
  target: '#ff9f0a',
  likely: '#34c759',
};

const sectionConfig = [
  { key: 'likely', label: 'Likely Schools', desc: 'Schools where you have a strong chance of admission' },
  { key: 'target', label: 'Target Schools', desc: 'Schools where you are a competitive applicant' },
  { key: 'reach', label: 'Reach Schools', desc: 'Ambitious schools that would be a stretch' },
];


function CollegeCard({ college, onAdd }: { college: CollegeRec; onAdd: (id: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    setAdding(true);
    await fetch('/api/user-colleges', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collegeIds: [college.id] }),
    });
    setAdded(true);
    setAdding(false);
    onAdd(college.id);
  }

  const barColor = fitBarColor[college.match_type] ?? '#ff3b30';

  return (
    <div className="bg-[#f5f5f7] rounded-2xl p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <CollegeLogo name={college.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-[600] text-[#1d1d1f] text-[15px] leading-tight truncate">
              {college.name}
            </h3>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-[600] shrink-0 ${badgeStyles[college.match_type]}`}
            >
              {college.match_type.charAt(0).toUpperCase() + college.match_type.slice(1)}
            </span>
          </div>
          <p className="text-[13px] text-[#86868b] mt-0.5">{college.location}</p>
        </div>
      </div>

      <div className="flex gap-6 text-[13px]">
        <div>
          <span className="text-[#86868b]">Fit Score </span>
          <span className="font-[700] text-[#ff3b30]">{college.overall_fit_score}%</span>
        </div>
        <div>
          <span className="text-[#86868b]">Chance </span>
          <span className="font-[600] text-[#1d1d1f]">{college.chancing_percentage}%</span>
        </div>
      </div>

      {/* Fit bar */}
      <div className="h-[4px] bg-[#e8e8ed] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${college.overall_fit_score}%`, backgroundColor: barColor }}
        />
      </div>

      <button
        onClick={handleAdd}
        disabled={adding || added}
        className={
          added
            ? 'text-[13px] font-[600] py-2 rounded-xl border border-[#34c759]/30 bg-[#34c759]/10 text-[#34c759]'
            : 'text-[13px] font-[600] py-2 rounded-xl bg-[#ff3b30] hover:bg-[#e6352b] text-white transition-colors disabled:opacity-60'
        }
      >
        {added ? 'Added to My List' : adding ? 'Adding...' : 'Add to My List'}
      </button>
    </div>
  );
}

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<CollegeRec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiEnriched, setAiEnriched] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetch('/api/college-recommendations');
      const data = await res.json();
      if (res.status === 400 || data.error) {
        setError(data.error || 'Please complete your profile first.');
        setLoading(false);
        return;
      }
      setRecs(data.recommendations || []);
      setAiEnriched(data.ai_enriched || false);
      setLoading(false);
    }
    load();
  }, []);

  function handleAdd(id: string) {
    // optimistic: nothing needed
  }

  const grouped = {
    likely: recs.filter((r) => r.match_type === 'likely'),
    target: recs.filter((r) => r.match_type === 'target'),
    reach: recs.filter((r) => r.match_type === 'reach'),
  };

  return (
    <>
      <TopNav />
      <main className="min-h-screen bg-white pt-[90px] pb-28">
        <div className="max-w-5xl mx-auto px-6">
          {/* Hero */}
          <div className="mb-10 flex items-start justify-between">
            <div>
              <h1 className="text-[34px] font-[700] tracking-[-0.5px] text-[#1d1d1f] leading-tight">
                AI <span className="text-[#ff3b30]">Recommendations</span>
              </h1>
              <p className="text-[15px] text-[#86868b] mt-1">
                Personalized college matches based on your profile
              </p>
            </div>
            {aiEnriched && (
              <span className="bg-[#1d1d1f] text-white text-[12px] px-3 py-1.5 rounded-full font-[600] shrink-0 mt-2">
                AI Powered
              </span>
            )}
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-2 border-[#ff3b30] border-t-transparent rounded-full animate-spin" />
              <p className="text-[14px] text-[#86868b]">AI is analyzing your profile...</p>
            </div>
          )}

          {!loading && error && (
            <div className="bg-[#f5f5f7] rounded-2xl p-8 text-center max-w-md mx-auto mt-12">
              <div className="w-12 h-12 bg-[#e8e8ed] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-[20px]">📋</span>
              </div>
              <h2 className="font-[700] text-[#1d1d1f] text-[17px] mb-2">
                Complete Your Profile First
              </h2>
              <p className="text-[13px] text-[#86868b] mb-6">{error}</p>
              <a
                href="/discover/profile"
                className="inline-block bg-[#ff3b30] hover:bg-[#e6352b] text-white px-6 py-2.5 rounded-xl font-[600] text-[14px] transition-colors"
              >
                Go to Profile
              </a>
            </div>
          )}

          {!loading && !error && recs.length === 0 && (
            <div className="text-center py-16 text-[14px] text-[#86868b]">
              No recommendations found. Try updating your profile.
            </div>
          )}

          {!loading && !error && recs.length > 0 && (
            <div className="space-y-12">
              {sectionConfig.map(({ key, label, desc }) => {
                const list = grouped[key as keyof typeof grouped];
                if (list.length === 0) return null;
                return (
                  <section key={key}>
                    <div className="mb-1">
                      <h2 className="text-[22px] font-[700] text-[#1d1d1f]">{label}</h2>
                    </div>
                    <p className="text-[14px] text-[#86868b] mb-5">{desc}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {list.map((college) => (
                        <CollegeCard key={college.id} college={college} onAdd={handleAdd} />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  );
}
