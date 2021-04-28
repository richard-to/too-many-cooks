import Phaser from 'phaser'

class Preload extends Phaser.Scene {
  constructor() {
    super('PreloadScene')
  }

  preload() {
    this.load.image('sky', '/assets/sky.png')
    this.load.image('platform', '/assets/platform.png')
    this.load.tilemapTiledJSON('map', '/assets/level-1.json')
    this.load.multiatlas('assets', '/assets/assets.json', 'assets')
  }
}

export default Preload
