# @lydiots/sprites CDN Assets

This repository contains the sprite assets for the [@lydiots/sprites](https://github.com/lydiots/sprites) npm package.

## CDN URLs

Base URL: `https://cdn.lydiots.com`

### Available Characters
- goblin-01
- golem-01, golem-02, golem-03  
- ogre-01
- orc-01

### Available Sizes
- 32x32, 64x64, 128x128

### URL Format
```
https://cdn.lydiots.com/characters/{character}/{character}-{size}-0.png
https://cdn.lydiots.com/characters/{character}/{character}-{size}.json
```

### Examples
```
https://cdn.lydiots.com/characters/goblin-01/goblin-01-64x64-0.png
https://cdn.lydiots.com/characters/goblin-01/goblin-01-64x64.json
```

## Usage with @lydiots/sprites

```typescript
import { Characters } from '@lydiots/sprites';

// TypeScript knows the exact CDN URLs!
const goblinSprite = Characters.goblin01.sizes['64x64'];
console.log(goblinSprite.imagePath); 
// → "https://cdn.lydiots.com/characters/goblin-01/goblin-01-64x64-0.png"
```

## Auto-deployed

This repository is automatically deployed to Netlify CDN. Any changes pushed to main will be live within minutes.
