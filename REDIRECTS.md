# Hugo Redirects Reference

Add `aliases` to the front matter of any page to create redirects from old URLs.

## Example

```yaml
---
title: Policy Configuration
weight: 3
aliases:
  - /old-policies/
  - /docs/old-policies/
  - /legacy/policy-config/
---
```

## Notes

- Aliases are relative to the site root
- Include the trailing slash for consistency
- Hugo generates an HTML file at each alias path with a meta refresh redirect
- Multiple aliases per page are supported
- Because this only produces meta-refresh pages, it likely won't cause a search index to update their index. 
  - We may want to consider adding CloudFlare, or publishing to some other service where we can properly manage 301 and 302 style redirects.   