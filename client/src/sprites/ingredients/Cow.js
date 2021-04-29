import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class Cow extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'beef.png')
    this.type = SpriteType.COW
    this.entityID = entityID
    scene.add.existing(this)
  }
}
