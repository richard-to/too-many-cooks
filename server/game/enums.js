const deepFreeze = require('deep-freeze-strict')

const Settings = deepFreeze({
  ENABLE_AUDIO: false,
  ENABLE_VIDEO: true,
  LEVEL_HEIGHT: 2100,
  LEVEL_WIDTH: 3200,
  PLAYER_WIDTH: 150,
  PLAYER_HEIGHT: 200,
  RADIX: 36,
  SCALE: 0.5,
  SCREEN_HEIGHT: 720,
  SCREEN_WIDTH: 1280,
  SERVER_PORT: 1444,
  SHOW_ROCKET_VY: -200, // Show rocket when y velocity is > -200
  TILE_HEIGHT: 30,
  TILE_WIDTH: 160,
})

const SpriteType = deepFreeze({
  PLAYER: 1,
  TOMATO_BOX: 2,
  LETTUCE_BOX: 3,
  COW_BOX: 4,
  BUN_BOX: 5,
  TOMATO: 6,
  LETTUCE: 7,
  COW: 8,
  BUN: 9,
  BURGER_BEEF: 10,
  BURGER_BEEF_TOMATO: 11,
  BURGER_BEEF_LETTUCE: 12,
  BURGER_BEEF_TOMATO_LETTUCE: 13,
  BURGER_TOMATO: 14,
  BURGER_TOMATO_LETTUCE: 15,
  BURGER_LETTUCE: 16,
})

module.exports = {
  Settings,
  SpriteType,
}
