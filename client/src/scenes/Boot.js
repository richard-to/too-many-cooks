import { Scene } from 'phaser'
import { Settings } from '../enums'
import geckos from '@geckos.io/client'


class Boot extends Scene {
  constructor() {
    super({ key: 'BootScene' })

    const initGeckosServer = async () => {
      const audioStream = await window.navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      })
      const videoStream = await window.navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true,
      })

      const [optimizedVideoStream, optimizedAudioVideoStream] = this.makeOptimizedStreams(videoStream, audioStream)
      const channel = geckos({
        port: Settings.SERVER_PORT,
        stream: optimizedAudioVideoStream,
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
          this.scene.start('GameScene', { channel, playerVideoStream: optimizedVideoStream })
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
   * We need to return two streams. One stream is video only. The other is video + audio.
   * The reason we need to do this is because muting the video sprite causes the video to
   * render as a black screen.
   *
   * To workaround that issue we will swap streams depending on if the person is muted or
   * not. This a temporary solution.
   *
   * @param {MediaStream} videoStream
   * @param {MediaStream} audioStream
   *
   * @returns {Array} Two media streams, one with video and one with video/audio
   */
   makeOptimizedStreams(videoStream, audioStream) {
    // Create a video element to hold the stream that we will pass to the canvas
    const playerVideo = document.createElement("video")
    playerVideo.playsInline = true
    playerVideo.srcObject = videoStream
    playerVideo.width = videoStream.getVideoTracks()[0].getSettings().width
    playerVideo.height = videoStream.getVideoTracks()[0].getSettings().height
    playerVideo.autoplay = true

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
        (videoStream.getVideoTracks()[0].getSettings().width / 2) - Settings.PLAYER_WIDTH,
        (videoStream.getVideoTracks()[0].getSettings().height / 2) - Settings.PLAYER_HEIGHT,
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
    const optimizedVideoStream = playerCanvas.captureStream()
    const optimizedVideoAudioStream = new MediaStream(optimizedVideoStream)
    if (Settings.ENABLE_AUDIO) {
      const audioTracks = audioStream.getAudioTracks()
      audioTracks.forEach(track => optimizedVideoAudioStream.addTrack(track))
    }
    return [optimizedVideoStream, optimizedVideoAudioStream]
  }
}

export default Boot
