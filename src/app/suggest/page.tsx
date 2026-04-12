'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import { cn } from '@/lib/utils';

interface SuggestedCollege {
  name: string;
  fit: 'reach' | 'match' | 'safety';
  reason: string;
  acceptance_rate?: string;
  known_for?: string;
}

interface StudentProfile {
  gpa: number | null;
  best_sat: number | null;
  best_act: number | null;
  intended_major: string | null;
  preferred_regions: string[] | null;
  preferred_size: string | null;
  preferred_settings: string[] | null;
}

const FIT_CONFIG = {
  reach:  { label: 'Reach',  color: 'bg-red-100 text-red-700',    emoji: '🚀' },
  match:  { label: 'Match',  color: 'bg-yellow-100 text-yellow-700', emoji: '🎯' },
  safety: { label: 'Safety', color: 'bg-green-100 text-green-700', emoji: '✅' },
};

export default function SuggestPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedCollege[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [addingName, setAddingName] = useState<string | null>(null);
  const [addedNames, setAddedNames] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoaded) return;
    if (!user) { router.push('/login'); return; }
    fetch('/api/student-profile').then(r => r.json()).then(d => setProfile(d.profile));
  }, [isLoaded, user, router]);

  const hasProfile = profile && (profile.gpa || profile.best_sat || profile.best_act);

  async function generate() {
    if (!hasProfile) return;
    setLoading(true);
    setGenerated(false);

    // Build a structured prompt for the Claude API
    const profileDesc = [
      profile.gpa && `GPA: ${profile.gpa}/4.0`,
      profile.best_sat && `SAT: ${profile.best_sat}/1600`,
      profile.best_act && `ACT: ${profile.best_act}/36`,
      profile.intended_major && `Intended major: ${profile.intended_major}`,
      profile.preferred_regions?.length && `Preferred regions: ${profile.preferred_regions.join(', ')}`,
      profile.preferred_size && profile.preferred_size !== 'any' && `Preferred school size: ${profile.preferred_size}`,
      profile.preferred_settings?.length && `Preferred settings: ${profile.preferred_settings.join(', ')}`,
    ].filter(Boolean).join('\n');

    try {
      const res = await fetch('/api/suggest-colleges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileDesc }),
      });
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setGenerated(true);
    } catch {
      // fallback to rule-based if API fails
      setSuggestions(getRuleBasedSuggestions(profile));
      setGenerated(true);
    }
    setLoading(false);
  }

  function getRuleBasedSuggestions(p: StudentProfile): SuggestedCollege[] {
    const sat = p.best_sat || (p.best_act ? p.best_act * 42 : 0);
    const gpa = p.gpa || 3.0;
    const suggestions: SuggestedCollege[] = [];

    if (sat >= 1450 || gpa >= 3.8) {
      suggestions.push({ name: 'Duke University', fit: 'reach', reason: 'Top private university known for research and strong academics', acceptance_rate: '7.3%', known_for: p.intended_major || 'Academics' });
      suggestions.push({ name: 'Vanderbilt University', fit: 'reach', reason: 'Highly selective, strong aid, great campus culture', acceptance_rate: '6.4%', known_for: 'Academics & Aid' });
    }
    if (sat >= 1300 || gpa >= 3.5) {
      suggestions.push({ name: 'University of Virginia', fit: 'match', reason: 'Top public university with strong academics and value', acceptance_rate: '20%', known_for: 'Public ivy experience' });
      suggestions.push({ name: 'University of Michigan', fit: 'match', reason: 'World-class research university with vibrant campus life', acceptance_rate: '26%', known_for: p.intended_major || 'Research' });
      suggestions.push({ name: 'Tulane University', fit: 'match', reason: 'Strong academics in a unique cultural setting', acceptance_rate: '13%', known_for: 'Culture & research' });
    }
    suggestions.push({ name: 'University of Florida', fit: 'safety', reason: 'Strong flagship state university with high acceptance rate', acceptance_rate: '57%', known_for: 'STEM programs' });
    suggestions.push({ name: 'Ohio State University', fit: 'safety', reason: 'Large research university with excellent resources', acceptance_rate: '52%', known_for: 'Research & sports' });

    return suggestions.slice(0, 12);
  }

  async function addToList(collegeName: string) {
    setAddingName(collegeName);
    try {
      // First search for the college by exact name
      const res = await fetch(`/api/colleges?q=${encodeURIComponent(collegeName)}&exact=true`);
      const data = await res.json();
      if (data.colleges?.[0]) {
        await fetch('/api/user-colleges', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collegeIds: [data.colleges[0].id] }),
        });
        setAddedNames(prev => new Set([...prev, collegeName]));
      }
    } finally {
      setAddingName(null);
    }
  }

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-navy border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <>
      <main className="min-h-screen bg-gray-50 pb-28">
        <div className="max-w-container mx-auto px-4 py-6">
          <div className="mb-6">
            <Link href="/more" className="text-sm text-gray-500 hover:text-navy font-medium mb-1 block">← More</Link>
            <h1 className="text-2xl font-extrabold text-navy">AI College Suggestions</h1>
            <p className="text-sm text-gray-500 mt-1">Personalized Reach / Match / Safety list based on your profile</p>
          </div>

          {/* No profile state */}
          {!hasProfile && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
              <div className="text-4xl mb-3">📊</div>
              <h2 className="text-lg font-bold text-navy mb-2">Set up your academic profile first</h2>
              <p className="text-sm text-gray-500 mb-4">Add your GPA and test scores so we can suggest the right schools for you.</p>
              <Link href="/profile" className="inline-flex items-center gap-2 bg-coral text-white font-semibold px-6 py-3 rounded-xl hover:bg-coral/90">
                Set up profile →
              </Link>
            </div>
          )}

          {/* Profile summary */}
          {hasProfile && !generated && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Your Profile</p>
              <div className="flex flex-wrap gap-3">
                {profile.gpa && <span className="text-sm bg-navy/5 text-navy font-semibold px-3 py-1.5 rounded-full">GPA {profile.gpa}</span>}
                {profile.best_sat && <span className="text-sm bg-navy/5 text-navy font-semibold px-3 py-1.5 rounded-full">SAT {profile.best_sat}</span>}
                {profile.best_act && <span className="text-sm bg-navy/5 text-navy font-semibold px-3 py-1.5 rounded-full">ACT {profile.best_act}</span>}
                {profile.intended_major && <span className="text-sm bg-navy/5 text-navy font-semibold px-3 py-1.5 rounded-full">{profile.intended_major}</span>}
                {profile.preferred_regions?.map(r => <span key={r} className="text-sm bg-navy/5 text-navy font-semibold px-3 py-1.5 rounded-full">{r}</span>)}
              </div>
              <Link href="/profile" className="text-xs text-blue-600 font-medium hover:underline mt-2 block">Edit profile →</Link>
            </div>
          )}

          {/* Generate button */}
          {hasProfile && !generated && (
            <button
              onClick={generate}
              disabled={loading}
              className="w-full py-4 bg-coral text-white font-bold text-base rounded-2xl hover:bg-coral/90 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Building your list...
                </>
              ) : '✨ Generate My College List'}
            </button>
          )}

          {/* Suggestions */}
          {generated && suggestions.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-500">{suggestions.length} colleges suggested</p>
                <button onClick={() => { setGenerated(false); setSuggestions([]); }} className="text-xs text-coral font-semibold hover:underline">Regenerate</button>
              </div>

              {(['reach', 'match', 'safety'] as const).map(fit => {
                const group = suggestions.filter(s => s.fit === fit);
                if (!group.length) return null;
                const cfg = FIT_CONFIG[fit];
                return (
                  <section key={fit} className="mb-5">
                    <h2 className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                      <span>{cfg.emoji}</span> {cfg.label} Schools
                    </h2>
                    <div className="space-y-3">
                      {group.map(college => {
                        const isAdded = addedNames.has(college.name);
                        return (
                          <div key={college.name} className="bg-white rounded-2xl border border-gray-200 p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <span className="font-bold text-navy">{college.name}</span>
                                  <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', cfg.color)}>{cfg.label}</span>
                                  {college.acceptance_rate && <span className="text-xs text-gray-400">{college.acceptance_rate} acceptance</span>}
                                </div>
                                <p className="text-sm text-gray-600">{college.reason}</p>
                                {college.known_for && <p className="text-xs text-gray-400 mt-1">Known for: {college.known_for}</p>}
                              </div>
                              <button
                                onClick={() => !isAdded && addToList(college.name)}
                                disabled={isAdded || addingName === college.name}
                                className={cn('flex-shrink-0 text-xs font-bold px-3 py-2 rounded-xl border transition-all', isAdded ? 'bg-green-50 text-green-700 border-green-200 cursor-default' : 'bg-coral text-white border-coral hover:bg-coral/90')}
                              >
                                {addingName === college.name ? '...' : isAdded ? '✓ Added' : '+ Add'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}

              <div className="flex gap-3 mt-4">
                <Link href="/dashboard" className="flex-1 text-center py-3 rounded-xl bg-navy text-white font-semibold text-sm hover:bg-navy/90">View Deadlines →</Link>
                <Link href="/explore" className="flex-1 text-center py-3 rounded-xl border-2 border-navy text-navy font-semibold text-sm hover:bg-gray-50">Explore More →</Link>
              </div>
            </>
          )}
        </div>
      </main>
      <MobileNav />
    </>
  );
}
