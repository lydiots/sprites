# @lydiots/sprites

A TypeScript-enabled sprite atlas library for Lydia's interactive games, providing character animations with full IDE autocomplete support.

## Features

- 🎮 **6 Game Characters**: Goblin, Golem (3 variants), Ogre, and Orc
- 📏 **Multiple Sizes**: 32x32, 64x64, and 128x128 pixel variants  
- 🎬 **17 Animations**: Walking, Running, Jumping, Combat moves, and more
- 📝 **Full TypeScript Support**: Complete type definitions with IDE autocomplete
- 🎯 **PixiJS Compatible**: JSON atlas format works directly with PixiJS
- 🔧 **Build Scripts**: Automated atlas copying and type generation

## Installation

```bash
npm install @lydiots/sprites
```

## Usage

### Basic Import with Full Type Safety

```typescript
import { 
  goblin01Atlas, 
  Goblin01Animation, 
  Characters,
  CharacterName, 
  SpriteSize, 
  AnimationName 
} from '@lydiots/sprites';

// Use the Characters object for excellent IDE autocomplete
const goblin = Characters.goblin01; // ✨ IDE shows all available characters!
const animation = goblin.sizes['32x32'].animations.Walking; // ✨ Full autocomplete chain!

// Or use individual character atlases
const animation: Goblin01Animation = 'Walking'; 
const size: SpriteSize = '32x32';

// Access atlas data with type safety
const atlasData = goblin01Atlas.sizes['32x32'];
console.log(`Atlas has ${atlasData.frameCount} frames`);
console.log(`Image: ${atlasData.imagePath}`);
```

### Characters Object - Best Developer Experience

The `Characters` object provides the best IDE autocomplete experience:

```typescript
import { Characters, getCharacter, characterNames } from '@lydiots/sprites';

// IDE will show: goblin01, golem01, golem02, golem03, ogre01, orc01
const character = Characters.goblin01;

// Access character data with full autocomplete
const characterName = character.name; // 'goblin-01'
const imagePath = character.sizes['64x64'].imagePath;
const animations = character.sizes['32x32'].animations; // Full autocomplete for all animations!

// Helper functions
const goblin = getCharacter('goblin01'); // Type-safe character access
const allCharacters = characterNames; // ['goblin01', 'golem01', ...]
```

### Available Characters

```typescript
// All character names with autocomplete
type Characters = 
  | 'goblin-01' 
  | 'golem-01' 
  | 'golem-02' 
  | 'golem-03' 
  | 'ogre-01' 
  | 'orc-01';
```

### Available Animations

All characters support these animations:
- `Dying`
- `FallingDown` 
- `Hurt`
- `Idle`
- `IdleBlinking`
- `JumpLoop`
- `JumpStart`
- `Kicking`
- `RunSlashing`
- `RunThrowing`
- `Running`
- `Slashing`
- `SlashinginTheAir`
- `Sliding`
- `Throwing`
- `ThrowinginTheAir`
- `Walking`

### PixiJS Integration Example

```typescript
import { goblin01Atlas } from '@lydiots/sprites';
import { Spritesheet, Texture } from 'pixi.js';

// Load the goblin atlas
const texture = Texture.from(goblin01Atlas.sizes['32x32'].imagePath);
const spritesheet = new Spritesheet(texture, atlasJsonData);

await spritesheet.parse();

// Now you have full autocomplete for animation names
const walkingTextures = spritesheet.animations['Walking'];
```

## Package Structure

```
dist/
├── characters/           # Sprite atlas PNG and JSON files
│   ├── goblin-01/
│   ├── golem-01/
│   ├── golem-02/
│   ├── golem-03/
│   ├── ogre-01/
│   └── orc-01/
├── index.js + .d.ts      # Main exports (types, SPRITE_ATLASES)
├── characters.js + .d.ts # Characters object with full autocomplete
└── [character].js + .d.ts # Individual character exports
```

### Import Options

```typescript
// Option 1: Import everything (recommended for most use cases)
import { Characters, CharacterName, AnimationName } from '@lydiots/sprites';

// Option 2: Import specific character types
import { goblin01Atlas, Goblin01Animation } from '@lydiots/sprites';

// Option 3: Import just the Characters object
import { Characters } from '@lydiots/sprites/characters';
```

## Development

### Build Scripts

```bash
npm run build:atlas     # Copy atlas files from raw/ to dist/
npm run generate:types  # Generate TypeScript definitions
npm run build          # Compile TypeScript
npm run prepublishOnly  # Full build pipeline
```

### Adding New Characters

1. Add sprite atlas files to `raw/characters/[character-name]/`
2. Follow naming pattern: `[character]-[size]-0.png` and `[character]-[size].json`
3. Run `npm run prepublishOnly` to rebuild everything

## File Format

Atlas JSON files follow the PixiJS/TexturePacker format:

```json
{
  "frames": {
    "Walking/0_Character_Walking_000.png": {
      "frame": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "rotated": false,
      "trimmed": true,
      "spriteSourceSize": { "x": 0, "y": 0, "w": 32, "h": 32 },
      "sourceSize": { "w": 32, "h": 32 }
    }
  },
  "meta": {
    "image": "character-32x32-0.png",
    "size": { "w": 500, "h": 286 },
    "scale": "1"
  }
}
```

## License

MIT License - see LICENSE.md for details.
