# HTTP Headers Configuration: AWS CloudFront

## Overview

This document describes how to add security and caching HTTP headers to maybedont.ai using AWS CloudFront as a CDN, with the site hosted on S3.

**Why AWS CloudFront?**
- Tight integration with S3 for static hosting
- Full control over HTTP headers via Response Headers Policies
- Global edge network with excellent performance
- Pay-as-you-go pricing (very low cost for static sites)

**Note**: This approach requires migrating away from GitHub Pages to S3 + CloudFront.

## Prerequisites

- AWS account
- AWS CLI installed and configured
- Access to domain registrar for maybedont.ai DNS
- Hugo build output ready for deployment

## Architecture

```
[Users] → [CloudFront] → [S3 Bucket]
              ↓
      [Response Headers Policy]
      [Cache Policy]
```

## Setup Steps

### Step 1: Create S3 Bucket

```bash
# Create bucket (must be globally unique)
aws s3 mb s3://maybedont-ai-website --region us-east-1

# Disable block public access for static website hosting
aws s3api put-public-access-block \
  --bucket maybedont-ai-website \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"
```

### Step 2: Configure S3 for Static Website Hosting

```bash
# Enable static website hosting
aws s3 website s3://maybedont-ai-website \
  --index-document index.html \
  --error-document 404.html
```

Create bucket policy (`bucket-policy.json`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::maybedont-ai-website/*"
    }
  ]
}
```

Apply policy:

```bash
aws s3api put-bucket-policy \
  --bucket maybedont-ai-website \
  --policy file://bucket-policy.json
```

### Step 3: Request ACM Certificate

CloudFront requires an ACM certificate in **us-east-1** region:

```bash
aws acm request-certificate \
  --domain-name maybedont.ai \
  --subject-alternative-names "*.maybedont.ai" \
  --validation-method DNS \
  --region us-east-1
```

Complete DNS validation as instructed by ACM.

### Step 4: Create Response Headers Policy

Create the policy JSON (`response-headers-policy.json`):

```json
{
  "Name": "maybedont-security-headers",
  "Comment": "Security headers for maybedont.ai",
  "SecurityHeadersConfig": {
    "XSSProtection": {
      "Override": true,
      "Protection": true,
      "ModeBlock": true
    },
    "FrameOptions": {
      "Override": true,
      "FrameOption": "SAMEORIGIN"
    },
    "ContentTypeOptions": {
      "Override": true
    },
    "ReferrerPolicy": {
      "Override": true,
      "ReferrerPolicy": "strict-origin-when-cross-origin"
    },
    "ContentSecurityPolicy": {
      "Override": true,
      "ContentSecurityPolicy": "default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: https://www.google-analytics.com; connect-src 'self' https://www.google-analytics.com; frame-ancestors 'self'"
    }
  },
  "CustomHeadersConfig": {
    "Items": [
      {
        "Header": "Permissions-Policy",
        "Value": "geolocation=(), microphone=(), camera=()",
        "Override": true
      }
    ]
  }
}
```

Create the policy:

```bash
aws cloudfront create-response-headers-policy \
  --response-headers-policy-config file://response-headers-policy.json
```

Note the returned policy ID for use in CloudFront distribution.

### Step 5: Create Cache Policy

Create cache policy JSON (`cache-policy.json`):

```json
{
  "Name": "maybedont-cache-policy",
  "Comment": "Cache policy for static site",
  "DefaultTTL": 86400,
  "MaxTTL": 2592000,
  "MinTTL": 0,
  "ParametersInCacheKeyAndForwardedToOrigin": {
    "EnableAcceptEncodingGzip": true,
    "EnableAcceptEncodingBrotli": true,
    "HeadersConfig": {
      "HeaderBehavior": "none"
    },
    "CookiesConfig": {
      "CookieBehavior": "none"
    },
    "QueryStringsConfig": {
      "QueryStringBehavior": "none"
    }
  }
}
```

```bash
aws cloudfront create-cache-policy \
  --cache-policy-config file://cache-policy.json
```

### Step 6: Create CloudFront Distribution

Create distribution config (`cloudfront-distribution.json`):

```json
{
  "CallerReference": "maybedont-ai-2026-01-28",
  "Comment": "maybedont.ai website",
  "Enabled": true,
  "Aliases": {
    "Quantity": 2,
    "Items": ["maybedont.ai", "www.maybedont.ai"]
  },
  "DefaultRootObject": "index.html",
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3-maybedont-ai",
        "DomainName": "maybedont-ai-website.s3-website-us-east-1.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only",
          "OriginSslProtocols": {
            "Quantity": 1,
            "Items": ["TLSv1.2"]
          }
        }
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-maybedont-ai",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 2,
      "Items": ["GET", "HEAD"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "CachePolicyId": "<YOUR-CACHE-POLICY-ID>",
    "ResponseHeadersPolicyId": "<YOUR-RESPONSE-HEADERS-POLICY-ID>",
    "Compress": true
  },
  "ViewerCertificate": {
    "ACMCertificateArn": "<YOUR-ACM-CERTIFICATE-ARN>",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  },
  "CustomErrorResponses": {
    "Quantity": 1,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/404.html",
        "ResponseCode": "404",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "HttpVersion": "http2and3",
  "PriceClass": "PriceClass_100"
}
```

Replace placeholders and create:

```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront-distribution.json
```

### Step 7: Update DNS

After CloudFront distribution is deployed (status: Deployed), update DNS:

| Type | Name | Value |
|------|------|-------|
| CNAME | @ | `d1234567890.cloudfront.net` (your distribution domain) |
| CNAME | www | `maybedont.ai` |

Or use Route 53 with alias records for apex domain support.

## Deployment Workflow

### Build and Deploy Script

Create `deploy.sh`:

```bash
#!/bin/bash
set -e

# Build Hugo site
hugo --minify

# Sync to S3
aws s3 sync public/ s3://maybedont-ai-website \
  --delete \
  --cache-control "max-age=86400"

# Set longer cache for static assets
aws s3 cp s3://maybedont-ai-website/ s3://maybedont-ai-website/ \
  --recursive \
  --exclude "*" \
  --include "*.css" \
  --include "*.js" \
  --include "*.woff2" \
  --include "*.png" \
  --include "*.jpg" \
  --include "*.svg" \
  --cache-control "max-age=2592000" \
  --metadata-directive REPLACE

# Invalidate CloudFront cache for HTML
aws cloudfront create-invalidation \
  --distribution-id <YOUR-DISTRIBUTION-ID> \
  --paths "/*.html" "/index.html" "/"

echo "Deployment complete!"
```

### GitHub Actions Workflow (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

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

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: aws s3 sync public/ s3://maybedont-ai-website --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

## Verification

### Test Security Headers

```bash
curl -I https://maybedont.ai
```

Expected headers:
- `x-frame-options: SAMEORIGIN`
- `x-content-type-options: nosniff`
- `referrer-policy: strict-origin-when-cross-origin`
- `content-security-policy: ...`
- `permissions-policy: geolocation=(), microphone=(), camera=()`

### Test Compression

```bash
curl -I -H "Accept-Encoding: gzip, br" https://maybedont.ai
```

Look for: `content-encoding: br` (Brotli) or `content-encoding: gzip`

### Test Caching

```bash
curl -I https://maybedont.ai/css/custom.css
```

Look for: `cache-control: max-age=2592000`

## Cost Estimate

For a low-traffic static site (~10,000 requests/month):

| Service | Monthly Cost |
|---------|--------------|
| S3 Storage | ~$0.02 |
| S3 Requests | ~$0.01 |
| CloudFront | ~$0.10 |
| Route 53 (optional) | $0.50 |
| **Total** | **~$0.63/month** |

## Rollback Plan

1. Update DNS to point back to GitHub Pages
2. Keep S3 bucket and CloudFront distribution for quick re-enable

## References

- [CloudFront Response Headers Policies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/adding-response-headers.html)
- [CloudFront Cache Policies](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/controlling-the-cache-key.html)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
