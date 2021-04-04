require('@geckos.io/phaser-on-nodejs')

const Phaser = require('phaser')

const GameScene = require('./scene')

const config = {
  type: Phaser.HEADLESS,
  parent: 'phaser-game',
  width: 1280,
  height: 720,
  banner: false,
  audio: false,
  scene: [GameScene],
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 },
      debug: false,
    }
  }
}
module.exports = config
