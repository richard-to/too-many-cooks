import { Scene } from 'phaser'
import { Settings } from '../enums'
import geckos from '@geckos.io/client'


class Boot extends Scene {
  constructor() {
    super({ key: 'BootScene' })

    const initGeckosServer = async () => {
      const stream = await window.navigator.mediaDevices.getUserMedia({
        audio: Settings.ENABLE_AUDIO,
        video: Settings.ENABLE_VIDEO,
      })

      const channel = geckos({
        port: Settings.SERVER_PORT,
        stream: this.makeOptimizedStream(stream),
        iceServers: [
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' },
        ],
      })

      channel.onConnect(error => {
        if (error) {
          console.error(error.message)
        }
        channel.on('ready', () => {
          this.scene.start('GameScene', { channel })
        })
      })
    }
    initGeckosServer()
  }
  /**
   * Makes an optimized stream to send to the WebRTC server
   *
   * The player's local media stream cannot be modified. This means that we will
   * receive video with a set resolution. This does not work for our player sprite
   * since the dimensions (width/height) will be different both in size and resolution.
   *
   * In addition we do not want to waste bandwidth since it's critical for performance.
   *
   * In order to optimize the player's video stream, we can save it to a canvas and
   * use the cropped stream from the canvas.
   *
   * @param {MediaStream} stream
   *
   * @returns {MediaStream}
   */
  makeOptimizedStream(stream) {
    // Create a video element to hold the stream that we will pass to the canvas
    const playerVideo = document.createElement("video")
    playerVideo.playsInline = true
    playerVideo.srcObject = stream
    playerVideo.width = stream.getVideoTracks()[0].getSettings().width
    playerVideo.height = stream.getVideoTracks()[0].getSettings().height
    playerVideo.autoplay = true
    playerVideo.muted = true

    // Canvas to hold our optimized and cropped stream
    const playerCanvas = document.createElement('canvas')
    playerCanvas.width = Settings.PLAYER_WIDTH
    playerCanvas.height = Settings.PLAYER_HEIGHT
    const playerCtx = playerCanvas.getContext('2d')

    // Crops and resizes our video stream to the canvas
    const resizeCropVideo = () => {
      playerCtx.drawImage(
        playerVideo,
        // Try to crop near the center of the video
        // TODO: This strategy may not work well if the video's dimensions are too small
        (stream.getVideoTracks()[0].getSettings().width / 2) - Settings.PLAYER_WIDTH,
        (stream.getVideoTracks()[0].getSettings().height / 2) - Settings.PLAYER_HEIGHT,
        // Using double the player size since it worked better during initial testing
        Settings.PLAYER_WIDTH * 2,
        Settings.PLAYER_HEIGHT * 2,
        // Position video frames on canvas
        0,
        0,
        Settings.PLAYER_WIDTH,
        Settings.PLAYER_HEIGHT,
      )
      // Need to keep updating the canvas with new frames
      requestAnimationFrame(resizeCropVideo)
    }
    resizeCropVideo()

    // Add audio tracks to the our optimized media stream
    const optimizedMediaStream = playerCanvas.captureStream()
    const audioTracks = stream.getAudioTracks()
    audioTracks.forEach(track => optimizedMediaStream.addTrack(track))

    return optimizedMediaStream
  }
}

export default Boot
