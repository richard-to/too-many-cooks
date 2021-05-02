require('@geckos.io/phaser-on-nodejs')

const Phaser = require('phaser')

const GameScene = require('./scene')
const Settings = require('./enums').Settings

const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-game',
  width: Settings.SCREEN_WIDTH,
  height: Settings.SCREEN_HEIGHT,
  banner: false,
  audio: false,
  scene: [GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false,
    }
  },
}
module.exports = config
