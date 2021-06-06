const deepFreeze = require('deep-freeze-strict')

const Settings = deepFreeze({
  ENABLE_AUDIO: parseInt(process.env.ENABLE_AUDIO),
  ENABLE_VIDEO: parseInt(process.env.ENABLE_VIDEO),
  LEVEL_HEIGHT: 2550,
  LEVEL_WIDTH: 5600,
  PLAYER_WIDTH: 150,
  PLAYER_HEIGHT: 200,
  RADIX: 36,
  SCALE: 0.5,
  SCREEN_HEIGHT: 720,
  SCREEN_WIDTH: 1280,
  SERVER_PORT: parseInt(process.env.INTERNAL_SERVER_PORT),
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
  ESCALATOR: 17,
  KNIFE: 18,
  CHOPPED_TOMATO: 19,
  CHOPPED_LETTUCE: 20,
  COW_CLONER: 21,
  FACE: 22,
})

BurgerPoints = {
  EASY: 5,
  MEDIUM: 7,
  HARD: 12,
}

module.exports = {
  BurgerPoints,
  Settings,
  SpriteType,
}
