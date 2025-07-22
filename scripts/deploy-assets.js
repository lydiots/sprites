#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Configuration for CDN deployment
const CDN_CONFIG = {
  // Recommended: Netlify with custom domain
  baseUrl: "https://cdn.lydiots.com/assets",

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
  console.log("🚀 Sprite Assets CDN Information\n");
  console.log("ℹ️  CDN is now handled by a separate repository");
  console.log("📍 CDN Repository: https://github.com/lydiots/sprites-cdn");
  console.log("🌐 CDN URL: https://cdn.lydiots.com");
  console.log("");

  try {
    await updateTypeDefinitionsWithCDN();
    await generateDeploymentManifest();

    console.log("\n📋 CDN Deployment Workflow:");
    console.log("");
    console.log("1️⃣  Update sprites in this repo:");
    console.log("   npm run build:atlas");
    console.log("   npm run generate:types:cdn");
    console.log("");
    console.log("2️⃣  Copy assets to CDN repo:");
    console.log("   cp -r dist/characters/* ../sprites-cdn/characters/");
    console.log("");
    console.log("3️⃣  Deploy CDN repo:");
    console.log(
      "   cd ../sprites-cdn && git add . && git commit -m 'Update assets' && git push"
    );
    console.log("");
    console.log("4️⃣  Publish npm package:");
    console.log("   npm publish");
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { CDN_CONFIG, generateDeploymentManifest };
