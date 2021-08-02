import Phaser from 'phaser'

import { SpriteType } from '../enums'

export class Oven extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'oven-1.png')
    this.type = SpriteType.OVEN
    this.entityID = entityID
    scene.add.existing(this)
    this.setDepth(1)

    this.anim = false
    this.animOvenKey = 'oven'
    const frames = [
      { key: 'assets', frame: 'oven-1.png' },
      { key: 'assets', frame: 'oven-2.png' },
      { key: 'assets', frame: 'oven-3.png' },
      { key: 'assets', frame: 'oven-4.png' },
      { key: 'assets', frame: 'oven-5.png' },
      { key: 'assets', frame: 'oven-2.png' },
      { key: 'assets', frame: 'oven-3.png' },
      { key: 'assets', frame: 'oven-4.png' },
      { key: 'assets', frame: 'oven-5.png' },
      { key: 'assets', frame: 'oven-2.png' },
      { key: 'assets', frame: 'oven-3.png' },
      { key: 'assets', frame: 'oven-4.png' },
      { key: 'assets', frame: 'oven-5.png' },
      { key: 'assets', frame: 'oven-6.png' },
      { key: 'assets', frame: 'oven-7.png' },
      { key: 'assets', frame: 'oven-8.png' },
      { key: 'assets', frame: 'oven-6.png' },
      { key: 'assets', frame: 'oven-7.png' },
      { key: 'assets', frame: 'oven-8.png' },
      { key: 'assets', frame: 'oven-9.png' },
      { key: 'assets', frame: 'oven-10.png' },
      { key: 'assets', frame: 'oven-11.png' },
      { key: 'assets', frame: 'oven-12.png' },
    ]
    scene.anims.create({ key: this.animOvenKey, frames: frames, frameRate: 5 })
  }

  setAnim(anim) {
    if (this.anim !== anim) {
      this.anim = anim
      if (this.anim) {
        this.play(this.animOvenKey)
      } else{
        this.anims.stop()
        this.setFrame(0)
      }
    }
  }
}
