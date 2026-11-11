# Where AI search findings are fixed

Each group of checks, and where a site usually produces it. Use it to point at the source in the report; the skill itself never makes these changes. In each framework, look for its own way first; hand-written tags are the fallback.

| Group | What it checks | Where to fix |
|---|---|---|
| **BOT** Access | AI search bots and user agents allowed in robots.txt, training crawler policy, the same answer for AI agents as for a browser, no noindex/noai/nosnippet on public pages, Content-Signal, a declared feed, 404 for missing pages | robots.txt (`app/robots.ts` in Next.js, `public/robots.txt`), CDN and bot-protection rules (Cloudflare «Block AI bots», WAF), `metadata.robots` / meta robots, `<link rel="alternate" type="application/rss+xml">` in the layout |
| **TXT** Text without JavaScript | the text is in the server HTML, no invisible characters inside words, headings that do not glue words, `<main>`/`<article>`, no content in frames or canvas, readable encoding, text PDFs, tab panels in the HTML | render content on the server (SSR or static, not client-only fetches), `<main>` in the layout, tab and accordion components that render closed panels (`forceMount` in Radix), typography plugins that insert U+2060 or U+00AD into titles and feeds |
| **ENT** Entities | Person or Organization with a stable `@id`, articles pointing at it, complete Article markup, Open Graph cards, FAQPage, ProfilePage on the about or CV page, CollectionPage on listings, Organization logo and contacts, Product price and availability, markup that matches the page, one name per `@id`, `sameAs` pointing at real profiles, not at a network's home page | one JSON-LD component used by the layouts; `metadata.openGraph` in Next.js; the same `@id` (e.g. `https://example.com/#person`) everywhere |
| **LLM** llms.txt | the llmstxt.org format, working links that match the sitemap, one file per language, full text in llms-full.txt, Markdown versions of pages, robots.txt not closing the files, the newest articles listed, notes after links | generate `llms.txt` and `llms-full.txt` from the same list as the sitemap (a route handler such as `app/llms.txt/route.ts`, or a build script) so they never fall behind |
| **UPD** Freshness | sitemap lastmod equals the page's dateModified, the feed has dates and full text and the newest article, no stale years, plausible dates | take lastmod and dateModified from one source (the content's frontmatter or git date); the feed generator |
| **SAF** Content safety | no text addressed to AI in the page, llms.txt, comments, alt texts or markup; no hidden text blocks; the same page for bots; no Unicode tag characters or direction overrides | content files, templates, the CDN (cloaking rules), copy pasted from tools that insert invisible characters |

Notes:

- A Person or Organization without `@id` (ENT-1) is the most common error, and the fix unlocks ENT-2: give the entity one `@id` on the home or about page and point every article's `author` at it.
- If BOT-3 says an agent gets 403, 429 or a bot check, the fix is usually in the CDN or hosting settings, not in the code: tell the user where.
