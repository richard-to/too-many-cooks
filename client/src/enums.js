import deepFreeze from 'deep-freeze-strict'

export const Settings = deepFreeze({
  LEVEL_HEIGHT: 1935,
  LEVEL_WIDTH: 2580,
  RADIX: 36,
  SCALE: 0.5,
  SCREEN_HEIGHT: 720,
  SCREEN_WIDTH: 1280,
  SERVER_PORT: 1444,
  TILE_HEIGHT: 129,
  TILE_WIDTH: 129,
})

export const PLAYER_PREFIXES = deepFreeze(['g', 'b'])

export const SpriteType = deepFreeze({
  PLAYER: '1',
  TOMATO: '2',
  LETTUCE: '3',
  COW: '4',
  BUN: '5',
})
