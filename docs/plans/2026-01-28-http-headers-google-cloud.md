# HTTP Headers Configuration: Google Cloud

## Overview

This document describes two approaches for adding security and caching HTTP headers using Google Cloud:

1. **Firebase Hosting** - Simpler setup, good for static sites
2. **Cloud Storage + Cloud CDN** - More control, enterprise-grade

Both require migrating away from GitHub Pages.

---

## Option A: Firebase Hosting (Recommended for Simplicity)

Firebase Hosting is the simplest Google Cloud option for static sites with custom headers.

### Prerequisites

- Google Cloud / Firebase account
- Node.js installed (for Firebase CLI)
- Hugo build output ready

### Setup Steps

#### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

#### Step 2: Initialize Firebase Project

```bash
cd /path/to/maybedont-site
firebase init hosting
```

Select:
- Create a new project or use existing
- Public directory: `public` (Hugo's output directory)
- Single-page app: No
- Automatic builds with GitHub: Optional

#### Step 3: Configure Headers in firebase.json

Edit `firebase.json`:

```json
{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**",
        "headers": [
          {
            "key": "X-Frame-Options",
            "value": "SAMEORIGIN"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          },
          {
            "key": "Permissions-Policy",
            "value": "geolocation=(), microphone=(), camera=()"
          },
          {
            "key": "Content-Security-Policy",
            "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'self'"
          }
        ]
      },
      {
        "source": "**/*.@(js|css|woff2|woff|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=2592000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(png|jpg|jpeg|gif|svg|ico|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=2592000"
          }
        ]
      },
      {
        "source": "**/*.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=600"
          }
        ]
      }
    ],
    "cleanUrls": true,
    "trailingSlash": false
  }
}
```

#### Step 4: Connect Custom Domain

```bash
firebase hosting:channel:deploy preview  # Test first
firebase deploy                          # Deploy to production
```

Then in Firebase Console:
1. Go to Hosting → Add custom domain
2. Enter `maybedont.ai`
3. Follow DNS verification steps
4. Add provided DNS records to your registrar

#### Step 5: Deployment Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

# Build Hugo
hugo --minify

# Deploy to Firebase
firebase deploy --only hosting

echo "Deployment complete!"
```

### GitHub Actions Workflow

Create `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true

      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build
        run: hugo --minify

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-firebase-project-id
```

### Firebase Hosting Cost

- **Free tier**: 10 GB storage, 360 MB/day transfer
- **Beyond free**: $0.026/GB storage, $0.15/GB transfer
- For most static sites: **Free**

---

## Option B: Cloud Storage + Cloud CDN (Enterprise)

More complex but offers finer control and better suited for high-traffic sites.

### Prerequisites

- Google Cloud account with billing enabled
- `gcloud` CLI installed and configured
- Domain verified in Google Cloud

### Setup Steps

#### Step 1: Create Cloud Storage Bucket

```bash
# Create bucket
gsutil mb -l us-central1 gs://maybedont-ai-website

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://maybedont-ai-website

# Configure as website
gsutil web set -m index.html -e 404.html gs://maybedont-ai-website
```

#### Step 2: Upload Content

```bash
# Build Hugo
hugo --minify

# Upload with cache headers for static assets
gsutil -m rsync -r -d public/ gs://maybedont-ai-website/

# Set cache headers for different file types
gsutil -m setmeta -h "Cache-Control:public, max-age=2592000" \
  "gs://maybedont-ai-website/**.css" \
  "gs://maybedont-ai-website/**.js" \
  "gs://maybedont-ai-website/**.woff2"

gsutil -m setmeta -h "Cache-Control:public, max-age=600" \
  "gs://maybedont-ai-website/**.html"
```

#### Step 3: Reserve Static IP

```bash
gcloud compute addresses create maybedont-ip \
  --ip-version=IPV4 \
  --global
```

Note the IP address for DNS configuration.

#### Step 4: Create SSL Certificate

```bash
gcloud compute ssl-certificates create maybedont-cert \
  --domains=maybedont.ai,www.maybedont.ai \
  --global
```

#### Step 5: Create Backend Bucket

```bash
gcloud compute backend-buckets create maybedont-backend \
  --gcs-bucket-name=maybedont-ai-website \
  --enable-cdn \
  --cache-mode=CACHE_ALL_STATIC
```

#### Step 6: Create URL Map

```bash
gcloud compute url-maps create maybedont-url-map \
  --default-backend-bucket=maybedont-backend
```

#### Step 7: Create HTTPS Proxy

```bash
gcloud compute target-https-proxies create maybedont-https-proxy \
  --url-map=maybedont-url-map \
  --ssl-certificates=maybedont-cert
```

#### Step 8: Create Forwarding Rule

```bash
gcloud compute forwarding-rules create maybedont-https-rule \
  --address=maybedont-ip \
  --global \
  --target-https-proxy=maybedont-https-proxy \
  --ports=443
```

#### Step 9: Add Security Headers with Cloud Armor

Create security policy:

```bash
gcloud compute security-policies create maybedont-security-policy \
  --description="Security policy with headers"
```

Unfortunately, Cloud Armor's header manipulation is limited. For full security headers, you need **Cloud Functions** or **Cloud Run** as a reverse proxy, or use **Cloudflare in front of Cloud CDN**.

##### Alternative: Use Cloud Functions for Headers

Create a Cloud Function that adds headers:

```javascript
// index.js
const fetch = require('node-fetch');

exports.addSecurityHeaders = async (req, res) => {
  const bucketUrl = 'https://storage.googleapis.com/maybedont-ai-website';
  let path = req.path || '/index.html';
  if (path.endsWith('/')) path += 'index.html';

  try {
    const response = await fetch(`${bucketUrl}${path}`);
    const body = await response.text();

    // Set security headers
    res.set('X-Frame-Options', 'SAMEORIGIN');
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    res.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'self'");
    res.set('Content-Type', response.headers.get('content-type'));

    res.status(response.status).send(body);
  } catch (error) {
    res.status(500).send('Error fetching content');
  }
};
```

Deploy:

```bash
gcloud functions deploy addSecurityHeaders \
  --runtime nodejs18 \
  --trigger-http \
  --allow-unauthenticated
```

Then point Cloud CDN to the Cloud Function instead of the bucket directly.

### Cloud CDN Cost Estimate

| Service | Monthly Cost (10K requests) |
|---------|----------------------------|
| Cloud Storage | ~$0.02 |
| Cloud CDN | ~$0.08 |
| Load Balancer | ~$18.00 (minimum) |
| Cloud Functions (if used) | ~$0.00 (free tier) |
| **Total** | **~$18-20/month** |

**Note**: The load balancer minimum cost makes this option expensive for low-traffic sites. Firebase Hosting is more cost-effective.

---

## Comparison Summary

| Feature | Firebase Hosting | Cloud Storage + CDN |
|---------|-----------------|---------------------|
| Setup complexity | Simple | Complex |
| Security headers | Native support | Requires Cloud Functions |
| Caching headers | Native support | Native support |
| Cost (low traffic) | Free | ~$18/month |
| Cost (high traffic) | Pay per GB | More predictable |
| Custom domain | Easy | Moderate |
| SSL | Automatic | Manual setup |

## Recommendation

**For maybedont.ai, use Firebase Hosting.** It provides:
- Simple configuration via `firebase.json`
- Full security header support
- Free tier likely sufficient
- Easy CI/CD integration
- No load balancer costs

---

## Verification

After deployment, test headers:

```bash
curl -I https://maybedont.ai
```

Or use https://securityheaders.com/?q=maybedont.ai

Expected grade: **A** or **A+**

## References

- [Firebase Hosting Headers](https://firebase.google.com/docs/hosting/full-config#headers)
- [Cloud CDN Documentation](https://cloud.google.com/cdn/docs)
- [Cloud Storage Static Hosting](https://cloud.google.com/storage/docs/hosting-static-website)
