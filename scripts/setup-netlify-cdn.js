#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

async function createNetlifyAssets() {
  console.log("🚀 Setting up Netlify CDN for @lydiots/sprites\n");

  const assetsDir = path.join(__dirname, "..", "netlify-assets");
  const sourceDir = path.join(__dirname, "..", "dist", "characters");

  // Create assets directory
  if (fs.existsSync(assetsDir)) {
    fs.rmSync(assetsDir, { recursive: true });
  }
  fs.mkdirSync(assetsDir, { recursive: true });

  // Copy characters folder
  if (fs.existsSync(sourceDir)) {
    console.log("📁 Copying sprite assets...");
    fs.cpSync(sourceDir, path.join(assetsDir, "characters"), {
      recursive: true,
    });
  } else {
    console.log("❌ No sprite assets found. Run: npm run build:atlas first");
    return;
  }

  // Create netlify.toml
  const netlifyConfig = `[build]
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

# Redirect root to main sprites repo
[[redirects]]
  from = "/"
  to = "https://github.com/lydiots/sprites"
  status = 302

# Health check endpoint
[[redirects]]
  from = "/health"
  to = "/characters/goblin-01/goblin-01-32x32.json"
  status = 200
`;

  fs.writeFileSync(path.join(assetsDir, "netlify.toml"), netlifyConfig);

  // Create README
  const readme = `# @lydiots/sprites CDN Assets

This repository contains the sprite assets for the [@lydiots/sprites](https://github.com/lydiots/sprites) npm package.

## CDN URLs

Base URL: \`https://cdn.lydiots.com\`

### Available Characters
- goblin-01
- golem-01, golem-02, golem-03  
- ogre-01
- orc-01

### Available Sizes
- 32x32, 64x64, 128x128

### URL Format
\`\`\`
https://cdn.lydiots.com/characters/{character}/{character}-{size}-0.png
https://cdn.lydiots.com/characters/{character}/{character}-{size}.json
\`\`\`

### Examples
\`\`\`
https://cdn.lydiots.com/characters/goblin-01/goblin-01-64x64-0.png
https://cdn.lydiots.com/characters/goblin-01/goblin-01-64x64.json
\`\`\`

## Usage with @lydiots/sprites

\`\`\`typescript
import { Characters } from '@lydiots/sprites';

// TypeScript knows the exact CDN URLs!
const goblinSprite = Characters.goblin01.sizes['64x64'];
console.log(goblinSprite.imagePath); 
// → "https://cdn.lydiots.com/characters/goblin-01/goblin-01-64x64-0.png"
\`\`\`

## Auto-deployed

This repository is automatically deployed to Netlify CDN. Any changes pushed to main will be live within minutes.
`;

  fs.writeFileSync(path.join(assetsDir, "README.md"), readme);

  // Create .gitignore
  const gitignore = `# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/

# Logs
*.log
`;

  fs.writeFileSync(path.join(assetsDir, ".gitignore"), gitignore);

  console.log("✅ Netlify assets created in:", assetsDir);
  console.log("\n📋 Next steps:");
  console.log("1. Create new GitHub repo: sprites-assets");
  console.log("2. cd netlify-assets && git init");
  console.log('3. git add . && git commit -m "Initial CDN assets"');
  console.log(
    "4. git remote add origin https://github.com/lydiots/sprites-assets.git"
  );
  console.log("5. git push -u origin main");
  console.log("6. Connect repo to Netlify");
  console.log("7. Add custom domain: cdn.lydiots.com");
  console.log(
    "8. Test: https://cdn.lydiots.com/characters/goblin-01/goblin-01-32x32-0.png"
  );

  // Show file summary
  const files = getAllFiles(assetsDir);
  const totalSize = files.reduce((sum, file) => {
    return sum + fs.statSync(file).size;
  }, 0);

  console.log(`\n📊 Asset Summary:`);
  console.log(`   Files: ${files.length}`);
  console.log(`   Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

function getAllFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

if (require.main === module) {
  createNetlifyAssets().catch(console.error);
}
