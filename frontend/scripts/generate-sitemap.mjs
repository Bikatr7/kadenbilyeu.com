import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const API_ENDPOINT = process.env.SITEMAP_API || 'https://api.kadenbilyeu.com/all-blogs';
const OUTPUT_PATH = path.join(process.cwd(), 'public', 'sitemap.xml');

const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
    .replace(/^-+|-+$/g, '');
};

(async () => {
  try {
    let posts = [];

    // Try to fetch blog posts, but don't fail if API is unavailable
    try {
      const res = await fetch(API_ENDPOINT);
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          posts = await res.json();
        } else {
          console.warn('API returned non-JSON response, skipping blog posts in sitemap');
        }
      } else {
        console.warn(`API returned status ${res.status}, skipping blog posts in sitemap`);
      }
    } catch (apiError) {
      console.warn('Failed to fetch blog posts from API, generating sitemap with static pages only:', apiError.message);
    }

    const staticUrls = [
      { url: '/', priority: '1.0', changefreq: 'weekly' },
      { url: '/portfolio', priority: '0.9', changefreq: 'monthly' },
      { url: '/blog', priority: '0.8', changefreq: 'daily' },
      { url: '/blog/directory', priority: '0.7', changefreq: 'daily' },
    ];

    const domains = ['https://kadenbilyeu.com', 'https://bikatr7.com'];

    const urls = [
      ...staticUrls.flatMap((page) =>
        domains.map((d) => ({
          loc: `${d}${page.url}`,
          lastmod: new Date().toISOString().split('T')[0],
          changefreq: page.changefreq,
          priority: page.priority,
          alternate: domains.filter(alt => alt !== d).map(alt => `${alt}${page.url}`)
        }))
      ),
      ...posts.flatMap((post) =>
        domains.map((d) => ({
          loc: `${d}/blog/${createSlug(post.title)}`,
          lastmod: post.updated_at ? new Date(post.updated_at).toISOString().split('T')[0] :
                   new Date(post.created_at).toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: '0.6',
          alternate: domains.filter(alt => alt !== d).map(alt => `${alt}/blog/${createSlug(post.title)}`)
        }))
      ),
    ];

    const xmlEntries = urls.map((urlObj) => {
      const alternateLinks = urlObj.alternate.map(alt => 
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${alt}"/>`
      ).join('\n');
      
      return `  <url>
    <loc>${urlObj.loc}</loc>
    <lastmod>${urlObj.lastmod}</lastmod>
    <changefreq>${urlObj.changefreq}</changefreq>
    <priority>${urlObj.priority}</priority>
${alternateLinks}
  </url>`;
    }).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlEntries}
</urlset>`;

    fs.writeFileSync(OUTPUT_PATH, xml);
    console.log(`Enhanced sitemap generated with ${urls.length} URLs`);
  } catch (err) {
    console.error('Failed to generate sitemap', err);
    process.exit(1);
  }
})(); 