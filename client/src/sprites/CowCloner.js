import Phaser from 'phaser'

import { SpriteType } from '../enums'

export class CowCloner extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'cow-cloner.png')
    this.type = SpriteType.COW_CLONER
    this.entityID = entityID
    scene.add.existing(this)
  }
}
