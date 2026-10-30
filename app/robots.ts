import type { MetadataRoute } from 'next';

/**
 * Standard Robots.txt generator (Next.js File-based Metadata API)
 * Prevents search engine indexing of private admin panels and API routes
 * while allowing public access to the dashboard.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/*', '/api/*', '/login'],
      },
    ],
  };
}
