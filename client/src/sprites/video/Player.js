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

    this.videoTrack = null
    this.audioTrack = null

    this.videoStream = null
  }

  hasStreams() {
    if (Settings.ENABLE_AUDIO && !this.audioTrack) {
      return false
    }
    if (Settings.ENABLE_VIDEO && !this.video) {
      return false
    }
    return true
  }

  setStreamsFromConsumers(consumers) {
    consumers.forEach(consumer => {
      if (!this.videoTrack && consumer._track.kind === 'video') {
        this.videoTrack = consumer._track
      } else if (!this.audioTrack && consumer._track.kind === 'audio') {
        this.audioTrack = consumer._track
      }
    })
    if (this.videoTrack && this.audioTrack) {
      this.videoStream = new MediaStream([this.videoTrack, this.audioTrack])
      this._setStream()
    } else if (this.videoTrack) {
      this.videoStream = new MediaStream([this.videoTrack])
      this._setStream()
    }
  }

  setLocalStream(videoStream) {
    this.videoStream = videoStream
    this._setStream()
  }

  _setStream() {
    this.video = document.createElement('video')
    this.video.playsInline = true
    this.video.srcObject = this.videoStream
    this.video.width = Settings.PLAYER_WIDTH
    this.video.height = Settings.PLAYER_HEIGHT
    this.video.autoplay = true
    if (this.muted) {
      this.video.volume = 0
    }
    return this
  }

  setMutedStream(muted) {
    if (!this.video) {
      return
    }
    if (muted) {
      this.video.volume = 0
    } else {
      this.video.volume = 1
    }
  }
}
