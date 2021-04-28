import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class BunBox extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'block-bread.png')
    this.type = SpriteType.BUN_BOX
    this.entityID = entityID
    scene.add.existing(this)
  }
}
