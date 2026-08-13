# TODO: HTTP Security Headers

GitHub Pages doesn't support custom HTTP headers. Production (verified 2026-08) is
missing Content-Security-Policy, X-Frame-Options, X-Content-Type-Options,
Referrer-Policy, and Permissions-Policy — SecurityHeaders.com grades this an F.

Recommended fix: front the site with Cloudflare (free tier, DNS-only change,
Transform Rules to inject headers). No hosting migration needed. Not yet done.
