#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Configuration
const CDN_REPO_PATH = process.env.CDN_REPO_PATH || "../sprites-cdn";
const DIST_CHARACTERS = path.join(__dirname, "..", "dist", "characters");

function syncAssetsToCDN() {
  console.log("🚀 Syncing assets to CDN repository...\n");

  // Check if CDN repo exists
  if (!fs.existsSync(CDN_REPO_PATH)) {
    console.error(`❌ CDN repository not found at: ${CDN_REPO_PATH}`);
    console.log(
      "💡 Set CDN_REPO_PATH environment variable or clone the CDN repo:"
    );
    console.log(
      "   git clone https://github.com/lydiots/sprites-cdn ../sprites-cdn"
    );
    process.exit(1);
  }

  // Check if assets exist
  if (!fs.existsSync(DIST_CHARACTERS)) {
    console.error("❌ No built assets found. Run: npm run build:atlas");
    process.exit(1);
  }

  const charactersTarget = path.join(CDN_REPO_PATH, "characters");

  try {
    // Ensure characters directory exists in CDN repo
    if (!fs.existsSync(charactersTarget)) {
      fs.mkdirSync(charactersTarget, { recursive: true });
    }

    // Copy assets
    console.log("📁 Copying character assets...");
    execSync(`cp -r "${DIST_CHARACTERS}/"* "${charactersTarget}/"`, {
      stdio: "inherit",
    });

    // Generate manifest for CDN repo
    const manifestPath = path.join(CDN_REPO_PATH, "manifest.json");
    const manifest = {
      version: require("../package.json").version,
      updatedAt: new Date().toISOString(),
      baseUrl: "https://cdn.lydiots.com/assets",
      totalAssets: 0,
      characters: [],
    };

    // Count assets
    const characters = fs.readdirSync(charactersTarget);
    for (const character of characters) {
      const characterPath = path.join(charactersTarget, character);
      if (fs.statSync(characterPath).isDirectory()) {
        const files = fs.readdirSync(characterPath);
        manifest.characters.push({
          name: character,
          assets: files.length,
        });
        manifest.totalAssets += files.length;
      }
    }

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    console.log("✅ Assets synced successfully!");
    console.log(`📊 Total assets: ${manifest.totalAssets}`);
    console.log(
      `📁 Characters: ${manifest.characters.map((c) => c.name).join(", ")}`
    );
    console.log("");
    console.log("🔄 Next steps:");
    console.log(`   cd ${CDN_REPO_PATH}`);
    console.log("   git add .");
    console.log(`   git commit -m "Update assets v${manifest.version}"`);
    console.log("   git push");
  } catch (error) {
    console.error("❌ Error syncing assets:", error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  syncAssetsToCDN();
}

module.exports = { syncAssetsToCDN };
