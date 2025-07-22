const fs = require("fs");
const path = require("path");

// Configuration
const CONFIG = {
  sourceDir: path.join(__dirname, "..", "raw"),
  outputDir: path.join(__dirname, "..", "dist"),
  atlasPattern: /-\d+x\d+-0\.png$/, // Matches files like goblin-01-32x32-0.png
};

/**
 * Recursively find all files in a directory
 * @param {string} dir - Directory to search
 * @param {Array} fileList - Array to collect files
 * @returns {Array} Array of file paths
 */
function getAllFiles(dir, fileList = []) {
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
 * Check if a file is an atlas file based on naming pattern
 * @param {string} filePath - Path to the file
 * @returns {boolean} True if file is an atlas file
 */
function isAtlasFile(filePath) {
  return CONFIG.atlasPattern.test(filePath);
}

/**
 * Get the corresponding JSON file path for a PNG atlas file
 * @param {string} pngPath - Path to the PNG file
 * @returns {string} Path to the corresponding JSON file
 */
function getJsonPath(pngPath) {
  return pngPath.replace(/-0\.png$/, ".json");
}

/**
 * Create directory if it doesn't exist
 * @param {string} dirPath - Directory path to create
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
}

/**
 * Copy file from source to destination
 * @param {string} src - Source file path
 * @param {string} dest - Destination file path
 */
function copyFile(src, dest) {
  try {
    fs.copyFileSync(src, dest);
    console.log(
      `Copied: ${path.relative(CONFIG.sourceDir, src)} -> ${path.relative(
        CONFIG.outputDir,
        dest
      )}`
    );
    return true;
  } catch (error) {
    console.error(`Error copying ${src} to ${dest}:`, error.message);
    return false;
  }
}

/**
 * Get the output path for a file, preserving directory structure
 * @param {string} filePath - Original file path
 * @returns {string} Output file path
 */
function getOutputPath(filePath) {
  const relativePath = path.relative(CONFIG.sourceDir, filePath);
  return path.join(CONFIG.outputDir, relativePath);
}

/**
 * Process atlas files and copy them with their JSON counterparts
 */
function processAtlasFiles() {
  console.log("🚀 Starting atlas build process...\n");

  // Ensure output directory exists
  ensureDir(CONFIG.outputDir);

  // Find all files in source directory
  console.log(`📂 Scanning directory: ${CONFIG.sourceDir}`);
  const allFiles = getAllFiles(CONFIG.sourceDir);

  // Filter atlas files
  const atlasFiles = allFiles.filter(isAtlasFile);
  console.log(`🎯 Found ${atlasFiles.length} atlas files\n`);

  let successCount = 0;
  let errorCount = 0;

  atlasFiles.forEach((atlasFile) => {
    const jsonFile = getJsonPath(atlasFile);

    // Check if JSON file exists
    if (!fs.existsSync(jsonFile)) {
      console.error(`❌ JSON file not found for atlas: ${atlasFile}`);
      console.error(`   Expected: ${jsonFile}\n`);
      errorCount++;
      return;
    }

    // Get output paths
    const atlasOutput = getOutputPath(atlasFile);
    const jsonOutput = getOutputPath(jsonFile);

    // Ensure output directories exist
    ensureDir(path.dirname(atlasOutput));
    ensureDir(path.dirname(jsonOutput));

    // Copy files
    const atlasCopied = copyFile(atlasFile, atlasOutput);
    const jsonCopied = copyFile(jsonFile, jsonOutput);

    if (atlasCopied && jsonCopied) {
      successCount++;
    } else {
      errorCount++;
    }

    console.log(""); // Add spacing between file pairs
  });

  // Summary
  console.log("📊 Build Summary:");
  console.log(`✅ Successfully processed: ${successCount} atlas pairs`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`📁 Output directory: ${CONFIG.outputDir}`);

  if (errorCount > 0) {
    process.exit(1);
  } else {
    console.log("\n🎉 Atlas build completed successfully!");
  }
}

// Run the script
if (require.main === module) {
  try {
    processAtlasFiles();
  } catch (error) {
    console.error("💥 Fatal error:", error.message);
    process.exit(1);
  }
}

module.exports = { processAtlasFiles, CONFIG };
