import { Scene } from 'phaser'
import { Settings } from '../enums'
import geckos from '@geckos.io/client'
import VideoClient from '../VideoClient'


class Boot extends Scene {
  constructor() {
    super({ key: 'BootScene' })

    const initGeckosServer = async () => {
      const iceServers = [
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
      ]
      const videoClient = new VideoClient(
        Settings.WEBSOCKET_SERVER_URL,
        Settings.PLAYER_WIDTH,
        Settings.PLAYER_HEIGHT,
        Settings.ENABLE_VIDEO,
        Settings.ENABLE_AUDIO,
        iceServers,
      )
      await videoClient.enableMediaStream()
      const channel = geckos({
        port: Settings.SERVER_PORT,
        stream: null,
        iceServers,
      })

      channel.onConnect(error => {
        if (error) {
          console.error(error.message)
        }
        channel.on('ready', () => {
          this.scene.start('GameScene', { channel, videoClient })
        })
      })
    }
    initGeckosServer()
  }
}

export default Boot
