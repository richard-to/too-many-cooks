import deepFreeze from 'deep-freeze-strict'

const SCALE = 0.5
const SCREEN_HEIGHT = 720
const SCREEN_WIDTH = 1280

export const Settings = deepFreeze({
  ENABLE_AUDIO: parseInt(process.env.ENABLE_AUDIO),
  ENABLE_VIDEO: parseInt(process.env.ENABLE_VIDEO),
  LEVEL_HEIGHT: 2550,
  LEVEL_WIDTH: 5600,
  PLAYER_WIDTH: 140,
  PLAYER_HEIGHT: 190,
  RADIX: 36,
  SCALE,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SERVER_PORT: parseInt(process.env.EXTERNAL_SERVER_PORT),
  TEAM1_NAME: 'Gwuart',
  TEAM1_COLOR: 0xdec136,
  TEAM2_NAME: 'Blorgk',
  TEAM2_COLOR: 0x14de86,
  TILE_HEIGHT: 30,
  TILE_WIDTH: 160,
  RIGHT_TOP_CORNER: {
    x: SCREEN_WIDTH / SCALE + (SCREEN_WIDTH - (SCREEN_WIDTH / SCALE )) / 2,
    y: (SCREEN_HEIGHT - (SCREEN_HEIGHT / SCALE )) / 2,
  },
  LEFT_TOP_CORNER: {
    x: (SCREEN_WIDTH - (SCREEN_WIDTH / SCALE )) / 2,
    y: (SCREEN_HEIGHT - (SCREEN_HEIGHT / SCALE )) / 2,
  },
  UI_FONT: 'arial',
})

export const SpriteType = deepFreeze({
  PLAYER_VIDEO: -1,
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
  OVEN: 23,
  COOKED_BEEF: 24,
})

export const OrderType = deepFreeze({
  [SpriteType.BURGER_BEEF]: {
    frame: 'burger-beef.png',
  },
  [SpriteType.BURGER_BEEF_TOMATO]: {
    frame: 'burger-beef-tomato.png',
  },
  [SpriteType.BURGER_BEEF_LETTUCE]: {
    frame: 'burger-beef-lettuce.png',
  },
  [SpriteType.BURGER_BEEF_TOMATO_LETTUCE]: {
    frame: 'burger-beef-tomato-lettuce.png',
  },
  [SpriteType.BURGER_TOMATO]: {
    frame: 'burger-tomato.png',
  },
  [SpriteType.BURGER_TOMATO_LETTUCE]: {
    frame: 'burger-tomato-lettuce.png',
  },
  [SpriteType.BURGER_LETTUCE]: {
    frame: 'burger-lettuce.png',
  },
})
