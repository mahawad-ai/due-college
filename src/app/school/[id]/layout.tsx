import { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase-server';

interface Props {
  params: { id: string };
  children: React.ReactNode;
}

interface CollegeMeta {
  name: string;
  city: string | null;
  state: string | null;
  acceptance_rate: number | null;
  sat_25: number | null;
  sat_75: number | null;
  act_25: number | null;
  act_75: number | null;
  website: string | null;
}

async function getCollege(id: string): Promise<CollegeMeta | null> {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase
    .from('colleges')
    .select('name, city, state, acceptance_rate, sat_25, sat_75, act_25, act_75, website')
    .eq('id', id)
    .maybeSingle();
  return data ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const college = await getCollege(params.id);

  if (!college) {
    return {
      title: 'College Not Found — due.college',
      description: 'This college is not in our database yet.',
    };
  }

  const acceptance = college.acceptance_rate != null ? `${college.acceptance_rate}% acceptance rate. ` : '';
  const sat = college.sat_25 && college.sat_75 ? `SAT ${college.sat_25}–${college.sat_75}. ` : '';
  const act = college.act_25 && college.act_75 ? `ACT ${college.act_25}–${college.act_75}. ` : '';

  const year = new Date().getFullYear();
  const title = `${college.name} Application Deadlines ${year} — due.college`;
  const description =
    `Track ${college.name} application deadlines for ${year} — ED, EA, RD, FAFSA, and more. ` +
    `${acceptance}${sat}${act}` +
    `Never miss a deadline with due.college. Free for every student.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://www.due.college/school/${params.id}`,
      siteName: 'due.college',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `https://www.due.college/school/${params.id}`,
    },
  };
}

export default async function SchoolLayout({ params, children }: Props) {
  const college = await getCollege(params.id);

  const jsonLd = college
    ? {
        '@context': 'https://schema.org',
        '@type': 'EducationalOrganization',
        name: college.name,
        ...(college.city && college.state && {
          address: {
            '@type': 'PostalAddress',
            addressLocality: college.city,
            addressRegion: college.state,
            addressCountry: 'US',
          },
        }),
        ...(college.website && { url: college.website }),
        description: `Application deadlines and admissions information for ${college.name}.`,
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {children}
    </>
  );
}
