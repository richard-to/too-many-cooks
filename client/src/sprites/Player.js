import { isNil } from 'lodash'
import Phaser from 'phaser'

import { SpriteType } from '../enums'
import { PlayerVideo } from './video/Player'

export class Player extends Phaser.GameObjects.Container {
  constructor(scene, entityID, x, y) {
    super(scene, x, y)
    this.type = SpriteType.PLAYER
    this.entityID = entityID
    scene.add.existing(this)

    const shell = scene.add.sprite(0, 0, 'assets', 'container.png')
    shell.active = false
    this.add(shell)

    this.magnet = scene.add.sprite(0, 0, 'assets', 'magnet.png')
    this.magnet.y = (shell.height / -2) + (this.magnet.height / -2)
    this.magnet.active = false
    this.magnet.visible = false
    this.add(this.magnet)

    this.rocket = scene.add.sprite(0, 0, 'assets', 'rocket.png')
    this.rocket.y = (shell.height / 2) + (this.rocket.height / 2)
    this.rocket.active = false
    this.rocket.visible = false
    this.add(this.rocket)

    this.video = new PlayerVideo(scene, entityID, 1, 1)
    this.add(this.video)
  }

  /**
   * Set the player's video stream
   *
   * @param {MediaStream} stream
   */
  setStream(stream) {
    this.video.setStream(stream)
    return this
  }

  /**
   * Checks if the player has a video stream set or not
   */
  hasStream() {
    return !isNil(this.video.video)
  }

  setFlip(flip) {
    this.video.setFlip(flip)
    return this
  }

  setAngle(angle) {
    this.video.setAngle(angle)
    return this
  }

  setHasItem(hasItem) {
    this.magnet.visible = hasItem
    return this
  }

  setIsJumping(isJumping) {
    this.rocket.visible = isJumping
    return this
  }
}
