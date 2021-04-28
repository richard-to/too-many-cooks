import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class BurgerBeefLettuce extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-beef-lettuce.png')
    this.type = SpriteType.BURGER_BEEF_LETTUCE
    this.entityID = entityID
    scene.add.existing(this)
  }
}
