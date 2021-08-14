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

    this.videoStream = null
    this.videoAudioStream = null
  }

  /**
   * Set the player's video/audio streams
   *
   * We use two streams. One stream is video only. The other is video + audio. The reason we need
   * to do this is because muting the video sprite causes the video to render as a black screen.
   *
   * To workaround that issue we will swap streams depending on if the person is muted or
   * not. This a temporary solution.
   *
   * @param {MediaStream} videoStream
   * @param {MediaStream} videoAudioStream
   */
  setStreams(videoStream, videoAudioStream) {
    this.videoStream = videoStream
    this.videoAudioStream = videoAudioStream

    const stream = (this.muted) ? this.videoStream : this.videoAudioStream

    this.video = document.createElement('video')
    this.video.playsInline = true
    this.video.srcObject = stream
    this.video.width = Settings.PLAYER_WIDTH
    this.video.height = Settings.PLAYER_HEIGHT
    this.video.autoplay = true

    return this
  }

  setMutedStream(muted) {
    if (!this.video) {
      return
    }

    if (muted) {
      this.video.srcObject = this.videoStream
    } else {
      this.video.srcObject = this.videoAudioStream
    }
  }
}
