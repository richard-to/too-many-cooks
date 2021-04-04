import Phaser from 'phaser'


const TYPE_TOMATO = '2'


export default class Tomato extends Phaser.GameObjects.Sprite {
  constructor(scene, channelId, x, y) {
    super(scene, x, y, 'assets', 'tomato.png')

    scene.add.existing(this)

    this.channelId = channelId

    this.type = TYPE_TOMATO
  }
}
