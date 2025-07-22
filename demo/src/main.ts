// Demo showcasing @lydiots/sprites with PixiJS
import {
  Application,
  Assets,
  Spritesheet,
  AnimatedSprite,
  Texture,
} from "pixi.js";

// 🎯 Import with PERFECT TypeScript autocomplete!
import {
  Characters,
  CharacterKey,
  CharactersType,
  SpriteSize,
  AnimationName,
  getCharacter,
} from "../../dist/index.js"; // This would be '@lydiots/sprites' in a real project

interface SpriteData {
  characterKey: CharacterKey;
  size: SpriteSize;
  animation: AnimationName;
  frameCount: number;
  atlasSize: { w: number; h: number };
  imagePath: string;
}

class SpritesDemo {
  private app!: Application;
  private currentSprite?: AnimatedSprite;
  private currentData?: SpriteData;

  async init() {
    // Initialize PixiJS
    this.app = new Application();
    await this.app.init({
      width: 800,
      height: 400,
      backgroundColor: 0x1a1a1a,
    });

    const container = document.getElementById("pixi-container");
    if (container) {
      container.appendChild(this.app.canvas);
    }

    this.setupUI();
    this.populateCharacterSelect();
  }

  private setupUI() {
    const characterSelect = document.getElementById(
      "character-select"
    ) as HTMLSelectElement;
    const sizeSelect = document.getElementById(
      "size-select"
    ) as HTMLSelectElement;
    const animationSelect = document.getElementById(
      "animation-select"
    ) as HTMLSelectElement;
    const loadButton = document.getElementById(
      "load-sprite"
    ) as HTMLButtonElement;

    characterSelect.addEventListener("change", () => this.onCharacterChange());
    sizeSelect.addEventListener("change", () => this.onSizeChange());
    animationSelect.addEventListener("change", () => this.onAnimationChange());
    loadButton.addEventListener("click", () => this.loadSprite());
  }

  private populateCharacterSelect() {
    const select = document.getElementById(
      "character-select"
    ) as HTMLSelectElement;

    // 🎯 Look at this beautiful autocomplete! Characters object shows all available characters
    const characterKeys = Object.keys(Characters) as CharacterKey[];

    characterKeys.forEach((key) => {
      const option = document.createElement("option");
      option.value = key;
      // 🎯 Perfect type safety - Characters[key].name is fully typed!
      option.textContent = `${Characters[key].name} (${key})`;
      select.appendChild(option);
    });
  }

  private onCharacterChange() {
    const characterSelect = document.getElementById(
      "character-select"
    ) as HTMLSelectElement;
    const sizeSelect = document.getElementById(
      "size-select"
    ) as HTMLSelectElement;
    const animationSelect = document.getElementById(
      "animation-select"
    ) as HTMLSelectElement;

    // Clear dependent selects
    sizeSelect.innerHTML = '<option value="">Select size...</option>';
    animationSelect.innerHTML = '<option value="">Select animation...</option>';
    sizeSelect.disabled = true;
    animationSelect.disabled = true;

    if (!characterSelect.value) return;

    const characterKey = characterSelect.value as CharacterKey;

    // 🎯 Amazing autocomplete! IDE knows exactly what sizes are available
    const character = Characters[characterKey];
    const availableSizes = Object.keys(character.sizes) as SpriteSize[];

    availableSizes.forEach((size) => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      sizeSelect.appendChild(option);
    });

    sizeSelect.disabled = false;
  }

  private onSizeChange() {
    const characterSelect = document.getElementById(
      "character-select"
    ) as HTMLSelectElement;
    const sizeSelect = document.getElementById(
      "size-select"
    ) as HTMLSelectElement;
    const animationSelect = document.getElementById(
      "animation-select"
    ) as HTMLSelectElement;

    animationSelect.innerHTML = '<option value="">Select animation...</option>';
    animationSelect.disabled = true;

    if (!characterSelect.value || !sizeSelect.value) return;

    const characterKey = characterSelect.value as CharacterKey;
    const size = sizeSelect.value as SpriteSize;

    // 🎯 INCREDIBLE autocomplete chain!
    // Characters[characterKey].sizes[size].animations gives perfect autocomplete
    const character = Characters[characterKey];
    const sizeData = character.sizes[size];
    const animations = Object.keys(sizeData.animations) as AnimationName[];

    animations.forEach((animation) => {
      const option = document.createElement("option");
      option.value = animation;
      option.textContent = animation;
      animationSelect.appendChild(option);
    });

    // Update stats display
    this.updateStats(sizeData.frameCount, sizeData.atlasSize);
    animationSelect.disabled = false;
  }

  private onAnimationChange() {
    const loadButton = document.getElementById(
      "load-sprite"
    ) as HTMLButtonElement;
    const animationSelect = document.getElementById(
      "animation-select"
    ) as HTMLSelectElement;

    loadButton.disabled = !animationSelect.value;
  }

  private updateStats(frameCount: number, atlasSize: { w: number; h: number }) {
    const frameCountEl = document.getElementById("frame-count");
    const atlasSizeEl = document.getElementById("atlas-size");

    if (frameCountEl) frameCountEl.textContent = frameCount.toString();
    if (atlasSizeEl) atlasSizeEl.textContent = `${atlasSize.w}x${atlasSize.h}`;
  }

  private async loadSprite() {
    const characterSelect = document.getElementById(
      "character-select"
    ) as HTMLSelectElement;
    const sizeSelect = document.getElementById(
      "size-select"
    ) as HTMLSelectElement;
    const animationSelect = document.getElementById(
      "animation-select"
    ) as HTMLSelectElement;

    if (!characterSelect.value || !sizeSelect.value || !animationSelect.value)
      return;

    const characterKey = characterSelect.value as CharacterKey;
    const size = sizeSelect.value as SpriteSize;
    const animation = animationSelect.value as AnimationName;

    // 🎯 Perfect type safety throughout the entire chain!
    const character = Characters[characterKey];
    const sizeData = character.sizes[size];

    this.currentData = {
      characterKey,
      size,
      animation,
      frameCount: sizeData.frameCount,
      atlasSize: sizeData.atlasSize,
      imagePath: sizeData.imagePath,
    };

    try {
      // In a real app, you'd load from your CDN or asset server
      // For demo purposes, we'll create a simple placeholder
      await this.createDemoSprite();
    } catch (error) {
      console.error("Error loading sprite:", error);
      this.createPlaceholderSprite();
    }
  }

  private async createDemoSprite() {
    // Remove existing sprite
    if (this.currentSprite) {
      this.app.stage.removeChild(this.currentSprite);
    }

    // Create a simple animated sprite for demo purposes
    // In a real application, you'd load the actual atlas files
    const placeholder = this.createAnimatedPlaceholder();

    this.currentSprite = placeholder;
    this.app.stage.addChild(this.currentSprite);

    // Center the sprite
    this.currentSprite.x = this.app.screen.width / 2;
    this.currentSprite.y = this.app.screen.height / 2;
    this.currentSprite.anchor.set(0.5);

    // Start animation
    this.currentSprite.play();

    console.log("🎉 Sprite loaded with perfect TypeScript autocomplete!");
    console.log("Character:", this.currentData?.characterKey);
    console.log("Size:", this.currentData?.size);
    console.log("Animation:", this.currentData?.animation);
    console.log("Frame Count:", this.currentData?.frameCount);
    console.log("Atlas Size:", this.currentData?.atlasSize);
  }

  private createAnimatedPlaceholder(): AnimatedSprite {
    // Create a simple animated placeholder since we don't have the actual sprite files in the demo
    const frameCount = this.currentData?.frameCount || 10;
    const textures: Texture[] = [];

    // Create simple colored rectangles as placeholder frames
    for (let i = 0; i < Math.min(frameCount, 10); i++) {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;

      // Create a simple animated effect
      const hue = (i * 36) % 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`;
      ctx.fillRect(0, 0, 64, 64);

      // Add character indicator
      ctx.fillStyle = "white";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(
        this.currentData?.characterKey.substring(0, 3) || "CHR",
        32,
        25
      );
      ctx.fillText(
        this.currentData?.animation.substring(0, 4) || "ANIM",
        32,
        40
      );
      ctx.fillText(`${i + 1}`, 32, 55);

      textures.push(Texture.from(canvas));
    }

    const animatedSprite = new AnimatedSprite(textures);
    animatedSprite.animationSpeed = 0.1;
    animatedSprite.loop = true;

    return animatedSprite;
  }

  private createPlaceholderSprite() {
    // Fallback placeholder
    if (this.currentSprite) {
      this.app.stage.removeChild(this.currentSprite);
    }

    const placeholder = this.createAnimatedPlaceholder();
    this.currentSprite = placeholder;
    this.app.stage.addChild(this.currentSprite);

    this.currentSprite.x = this.app.screen.width / 2;
    this.currentSprite.y = this.app.screen.height / 2;
    this.currentSprite.anchor.set(0.5);
    this.currentSprite.play();
  }
}

// Initialize the demo
const demo = new SpritesDemo();
demo.init().catch(console.error);

// Export for debugging
(window as any).demo = demo;
(window as any).Characters = Characters;
