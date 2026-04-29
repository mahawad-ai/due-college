import { MetadataRoute } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const BASE = 'https://www.due.college';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE,                        lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${BASE}/start`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE}/colleges`,          lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${BASE}/login`,             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  // Fetch all colleges from the database
  try {
    const supabase = createServerSupabaseClient();
    const { data: colleges } = await supabase
      .from('colleges')
      .select('id, updated_at')
      .order('name', { ascending: true });

    const schoolPages: MetadataRoute.Sitemap = (colleges || []).map((college) => ({
      url: `${BASE}/school/${college.id}`,
      lastModified: college.updated_at ? new Date(college.updated_at) : new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }));

    return [...staticPages, ...schoolPages];
  } catch {
    // Fallback to static-only if DB is unavailable at build time
    return staticPages;
  }
}
