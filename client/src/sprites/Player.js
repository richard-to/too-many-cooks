import { isNil } from 'lodash'
import Phaser from 'phaser'

import { SpriteType } from '../enums'
import { PlayerVideo } from './video/Player'

export class Player extends Phaser.GameObjects.Container {
  constructor(scene, entityID, team, x, y) {
    super(scene, x, y)
    this.type = SpriteType.PLAYER
    this.entityID = entityID
    scene.add.existing(this)

    this.team = team

    this.muted = false

    this.shell = scene.add.sprite(0, 0, 'assets', `container${team}.png`)
    this.shell.active = false
    this.add(this.shell)

    this.magnet = scene.add.sprite(0, 0, 'assets', 'magnet.png')
    this.magnet.y = (this.shell.displayHeight / -2) + (this.magnet.displayHeight / -2)
    this.magnet.active = false
    this.magnet.visible = false
    this.add(this.magnet)

    this.rocket = scene.add.sprite(0, 0, 'assets', `rocket${team}.png`)
    this.rocket.y = (this.shell.displayHeight / 2) + (this.rocket.displayHeight / 2)
    this.rocket.active = false
    this.rocket.visible = false
    this.add(this.rocket)

    this.video = new PlayerVideo(scene, entityID, 1, 1)
    this.add(this.video)

    const padding = 15
    this.mutedIcon = scene.add.sprite(0, 0, 'assets', 'xs-muted-icon.png')
    this.mutedIcon.y = (this.shell.displayHeight / 2) - (this.mutedIcon.displayHeight / 2) - padding
    this.mutedIcon.x = (this.shell.displayWidth / 2) - (this.mutedIcon.displayWidth / 2) - padding
    this.mutedIcon.active = false
    this.mutedIcon.visible = false
    this.add(this.mutedIcon)
  }

  /**
   * Set the player's video/audio streams
   *
   * @param {MediaStream} videoStream
   * @param {MediaStream} videoAudioStream
   */
  setStreams(videoStream, videoAudioStream) {
    this.video.setStreams(videoStream, videoAudioStream)
    this.setMuted(this.muted)
    return this
  }

  /**
   * Checks if the player has video/audio streams set or not
   */
  hasStreams() {
    return !isNil(this.video.video)
  }

  setMuted(muted) {
    this.muted = muted
    this.video.setMutedStream(this.muted)
    this.mutedIcon.visible = this.muted
    return this
  }

  setFlip(flipX, flipY) {
    // Noop since we do not want to flip the video and the reset sprite images are symmetric
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
