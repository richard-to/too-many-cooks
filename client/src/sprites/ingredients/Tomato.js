import Phaser from 'phaser'

import { SpriteType } from '../../enums'

export class Tomato extends Phaser.GameObjects.Sprite {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, 'assets', 'tomato.png')
    this.type = SpriteType.TOMATO
    this.entityID = entityID
    scene.add.existing(this)
  }
}
