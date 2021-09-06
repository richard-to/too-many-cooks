import protooClient from 'protoo-client'
import * as mediasoupClient from 'mediasoup-client'


export default class VideoClient {
  constructor(clientUrl, videoWidth, videoHeight, enableVideo = true, enableAudio = false, iceServers = []) {
    this.clientUrl = clientUrl
    this.videoWidth = videoWidth
    this.videoHeight = videoHeight
    this.mediasoupDevice = null
    this.sendTransport = null
    this.recvTransport = null
    this.closed = false
    this.protoo = null
    this.webcamProducer = null
    this.consumers = new Map()
    this.peers = {}
    this.onJoin = null
    this.localVideoTrack = null
    this.localAudioTrack = null
    this.enableVideo = enableVideo
    this.enableAudio = enableAudio
    self.iceServers = iceServers
  }

  closeConnections() {
    if (this.closed) {
      return
    }

    this.closed = true
    console.debug('close()')

    this.protoo.close()

    if (this.sendTransport) {
      this.sendTransport.close()
    }

    if (this.recvTransport) {
      this.recvTransport.close()
    }
  }

  async join(peerId) {
    const protooTransport = new protooClient.WebSocketTransport(`${this.clientUrl}?peerId=${peerId}`)
    this.protoo = new protooClient.Peer(protooTransport)

    this.protoo.on('open', () => this._joinRoom())

    this.protoo.on('failed', () => {
      console.error('failed websocket')
    })

    this.protoo.on('disconnected', () => {
      console.error('disconnected')

      if (this.sendTransport) {
        this.sendTransport.close()
        this.sendTransport = null
      }

      if (this.recvTransport) {
        this.recvTransport.close()
        this.recvTransport = null
      }
    })

    this.protoo.on('close', () => {
      if (this._closed) {
        return;
      }
      this.close()
    })

    this.protoo.on('request', async (request, accept, reject) => {
      console.debug('proto "request" event [method:%s, data:%o]', request.method, request.data)
      switch (request.method) {
        case 'newConsumer': {
          const {
            peerId,
            producerId,
            id,
            kind,
            rtpParameters,
            appData,
          } = request.data

          try {
            const consumer = await this.recvTransport.consume({
              id,
              producerId,
              kind,
              rtpParameters,
              appData : { ...appData, peerId },
            })
            this.consumers.set(consumer.id, consumer)
            this.peers[peerId].consumers.push(consumer)
            if (this.onJoin) {
              this.onJoin(this.peers[peerId])
            }

            consumer.on('transportclose', () => {
              this.consumers.delete(consumer.id)
            })
            accept()
          } catch (error) {
            console.error('"newConsumer" request failed:%o', error)
            throw error
          }
          break
        }
      }
    })

    this.protoo.on('notification', (notification) => {
      console.debug('proto "notification" event [method:%s, data:%o]', notification.method, notification.data)

      switch (notification.method) {
        case 'newPeer': {
          const peer = notification.data
          this.peers[peer.id] = { ...peer,  consumers: [] }
          break
        }

        case 'peerClosed': {
          const { peerId } = notification.data
          delete this.peers[peerId]
          break
        }

        case 'consumerClosed': {
          const { consumerId } = notification.data
          const consumer = this.consumers.get(consumerId)

          if (!consumer) {
            break
          }

          consumer.close()
          this.consumers.delete(consumerId)

          const { peerId } = consumer.appData

          this.peers[peerId].consumers = this.peers[peerId].consumers.filter(e => e !== consumerId)
          break
        }

        default: {
          console.error('unknown protoo notification.method "%s"', notification.method)
        }
      }
    })
  }

  async enableMediaStream() {
    if (!this.localVideoStream && this.enableVideo) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      this.localVideoStream = this.makeOptimizedStreams(stream)
    }
    if (!this.localAudioStream && this.enableAudio) {
      this.localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    }
  }

  async enableMic() {
    if (!this.enableAudio) {
      return
    }
    try {
      this.enableMediaStream()
      this.micProducer = await this.sendTransport.produce({
        track: this.localAudioStream.getAudioTracks()[0],
        codecOptions: {
          opusStereo: 1,
          opusDtx: 1,
        }
      })
      this.micProducer.on('transportclose', () => {
        this.micProducer = null
      })
    } catch (error) {
      console.error('enableMic() | failed:%o', error)
      if (this.localAudioStream) {
        this.localAudioStream.getAudioTracks()[0].stop()
      }
    }
  }

  async enableVideoStream() {
    if (!this.enableVideo) {
      return
    }
    try {
      this.enableMediaStream()
      const codecOptions = {
        videoGoogleStartBitrate: 1000,
      }
      this.webcamProducer = await this.sendTransport.produce({
        track: this.localVideoStream.getVideoTracks()[0],
        codecOptions,
      })

      this.webcamProducer.on('transportclose', () => {
        this.webcamProducer = null
      })
    } catch (error) {
      console.error('enableWebcam() | failed:%o', error)
      if (this.localVideoStream) {
        this.localVideoStream.getVideoTracks()[0].stop()
      }
    }
  }

  async _joinRoom() {
    console.debug('_joinRoom()')

    try {
      this.mediasoupDevice = new mediasoupClient.Device()
      const routerRtpCapabilities = await this.protoo.request('getRouterRtpCapabilities')
      await this.mediasoupDevice.load({ routerRtpCapabilities })

      let transportInfo = await this.protoo.request('createWebRtcTransport', {
        producing: true,
        consuming: false,
        sctpCapabilities: false,
      })

      const {
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters
      } = transportInfo

      this.sendTransport = this.mediasoupDevice.createSendTransport({
        id,
        iceParameters,
        iceCandidates,
        dtlsParameters,
        sctpParameters,
        iceServers: this.iceServers,
      })

      this.sendTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        this.protoo.request('connectWebRtcTransport', {
          transportId : this.sendTransport.id,
          dtlsParameters,
        })
        .then(callback)
        .catch(errback)
      })

      this.sendTransport.on('produce', async ({ kind, rtpParameters, appData }, callback, errback) => {
        try {
          const { id } = await this.protoo.request('produce', {
            transportId: this.sendTransport.id,
            kind,
            rtpParameters,
            appData,
          })
          callback({ id })
        } catch (error) {
          errback(error)
        }
      })

      transportInfo = await this.protoo.request('createWebRtcTransport', {
        producing: false,
        consuming: true,
        sctpCapabilities: false,
      })

      this.recvTransport = this.mediasoupDevice.createRecvTransport({
        id: transportInfo.id,
        iceParameters: transportInfo.iceParameters,
        iceCandidates: transportInfo.iceCandidates,
        dtlsParameters: transportInfo.dtlsParameters,
        sctpParameters: transportInfo.sctpCapabilities,
        iceServers : [],
      })

      this.recvTransport.on('connect', ({ dtlsParameters }, callback, errback) => {
        this.protoo.request('connectWebRtcTransport', {
          transportId: this.recvTransport.id,
          dtlsParameters,
        })
        .then(callback)
        .catch(errback)
      })

      const { peers } = await this.protoo.request('join', {
        rtpCapabilities: this.mediasoupDevice.rtpCapabilities
      })

      for (const peer of peers) {
        this.peers[peer.id] = {...peer, consumers: []}
      }

      this.enableMic()
      this.enableVideoStream()

      this.sendTransport.on('connectionstatechange', (connectionState) => {
        console.debug('Connection state changed')
      })
    } catch (error) {
      console.error('_joinRoom() failed:%o', error)
      this,closeConnections()
    }
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
   * @param {MediaStream} videoStream
   *
   * @returns {MediaStream} Optimized video stream
   */
  makeOptimizedStreams(videoStream) {
    // Create a video element to hold the stream that we will pass to the canvas
    const playerVideo = document.createElement("video")
    playerVideo.playsInline = true
    playerVideo.srcObject = videoStream
    playerVideo.width = videoStream.getVideoTracks()[0].getSettings().width
    playerVideo.height = videoStream.getVideoTracks()[0].getSettings().height
    playerVideo.autoplay = true

    // Canvas to hold our optimized and cropped stream
    const playerCanvas = document.createElement('canvas')
    playerCanvas.width = this.videoWidth
    playerCanvas.height = this.videoHeight
    const playerCtx = playerCanvas.getContext('2d')

    // Crops and resizes our video stream to the canvas
    const resizeCropVideo = () => {
      playerCtx.drawImage(
        playerVideo,
        // Try to crop near the center of the video
        // TODO: This strategy may not work well if the video's dimensions are too small
        (videoStream.getVideoTracks()[0].getSettings().width / 2) - this.videoWidth,
        (videoStream.getVideoTracks()[0].getSettings().height / 2) - this.videoHeight,
        // Using double the player size since it worked better during initial testing
        this.videoWidth * 2,
        this.videoHeight * 2,
        // Position video frames on canvas
        0,
        0,
        this.videoWidth,
        this.videoHeight,
      )
      // Need to keep updating the canvas with new frames
      requestAnimationFrame(resizeCropVideo)
    }
    resizeCropVideo()

    return playerCanvas.captureStream()
  }
}
