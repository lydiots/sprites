#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Configuration for CDN deployment
const CDN_CONFIG = {
  // Recommended: Netlify with custom domain
  baseUrl: "https://cdn.lydiots.com",

  // Alternative options:
  // GitHub Pages: 'https://lydiots.github.io/sprites-assets',
  // Netlify auto: 'https://lydiots-sprites.netlify.app',
  // Cloudflare: 'https://sprites.lydiots.pages.dev',
};

async function updateTypeDefinitionsWithCDN() {
  console.log("🔄 Updating TypeScript definitions with CDN URLs...");

  console.log("💡 CDN Configuration:");
  console.log(`   Base URL: ${CDN_CONFIG.baseUrl}`);
  console.log(
    `   Example: ${CDN_CONFIG.baseUrl}/characters/goblin-01/goblin-01-64x64-0.png`
  );

  console.log("\n📝 To use CDN URLs:");
  console.log("   CDN_BASE_URL=https://your-cdn.com npm run generate:types");
  console.log("   # or");
  console.log("   USE_CDN=true npm run generate:types");
}

async function generateDeploymentManifest() {
  console.log("📋 Generating deployment manifest...");

  const distPath = path.join(__dirname, "..", "dist", "characters");
  const deploymentManifest = {
    version: require("../package.json").version,
    baseUrl: CDN_CONFIG.baseUrl,
    assets: [],
    totalSize: 0,
  };

  if (fs.existsSync(distPath)) {
    const characters = fs.readdirSync(distPath);

    for (const character of characters) {
      const characterPath = path.join(distPath, character);
      if (fs.statSync(characterPath).isDirectory()) {
        const files = fs.readdirSync(characterPath);

        for (const file of files) {
          const filePath = path.join(characterPath, file);
          const stats = fs.statSync(filePath);
          const relativePath = `characters/${character}/${file}`;

          deploymentManifest.assets.push({
            path: relativePath,
            url: `${CDN_CONFIG.baseUrl}/${relativePath}`,
            size: stats.size,
            type: path.extname(file).substring(1),
          });

          deploymentManifest.totalSize += stats.size;
        }
      }
    }
  }

  // Write manifest
  const manifestPath = path.join(__dirname, "..", "deployment-manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(deploymentManifest, null, 2));

  console.log(`✅ Deployment manifest created: ${manifestPath}`);
  console.log(`📊 Total assets: ${deploymentManifest.assets.length}`);
  console.log(
    `💾 Total size: ${(deploymentManifest.totalSize / 1024 / 1024).toFixed(
      2
    )} MB`
  );

  return deploymentManifest;
}

async function main() {
  console.log("🚀 Sprite Assets CDN Deployment Helper\n");

  try {
    await updateTypeDefinitionsWithCDN();
    await generateDeploymentManifest();

    console.log("\n🎯 CDN Deployment Options:");
    console.log("");
    console.log("1️⃣  GitHub Pages (Free):");
    console.log("   - Create separate repo: sprites-assets");
    console.log("   - Copy dist/characters/ to repo");
    console.log("   - Enable GitHub Pages");
    console.log("   - URL: https://lydiots.github.io/sprites-assets");
    console.log("");
    console.log("2️⃣  Netlify (Free):");
    console.log("   - Drag & drop dist/characters/ folder");
    console.log("   - Get custom URL");
    console.log("   - Automatic HTTPS & global CDN");
    console.log("");
    console.log("3️⃣  Cloudflare Pages (Free):");
    console.log("   - Connect GitHub repo");
    console.log("   - Automatic deployments");
    console.log("   - Global edge network");
    console.log("");
    console.log("4️⃣  AWS S3 + CloudFront:");
    console.log("   - Upload to S3 bucket");
    console.log("   - Configure CloudFront distribution");
    console.log("   - Custom domain support");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { CDN_CONFIG, generateDeploymentManifest };
