# Where SEO findings are fixed

Each group of search-auditor checks, and where a site usually produces it. Look for the framework's own way first; hand-written tags are the fallback.

| Group | What it checks | Next.js (App Router) | Other frameworks and static sites |
|---|---|---|---|
| **IDX** Indexing | status codes, soft 404, robots.txt that answers and does not block pages, CSS or JS, one site version, one-step redirects, noindex, server speed | `app/robots.ts`, `app/not-found.tsx` (must answer 404), `redirects()` in `next.config`, `metadata.robots` | `public/robots.txt`, the 404 page and the host's redirect rules (`_redirects`, `vercel.json`, nginx) |
| **SEC** HTTPS | https and a permanent redirect to it, certificate, HSTS, nothing loaded over http, own addresses on https, security headers | `headers()` in `next.config` (HSTS, `X-Content-Type-Options`, `frame-ancestors` in CSP); HTTPS itself is the host's | host or CDN settings, `_headers`, nginx |
| **CAN** Canonical | one absolute canonical per page in `<head>`, pointing straight at a page that answers 200; UTM addresses and language versions name the right page | `metadata.alternates.canonical` with `metadataBase` set in the root layout | `<link rel="canonical">` in the layout or the SEO component |
| **MAP** Sitemap | sitemap exists, is declared in robots.txt, is valid, lists only live canonical pages on this site, includes the pages the site links to, honest lastmod | `app/sitemap.ts` | the sitemap plugin (`@astrojs/sitemap`, `next-sitemap`, Hugo, Eleventy) or the generator script |
| **META** Meta tags | title and description: present, of the right length, unique, not a template default; charset, no nosnippet, favicon | `metadata` / `generateMetadata` per route, `title.template` in the root layout | the layout's `<head>` and each page's front matter |
| **STR** Page structure | doctype, `<html lang>` that matches the text, viewport and zoom, one non-empty H1 that agrees with the title, no skipped heading levels, `<main>` | the root layout (`<html lang>`, `viewport` export) and the page components | the layout and the templates |
| **LNK** Links | broken internal and external links, links through redirects, orphan pages, links a crawler cannot follow, nofollow on own pages, link text | links in components and content, navigation | content files and navigation |
| **IMG** Images | meaningful alt text, width and height, lazy loading below the first screen, images that open, weight under 500 KB, WebP or AVIF | `next/image` with `alt`, `width`/`height` or `fill`, `priority` only on the first screen | `<img>` attributes, the image pipeline (`astro:assets`, Sharp) |
| **DATA** Structured data | valid JSON-LD with `@context` and `@type`, properties rich results require, ISO dates and full addresses, breadcrumbs on nested pages, WebSite on the home page | a `<script type="application/ld+json">` in the page or layout component | the layout or an SEO component |
| **LANG** Language versions | valid hreflang codes, versions that list each other and themselves, x-default, full addresses that lead to working canonical pages, languages that match `<html lang>` | `metadata.alternates.languages`, `<html lang>` in the root layout per locale | the i18n plugin and the layout |

Notes:

- Repeated titles and descriptions (META) usually come from a layout default that pages never override: give each route its own.
- A canonical, hreflang or sitemap entry pointing at `http://localhost` or a preview host means `metadataBase` / `site` / `baseURL` is not set to the public origin.
- After changing robots.txt, sitemap or redirects, check the live behaviour on the host too: some hosts add their own rules.
