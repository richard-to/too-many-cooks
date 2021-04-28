import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class Bun extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'bun.png')
    this.type = SpriteType.BUN
    this.entityID = entityID
    scene.add.existing(this)
  }
}
