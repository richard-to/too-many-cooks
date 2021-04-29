import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class Lettuce extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'lettuce.png')
    this.type = SpriteType.LETTUCE
    this.entityID = entityID
    scene.add.existing(this)
  }
}
