const deepFreeze = require('deep-freeze-strict')

const PlayerPrefix = deepFreeze(['g', 'b'])

const Settings = deepFreeze({
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

const SpriteType = deepFreeze({
  PLAYER: '1',
  TOMATO: '2',
  LETTUCE: '3',
  COW: '4',
  BUN: '5',
})

const TileType = deepFreeze({
  COW_BOX: 1,
  BUN_BOX: 2,
  LETTUCE_BOX: 3,
  TOMATO_BOX: 4,
})

module.exports = {
  PlayerPrefix,
  Settings,
  SpriteType,
  TileType,
}
