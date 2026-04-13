'use client';

import { useEffect, useState } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';

type CollegeRec = {
  id: string;
  name: string;
  location: string;
  overall_fit_score: number;
  chancing_percentage: number;
  match_type: 'reach' | 'target' | 'likely';
};

const badgeStyles: Record<string, string> = {
  reach: 'bg-red-100 text-red-700 border border-red-200',
  target: 'bg-yellow-100 text-yellow-700 border border-yellow-200',
  likely: 'bg-green-100 text-green-700 border border-green-200',
};

const sectionConfig = [
  { key: 'likely', label: 'Likely Schools', emoji: '✅', desc: 'Schools where you have a strong chance of admission' },
  { key: 'target', label: 'Target Schools', emoji: '🎯', desc: 'Schools where you are a competitive applicant' },
  { key: 'reach', label: 'Reach Schools', emoji: '🚀', desc: 'Ambitious schools that would be a stretch' },
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

  return (
    <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-navy text-lg leading-tight">{college.name}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{college.location}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${badgeStyles[college.match_type]}`}>
          {college.match_type}
        </span>
      </div>
      <div className="flex gap-4 text-sm">
        <div>
          <span className="text-gray-500">Fit Score </span>
          <span className="font-bold text-coral">{college.overall_fit_score}%</span>
        </div>
        <div>
          <span className="text-gray-500">Chance </span>
          <span className="font-bold text-navy">{college.chancing_percentage}%</span>
        </div>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-coral rounded-full" style={{ width: `${college.overall_fit_score}%` }} />
      </div>
      <button
        onClick={handleAdd}
        disabled={adding || added}
        className="bg-coral text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 disabled:opacity-60 mt-1"
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
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="ml-64 flex-1 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-navy">AI Recommendations</h1>
            <p className="text-gray-500 text-sm mt-1">Personalized college matches based on your profile</p>
          </div>
          {aiEnriched && (
            <span className="bg-navy text-white text-xs px-3 py-1 rounded-full font-medium">
              AI Powered
            </span>
          )}
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-navy" />
            <p className="text-gray-500 text-sm">AI is analyzing your profile...</p>
          </div>
        )}

        {!loading && error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center max-w-md mx-auto mt-16">
            <div className="text-4xl mb-3">📋</div>
            <h2 className="font-bold text-navy text-lg mb-2">Complete Your Profile First</h2>
            <p className="text-yellow-700 text-sm mb-4">{error}</p>
            <a
              href="/discover/profile"
              className="bg-coral text-white px-6 py-2 rounded-lg font-semibold text-sm inline-block"
            >
              Go to Profile
            </a>
          </div>
        )}

        {!loading && !error && recs.length === 0 && (
          <div className="text-center py-16 text-gray-500">No recommendations found. Try updating your profile.</div>
        )}

        {!loading && !error && recs.length > 0 && (
          <div className="space-y-10">
            {sectionConfig.map(({ key, label, emoji, desc }) => {
              const list = grouped[key as keyof typeof grouped];
              if (list.length === 0) return null;
              return (
                <section key={key}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{emoji}</span>
                    <h2 className="text-xl font-bold text-navy">{label}</h2>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{desc}</p>
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
      </main>
    </div>
  );
}
