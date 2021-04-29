import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class BurgerTomatoLettuce extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-tomato-lettuce.png')
    this.type = SpriteType.BURGER_TOMATO_LETTUCE
    this.entityID = entityID
    scene.add.existing(this)
  }
}
