import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/settings', '/invite', '/api/'],
    },
    sitemap: 'https://due.college/sitemap.xml',
  };
}
