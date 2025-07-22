# @lydiots/sprites PixiJS Demo

This interactive demo showcases the amazing **TypeScript autocomplete experience** that `@lydiots/sprites` provides when working with PixiJS.

## 🚀 What This Demo Shows

### Perfect IDE Autocomplete
- **Character Selection**: Type `Characters.` and see all available characters with autocomplete
- **Size Selection**: Access `Characters.goblin01.sizes.` and get autocomplete for all available sizes
- **Animation Selection**: Navigate to `Characters.goblin01.sizes['32x32'].animations.` for perfect animation autocomplete
- **Type Safety**: Everything is fully typed - no more guessing sprite names or sizes!

### Developer Experience Features

1. **Intelligent Character Discovery**
   ```typescript
   Characters.goblin01    // ✨ IDE shows: goblin01, golem01, golem02, golem03, ogre01, orc01
   ```

2. **Size Autocomplete**
   ```typescript
   Characters.goblin01.sizes['32x32']  // ✨ IDE shows: '32x32', '64x64', '128x128'
   ```

3. **Animation Autocomplete**
   ```typescript
   Characters.goblin01.sizes['32x32'].animations.Walking  // ✨ IDE shows all 17 animations!
   ```

4. **Metadata Access**
   ```typescript
   const data = Characters.goblin01.sizes['32x32'];
   data.frameCount;   // number - fully typed!
   data.imagePath;    // string - fully typed!
   data.atlasSize;    // { w: number, h: number } - fully typed!
   ```

## 🎮 How to Use the Demo

1. **Select a Character**: Choose from the dropdown to see all available characters
2. **Pick a Size**: See the available sprite sizes (32x32, 64x64, 128x128)
3. **Choose Animation**: Browse through all 17 available animations
4. **Load Sprite**: Click to load and see the animated sprite (placeholder in demo)
5. **View Stats**: See frame count, atlas dimensions, and current frame

## 🔧 Running the Demo

```bash
# From the sprites root directory
npm run build        # Build the main package
cd demo             # Enter demo directory
npm install         # Install demo dependencies  
npm run dev         # Start the demo server
```

Then open `http://localhost:3000` in your browser.

## 💡 Code Highlights

The demo demonstrates real-world usage patterns:

```typescript
// Perfect autocomplete throughout the entire chain!
const character = Characters.goblin01;           // ✨ All characters
const size = character.sizes['32x32'];          // ✨ All sizes  
const animation = size.animations.Walking;      // ✨ All animations
const frameCount = size.frameCount;             // ✨ Typed metadata

// Type-safe iteration
const characterKeys = Object.keys(Characters) as CharacterKey[];
characterKeys.forEach(key => {
  const char = Characters[key];  // ✨ Perfect type inference!
  console.log(char.name);        // ✨ Fully typed!
});
```

## 🎯 Real-World Integration

In a real project, you'd use it like this:

```typescript
import { Characters, CharacterName } from '@lydiots/sprites';
import { Application, Assets, Spritesheet } from 'pixi.js';

// Load character sprite with perfect autocomplete
const goblinData = Characters.goblin01.sizes['64x64'];

// Load the actual sprite atlas (you'd serve these from your CDN)
const texture = await Assets.load(goblinData.imagePath);
const atlasData = await Assets.load(goblinData.imagePath.replace('.png', '.json'));

// Create spritesheet
const spritesheet = new Spritesheet(texture, atlasData);
await spritesheet.parse();

// Perfect autocomplete for animation names!
const walkingFrames = spritesheet.animations[goblinData.animations.Walking];
```

## 🎨 Why This is Amazing

1. **No More String Guessing**: Never wonder what animations are available
2. **Intellisense Everywhere**: IDE shows you exactly what's possible at each step  
3. **Type Safety**: Catch errors at compile time, not runtime
4. **Self-Documenting**: The types serve as documentation
5. **Refactoring Safe**: Rename animations and TypeScript will update all usages

This is the **future of game development** - where your tools guide you to success! 🚀
