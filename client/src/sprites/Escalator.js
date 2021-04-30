import Phaser from 'phaser'

import { SpriteType } from '../enums'

export class Escalator extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'platform')
    this.type = SpriteType.ESCALATOR
    this.entityID = entityID
    scene.add.existing(this)
  }
}
