import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class LettuceBox extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'block-lettuce.png')
    this.type = SpriteType.LETTUCE_BOX
    this.entityID = entityID
    scene.add.existing(this)
  }
}
