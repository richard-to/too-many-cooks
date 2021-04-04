import Phaser from 'phaser'


const TYPE_PLAYER = '1'


export default class Player extends Phaser.GameObjects.Sprite {
  constructor(scene, channelId, x, y, prefix) {
    super(scene, x, y, 'players', `${prefix}1.png`)

    scene.add.existing(this)

    this.channelId = channelId

    this.type = TYPE_PLAYER

    // Walking animation
    this.animWalkKey = `${prefix}-walk`
    const frames = [
      { key: 'players', frame: `${prefix}1.png` },
      { key: 'players', frame: `${prefix}2.png` },
      { key: 'players', frame: `${prefix}3.png` },
      { key: 'players', frame: `${prefix}4.png` },
      { key: 'players', frame: `${prefix}1.png` },
    ]
    scene.anims.create({ key: this.animWalkKey, frames: frames, frameRate: 12 })
  }
}
