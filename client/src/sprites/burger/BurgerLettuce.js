import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class BurgerLettuce extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-lettuce.png')
    this.type = SpriteType.BURGER_LETTUCE
    this.entityID = entityID
    scene.add.existing(this)
  }
}
