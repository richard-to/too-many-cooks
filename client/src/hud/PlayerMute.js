import Phaser from 'phaser'

import { Settings } from '../enums'

class PlayerMute extends Phaser.GameObjects.Sprite {
  constructor(scene) {
    super(scene, -100, -100, 'assets', 'mute-icon.png')
    scene.add.existing(this)
    this.setScrollFactor(0)
    this.setDepth(2)
    this.setScale(0.6)
    const padding = 15
    const x = Settings.RIGHT_BOTTOM_CORNER.x - this.displayWidth / 2 - padding
    const y = Settings.RIGHT_BOTTOM_CORNER.y - this.displayHeight / 2 - padding
    this.setPosition(x, y)
    this.muted = false
  }

  setMuted(muted) {
    this.muted = muted
    if (this.muted) {
      this.setTexture('assets', 'muted-icon.png')
    } else {
      this.setTexture('assets', 'mute-icon.png')
    }
  }
}

export default PlayerMute
