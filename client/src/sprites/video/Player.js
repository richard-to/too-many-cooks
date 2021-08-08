import Phaser from 'phaser'
import { Settings, SpriteType } from '../../enums'

/**
 * VideoPlayer is a sub-component of the Player container
 */
export class PlayerVideo extends Phaser.GameObjects.Video {
  constructor(scene, entityID, x, y) {
    super(scene, x, y, `PlayerVideo${entityID}`)
    this.type = SpriteType.PlayerVideo
    this.entityID = entityID
    scene.add.existing(this)
  }

  /**
   * Set the player's video stream
   *
   * @param {MediaStream} stream
   * @param {bool} muted
   */
  setStream(stream, muted = false) {
    this.video = document.createElement('video')
    this.video.playsInline = true
    this.video.srcObject = stream
    this.video.width = Settings.PLAYER_WIDTH
    this.video.height = Settings.PLAYER_HEIGHT
    this.video.autoplay = true
    this.video.muted = muted
    return this
  }
}
