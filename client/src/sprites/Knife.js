import Phaser from 'phaser'

import { SpriteType } from '../enums'

export class Knife extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'knife.png')
    this.type = SpriteType.KNIFE
    this.entityID = entityID
    // Make sure knife is always in front of player and ingredients
    this.setDepth(1)
    scene.add.existing(this)
  }
}
