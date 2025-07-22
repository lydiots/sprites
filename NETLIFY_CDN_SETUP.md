# Netlify CDN Setup Guide for @lydiots/sprites

## 1. Create Sprites Assets Repository

```bash
# Create new repo for sprite assets
git init sprites-assets
cd sprites-assets

# Copy sprite files
cp -r ../sprites/dist/characters ./

# Create netlify.toml for optimal CDN settings
cat > netlify.toml << 'EOF'
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, HEAD, OPTIONS"
    Access-Control-Allow-Headers = "Content-Type"

[[headers]]
  for = "*.json"
  [headers.values]
    Content-Type = "application/json"
    Cache-Control = "public, max-age=86400"

[[headers]]
  for = "*.png"
  [headers.values]
    Content-Type = "image/png"
    Cache-Control = "public, max-age=31536000, immutable"

# Redirect root to GitHub repo
[[redirects]]
  from = "/"
  to = "https://github.com/lydiots/sprites"
  status = 302
EOF

# Add and commit
git add .
git commit -m "Initial sprite assets for CDN"

# Push to GitHub
git remote add origin https://github.com/lydiots/sprites-assets.git
git push -u origin main
```

## 2. Setup Netlify Site

1. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Click "New site from Git"
   - Choose GitHub → `sprites-assets` repo
   - Build settings: Leave empty (static files)
   - Deploy directory: `.` (root)

2. **Configure Custom Domain**:
   - Site settings → Domain management
   - Add custom domain: `cdn.lydiots.com`
   - Netlify will provide DNS instructions

## 3. DNS Configuration

Add CNAME record in your lydiots.com DNS:
```
CNAME cdn lydiots-sprites-assets.netlify.app
```

## 4. Update Package Configuration

```bash
# Update CDN base URL
CDN_BASE_URL=https://cdn.lydiots.com npm run generate:types

# Build and publish
npm run build
npm publish
```

## 5. Test URLs

Your sprite assets will be available at:
- `https://cdn.lydiots.com/characters/goblin-01/goblin-01-64x64-0.png`
- `https://cdn.lydiots.com/characters/goblin-01/goblin-01-64x64.json`

## Benefits

✅ **Professional branding**: cdn.lydiots.com
✅ **Global CDN**: Fast delivery worldwide  
✅ **Auto-deploy**: Push to repo → live on CDN
✅ **Optimized headers**: Perfect caching & CORS
✅ **HTTPS**: Automatic SSL certificate
✅ **Analytics**: Netlify provides usage stats
