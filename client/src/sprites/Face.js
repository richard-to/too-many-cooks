import Phaser from 'phaser'

import { SpriteType } from '../enums'

export class Face extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y, team) {
    super(scene, x, y, 'assets', `face${team}-1.png`)
    this.type = SpriteType.FACE
    this.entityID = entityID
    scene.add.existing(this)

    // Define face animation
    this.animFaceKey = `face${team}`
    const frames = [
      { key: 'assets', frame: `face${team}-1.png` },
      { key: 'assets', frame: `face${team}-2.png` },
      { key: 'assets', frame: `face${team}-3.png` },
      { key: 'assets', frame: `face${team}-2.png` },
    ]
    scene.anims.create({ key: this.animFaceKey, frames: frames, frameRate: 7, repeat: -1 })
    this.play(this.animFaceKey)
  }
}
