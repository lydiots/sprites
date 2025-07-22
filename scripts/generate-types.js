const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  distDir: path.join(__dirname, "..", "dist"),
  srcDir: path.join(__dirname, "..", "src"),
  atlasPattern: /-\d+x\d+-0\.png$/,
  jsonPattern: /-\d+x\d+\.json$/,
  // CDN Configuration - set CDN_BASE_URL environment variable to use CDN
  useCDN: process.env.CDN_BASE_URL || process.env.USE_CDN === "true",
  cdnBaseUrl:
    process.env.CDN_BASE_URL || "https://lydiots.github.io/sprites-assets",
};

/**
 * Recursively find all files in a directory
 * @param {string} dir - Directory to search
 * @param {Array} fileList - Array to collect files
 * @returns {Array} Array of file paths
 */
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    return fileList;
  }

  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });

  return fileList;
}

/**
 * Check if a file is a JSON atlas file
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if file is an atlas JSON file
 */
function isAtlasJsonFile(filePath) {
  return CONFIG.jsonPattern.test(filePath) && filePath.endsWith(".json");
}

/**
 * Parse atlas JSON and extract animation information
 * @param {string} jsonPath - Path to the JSON file
 * @returns {Object} Parsed atlas data
 */
function parseAtlasJson(jsonPath) {
  try {
    const jsonContent = fs.readFileSync(jsonPath, "utf8");
    const atlas = JSON.parse(jsonContent);

    if (!atlas.frames || !atlas.meta) {
      console.warn(`⚠️  Invalid atlas format: ${jsonPath}`);
      return null;
    }

    // Extract character name and size from filename
    const filename = path.basename(jsonPath, ".json");
    const match = filename.match(/^(.+)-(\d+x\d+)$/);

    if (!match) {
      console.warn(`⚠️  Could not parse filename: ${filename}`);
      return null;
    }

    const [, characterName, size] = match;

    // Extract animations from frame keys
    const animations = new Set();
    const frames = Object.keys(atlas.frames);

    frames.forEach((frameKey) => {
      // Extract animation name from paths like "Walking/0_Goblin_Walking_000.png"
      const animationMatch = frameKey.match(/^([^/]+)\//);
      if (animationMatch) {
        // Convert to camelCase and clean up
        const animationName = animationMatch[1]
          .replace(/\s+/g, "") // Remove spaces
          .replace(/([a-z])([A-Z])/g, "$1$2"); // Keep camelCase as is
        animations.add(animationName);
      }
    });

    // Generate the appropriate image path (local or CDN)
    let imagePath;
    if (CONFIG.useCDN) {
      imagePath = `${CONFIG.cdnBaseUrl}/characters/${characterName}/${atlas.meta.image}`;
      console.log(`🌐 Using CDN path: ${imagePath}`);
    } else {
      imagePath = atlas.meta.image;
      console.log(`📁 Using local path: ${imagePath}`);
    }

    return {
      characterName,
      size,
      animations: Array.from(animations).sort(),
      frameCount: frames.length,
      atlasSize: atlas.meta.size,
      imagePath,
    };
  } catch (error) {
    console.error(`❌ Error parsing ${jsonPath}:`, error.message);
    return null;
  }
}

/**
 * Generate TypeScript types for a character
 * @param {Object} characterData - Character data grouped by sizes
 * @returns {string} TypeScript type definitions
 */
function generateCharacterTypes(characterData) {
  const { name, sizes } = characterData;
  const pascalName = name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  const camelName = name.replace(/-(.)/g, (match, letter) =>
    letter.toUpperCase()
  );

  let typescript = `// ${pascalName} character sprite definitions\n`;
  typescript += `export interface ${pascalName}Atlas {\n`;
  typescript += `  name: '${name}';\n`;
  typescript += `  sizes: {\n`;

  Object.entries(sizes).forEach(([size, data]) => {
    typescript += `    '${size}': {\n`;
    typescript += `      imagePath: '${data.imagePath}';\n`;
    typescript += `      frameCount: ${data.frameCount};\n`;
    typescript += `      atlasSize: { w: ${data.atlasSize.w}, h: ${data.atlasSize.h} };\n`;
    typescript += `      animations: {\n`;

    data.animations.forEach((animation) => {
      typescript += `        ${animation}: '${animation}';\n`;
    });

    typescript += `      };\n`;
    typescript += `    };\n`;
  });

  typescript += `  };\n`;
  typescript += `}\n\n`;

  // Generate animation type unions
  const allAnimations = new Set();
  Object.values(sizes).forEach((size) => {
    size.animations.forEach((anim) => allAnimations.add(anim));
  });

  typescript += `export type ${pascalName}Animation = ${Array.from(
    allAnimations
  )
    .map((a) => `'${a}'`)
    .join(" | ")};\n`;
  typescript += `export type ${pascalName}Size = ${Object.keys(sizes)
    .map((s) => `'${s}'`)
    .join(" | ")};\n\n`;

  // Generate helper function
  typescript += `export const ${camelName}Atlas: ${pascalName}Atlas = {\n`;
  typescript += `  name: '${name}',\n`;
  typescript += `  sizes: {\n`;

  Object.entries(sizes).forEach(([size, data]) => {
    typescript += `    '${size}': {\n`;
    typescript += `      imagePath: '${data.imagePath}',\n`;
    typescript += `      frameCount: ${data.frameCount},\n`;
    typescript += `      atlasSize: { w: ${data.atlasSize.w}, h: ${data.atlasSize.h} },\n`;
    typescript += `      animations: {\n`;

    data.animations.forEach((animation) => {
      typescript += `        ${animation}: '${animation}',\n`;
    });

    typescript += `      },\n`;
    typescript += `    },\n`;
  });

  typescript += `  },\n`;
  typescript += `};\n\n`;

  return typescript;
}

/**
 * Generate main types file
 * @param {Array} allCharacters - Array of all character data
 * @returns {string} TypeScript type definitions
 */
function generateMainTypes(allCharacters) {
  let typescript = `// Auto-generated sprite atlas types\n`;
  typescript += `// Generated on ${new Date().toISOString()}\n\n`;

  // Import all character types
  allCharacters.forEach((char) => {
    typescript += `export * from './${char.name}';\n`;
  });

  // Export Characters object from separate file
  typescript += `export * from './characters';\n`;

  typescript += `\n// Union types for all characters\n`;

  // Generate union types
  const characterNames = allCharacters
    .map((char) => `'${char.name}'`)
    .join(" | ");
  typescript += `export type CharacterName = ${characterNames};\n`;

  const allSizes = new Set();
  const allAnimations = new Set();

  allCharacters.forEach((char) => {
    Object.keys(char.sizes).forEach((size) => allSizes.add(size));
    Object.values(char.sizes).forEach((sizeData) => {
      sizeData.animations.forEach((anim) => allAnimations.add(anim));
    });
  });

  typescript += `export type SpriteSize = ${Array.from(allSizes)
    .map((s) => `'${s}'`)
    .join(" | ")};\n`;
  typescript += `export type AnimationName = ${Array.from(allAnimations)
    .map((a) => `'${a}'`)
    .join(" | ")};\n\n`;

  // Generate character atlas map
  typescript += `// Character atlas map for runtime access\n`;
  typescript += `export const SPRITE_ATLASES = {\n`;
  allCharacters.forEach((char) => {
    const camelName = char.name.replace(/-(.)/g, (match, letter) =>
      letter.toUpperCase()
    );
    typescript += `  '${char.name}': () => import('./${char.name}').then(m => m.${camelName}Atlas),\n`;
  });
  typescript += `} as const;\n\n`;

  // Generate helper types
  typescript += `// Helper types for better TypeScript experience\n`;
  typescript += `export interface SpriteAtlasReference {\n`;
  typescript += `  character: CharacterName;\n`;
  typescript += `  size: SpriteSize;\n`;
  typescript += `  animation: AnimationName;\n`;
  typescript += `}\n\n`;

  typescript += `export interface SpriteMetadata {\n`;
  typescript += `  imagePath: string;\n`;
  typescript += `  frameCount: number;\n`;
  typescript += `  atlasSize: { w: number; h: number };\n`;
  typescript += `}\n`;

  return typescript;
}

/**
 * Generate Characters object in a separate file
 * @param {Array} allCharacters - Array of all character data
 * @returns {string} TypeScript character definitions
 */
function generateCharactersFile(allCharacters) {
  let typescript = `// Auto-generated Characters object for easy sprite access\n`;
  typescript += `// Generated on ${new Date().toISOString()}\n\n`;

  // Import individual character atlases
  allCharacters.forEach((char) => {
    const camelName = char.name.replace(/-(.)/g, (match, letter) =>
      letter.toUpperCase()
    );
    typescript += `import type { ${char.name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("")}Atlas } from './${char.name}';\n`;
  });

  typescript += `\n// Characters object for easy access with IDE autocomplete\n`;
  typescript += `export const Characters = {\n`;
  allCharacters.forEach((char) => {
    const camelName = char.name.replace(/-(.)/g, (match, letter) =>
      letter.toUpperCase()
    );
    const pascalName = char.name
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join("");

    typescript += `  ${camelName}: {\n`;
    typescript += `    name: '${char.name}' as const,\n`;
    typescript += `    atlas: () => import('./${char.name}').then(m => m.${camelName}Atlas),\n`;
    typescript += `    sizes: {\n`;

    Object.entries(char.sizes).forEach(([size, data]) => {
      typescript += `      '${size}': {\n`;
      typescript += `        imagePath: '${data.imagePath}',\n`;
      typescript += `        frameCount: ${data.frameCount},\n`;
      typescript += `        atlasSize: { w: ${data.atlasSize.w}, h: ${data.atlasSize.h} },\n`;
      typescript += `        animations: {\n`;

      data.animations.forEach((animation) => {
        typescript += `          ${animation}: '${animation}' as const,\n`;
      });

      typescript += `        },\n`;
      typescript += `      },\n`;
    });

    typescript += `    },\n`;
    typescript += `  },\n`;
  });
  typescript += `} as const;\n\n`;

  // Generate Characters type for even better autocomplete
  typescript += `// Type-safe Characters with autocomplete\n`;
  typescript += `export type CharactersType = typeof Characters;\n`;
  typescript += `export type CharacterKey = keyof typeof Characters;\n\n`;

  // Generate helper function for getting character by name
  typescript += `// Helper function to get character data by name\n`;
  typescript += `export function getCharacter<T extends CharacterKey>(name: T): (typeof Characters)[T] {\n`;
  typescript += `  return Characters[name];\n`;
  typescript += `}\n\n`;

  // Generate helper function for getting all character names
  typescript += `// Get all available character names\n`;
  typescript += `export const characterNames = Object.keys(Characters) as CharacterKey[];\n`;

  return typescript;
}

/**
 * Main function to generate all TypeScript types
 */
function generateTypes() {
  console.log("🎨 Generating TypeScript types for sprite atlases...\n");

  // Find all JSON atlas files
  const allFiles = getAllFiles(CONFIG.distDir);
  const jsonFiles = allFiles.filter(isAtlasJsonFile);

  if (jsonFiles.length === 0) {
    console.error(
      '❌ No atlas JSON files found in dist directory. Run "npm run build:atlas" first.'
    );
    process.exit(1);
  }

  console.log(`📂 Found ${jsonFiles.length} atlas JSON files`);

  // Parse all atlas files and group by character
  const characterMap = new Map();
  let processedCount = 0;

  jsonFiles.forEach((jsonFile) => {
    const atlasData = parseAtlasJson(jsonFile);
    if (!atlasData) return;

    const { characterName, size, ...data } = atlasData;

    if (!characterMap.has(characterName)) {
      characterMap.set(characterName, { name: characterName, sizes: {} });
    }

    characterMap.get(characterName).sizes[size] = data;
    processedCount++;

    console.log(
      `✅ Processed: ${characterName} (${size}) - ${data.animations.length} animations`
    );
  });

  if (processedCount === 0) {
    console.error("❌ No valid atlas files could be processed.");
    process.exit(1);
  }

  console.log(`\n📝 Generating types for ${characterMap.size} characters...\n`);

  // Ensure src directory exists
  if (!fs.existsSync(CONFIG.srcDir)) {
    fs.mkdirSync(CONFIG.srcDir, { recursive: true });
    console.log(`Created directory: ${CONFIG.srcDir}`);
  }

  const allCharacters = Array.from(characterMap.values());

  // Generate individual character type files
  allCharacters.forEach((character) => {
    const typescript = generateCharacterTypes(character);
    const filename = `${character.name}.ts`;
    const filePath = path.join(CONFIG.srcDir, filename);

    fs.writeFileSync(filePath, typescript, "utf8");
    console.log(`📄 Generated: ${filename}`);
  });

  // Generate main types file
  const mainTypes = generateMainTypes(allCharacters);
  const mainTypesPath = path.join(CONFIG.srcDir, "index.ts");
  fs.writeFileSync(mainTypesPath, mainTypes, "utf8");
  console.log(`📄 Generated: index.ts`);

  // Generate characters file
  const charactersTypes = generateCharactersFile(allCharacters);
  const charactersPath = path.join(CONFIG.srcDir, "characters.ts");
  fs.writeFileSync(charactersPath, charactersTypes, "utf8");
  console.log(`📄 Generated: characters.ts`);

  // Generate summary
  console.log("\n📊 Generation Summary:");
  console.log(`✅ Characters: ${allCharacters.length}`);
  console.log(
    `✅ Total sizes: ${allCharacters.reduce(
      (sum, char) => sum + Object.keys(char.sizes).length,
      0
    )}`
  );
  console.log(`✅ Type files created: ${allCharacters.length + 2}`);
  console.log(`📁 Output directory: ${CONFIG.srcDir}`);
  console.log("\n🎉 TypeScript types generated successfully!");
  console.log(
    "\nNow you can import and use your sprites with full IDE autocomplete:"
  );
  console.log(
    `  import { goblinAtlas, GoblinAnimation } from '@lydiots/sprites';`
  );
  console.log(
    `  const animation: GoblinAnimation = 'Walking'; // Full autocomplete!`
  );
}

// Run the script
if (require.main === module) {
  try {
    generateTypes();
  } catch (error) {
    console.error("💥 Fatal error:", error.message);
    process.exit(1);
  }
}

module.exports = { generateTypes, CONFIG };
