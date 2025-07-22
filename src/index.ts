// Auto-generated sprite atlas types
// Generated on 2025-07-22T16:57:33.183Z

export * from './goblin-01';
export * from './golem-01';
export * from './golem-02';
export * from './golem-03';
export * from './ogre-01';
export * from './orc-01';

// Union types for all characters
export type CharacterName = 'goblin-01' | 'golem-01' | 'golem-02' | 'golem-03' | 'ogre-01' | 'orc-01';
export type SpriteSize = '128x128' | '32x32' | '64x64';
export type AnimationName = 'Dying' | 'FallingDown' | 'Hurt' | 'Idle' | 'IdleBlinking' | 'JumpLoop' | 'JumpStart' | 'Kicking' | 'RunSlashing' | 'RunThrowing' | 'Running' | 'Slashing' | 'SlashinginTheAir' | 'Sliding' | 'Throwing' | 'ThrowinginTheAir' | 'Walking';

// Character atlas map for runtime access
export const SPRITE_ATLASES = {
  'goblin-01': () => import('./goblin-01').then(m => m.goblin01Atlas),
  'golem-01': () => import('./golem-01').then(m => m.golem01Atlas),
  'golem-02': () => import('./golem-02').then(m => m.golem02Atlas),
  'golem-03': () => import('./golem-03').then(m => m.golem03Atlas),
  'ogre-01': () => import('./ogre-01').then(m => m.ogre01Atlas),
  'orc-01': () => import('./orc-01').then(m => m.orc01Atlas),
} as const;

// Helper types for better TypeScript experience
export interface SpriteAtlasReference {
  character: CharacterName;
  size: SpriteSize;
  animation: AnimationName;
}

export interface SpriteMetadata {
  imagePath: string;
  frameCount: number;
  atlasSize: { w: number; h: number };
}
