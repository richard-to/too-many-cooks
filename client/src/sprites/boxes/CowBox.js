import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class CowBox extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'block-beef.png')
    this.type = SpriteType.COW_BOX
    this.entityID = entityID
    scene.add.existing(this)
  }
}
