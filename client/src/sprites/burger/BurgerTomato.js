import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class BurgerTomato extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'burger-tomato.png')
    this.type = SpriteType.BURGER_TOMATO
    this.entityID = entityID
    scene.add.existing(this)
  }
}
