const config = require('./config')


class PhaserGame extends Phaser.Game {
  constructor(server, geckos) {
    super(config)
    this.server = server
    this.geckos = geckos
  }
}

module.exports = PhaserGame
