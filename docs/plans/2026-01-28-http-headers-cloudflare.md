# HTTP Headers Configuration: Cloudflare

## Overview

This document describes how to add security and caching HTTP headers to maybedont.ai using Cloudflare as a CDN in front of GitHub Pages.

**Why Cloudflare?**
- Free tier is sufficient for this use case
- No changes to hosting required (stays on GitHub Pages)
- Full control over HTTP headers via Transform Rules
- Additional benefits: DDoS protection, analytics, edge caching

## Prerequisites

- Cloudflare account (free tier works)
- Access to domain registrar for maybedont.ai
- Current DNS records documented before migration

## Setup Steps

### Step 1: Add Site to Cloudflare

1. Log in to Cloudflare dashboard
2. Click "Add a Site"
3. Enter `maybedont.ai`
4. Select the Free plan
5. Cloudflare will scan existing DNS records

### Step 2: Update Nameservers

1. Cloudflare will provide two nameservers (e.g., `ada.ns.cloudflare.com`, `bob.ns.cloudflare.com`)
2. Go to your domain registrar
3. Replace existing nameservers with Cloudflare's nameservers
4. Wait for propagation (can take up to 24-48 hours, usually faster)

### Step 3: Verify DNS Records

Ensure these records exist in Cloudflare DNS:

| Type | Name | Content | Proxy Status |
|------|------|---------|--------------|
| CNAME | @ | `<username>.github.io` | Proxied (orange cloud) |
| CNAME | www | `maybedont.ai` | Proxied (orange cloud) |

**Important**: The orange cloud (Proxied) must be enabled for Cloudflare to add headers.

### Step 4: Configure SSL/TLS

1. Go to SSL/TLS → Overview
2. Set encryption mode to **Full** (not Full Strict, as GitHub Pages uses their own cert)
3. Go to SSL/TLS → Edge Certificates
4. Enable "Always Use HTTPS"

## Security Headers Configuration

### Using Transform Rules (Recommended)

Go to **Rules → Transform Rules → Modify Response Header**

Create a new rule:

**Rule name**: `Add Security Headers`

**When incoming requests match**: `All incoming requests`

**Then modify response headers**:

| Operation | Header Name | Value |
|-----------|-------------|-------|
| Set static | `X-Frame-Options` | `SAMEORIGIN` |
| Set static | `X-Content-Type-Options` | `nosniff` |
| Set static | `Referrer-Policy` | `strict-origin-when-cross-origin` |
| Set static | `Permissions-Policy` | `geolocation=(), microphone=(), camera=()` |
| Set static | `Content-Security-Policy` | See below |

### Content-Security-Policy Value

```
default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'self'
```

**Note**: This CSP is a starting point. Test thoroughly and adjust based on actual resource needs. The `'unsafe-inline'` for scripts/styles may be needed for Hugo/Hextra functionality.

## Caching Headers Configuration

### Using Cache Rules

Go to **Caching → Cache Rules**

Create rules for different asset types:

#### Rule 1: Static Assets (Long Cache)

**Rule name**: `Cache Static Assets`

**When incoming requests match**:
```
(http.request.uri.path.extension in {"js" "css" "png" "jpg" "jpeg" "gif" "ico" "svg" "woff" "woff2" "ttf" "eot"})
```

**Then**:
- Cache eligibility: Eligible for cache
- Edge TTL: Override origin, 1 month (2592000 seconds)
- Browser TTL: Override origin, 1 week (604800 seconds)

#### Rule 2: HTML Pages (Short Cache)

**Rule name**: `Cache HTML Pages`

**When incoming requests match**:
```
(http.request.uri.path.extension eq "html" or ends_with(http.request.uri.path, "/"))
```

**Then**:
- Cache eligibility: Eligible for cache
- Edge TTL: Override origin, 1 hour (3600 seconds)
- Browser TTL: Override origin, 10 minutes (600 seconds)

### Alternative: Page Rules (Legacy)

If Transform Rules aren't available on your plan, use Page Rules:

1. Go to Rules → Page Rules
2. Create rule for `*maybedont.ai/*`
3. Add setting: "Cache Level" → "Cache Everything"
4. Add setting: "Browser Cache TTL" → "1 week"
5. Add setting: "Edge Cache TTL" → "1 month"

## Verification

### Test Security Headers

After configuration, verify headers are set:

```bash
curl -I https://maybedont.ai
```

Or use:
- https://securityheaders.com/?q=maybedont.ai
- Browser DevTools → Network → select request → Headers

### Test Caching

Check response headers for:
- `CF-Cache-Status: HIT` (served from Cloudflare edge)
- `Cache-Control` header with expected max-age

### Expected Security Headers Grade

With all headers configured, expect an **A** or **A+** grade on securityheaders.com.

## Rollback Plan

If issues occur:
1. Set DNS records to "DNS only" (grey cloud) to bypass Cloudflare
2. Or revert nameservers to original registrar nameservers

## Maintenance

- Cloudflare free plan includes 10 Page Rules, 10 Transform Rules
- Monitor Cloudflare Analytics for traffic patterns
- Review CSP violations in browser console and adjust policy as needed

## Cost

- **Free tier**: Sufficient for all features described above
- No ongoing costs unless upgrading for additional features

## References

- [Cloudflare Transform Rules Documentation](https://developers.cloudflare.com/rules/transform/)
- [Cloudflare Cache Rules Documentation](https://developers.cloudflare.com/cache/how-to/cache-rules/)
- [Content-Security-Policy Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
