const EventEmitter = require('events').EventEmitter
const protoo = require('protoo-server')

class Room extends EventEmitter {
  static async create({ mediasoupWorker, webrtc_listen_ip }) {
    const room = new protoo.Room()
    const { mediaCodecs } = getRouterOptions()
    const mediasoupRouter = await mediasoupWorker.createRouter({ mediaCodecs })
    return new Room({ room, mediasoupRouter, webrtc_listen_ip })
  }

  constructor({ room, mediasoupRouter, webrtc_listen_ip }) {
    super()
    this.setMaxListeners(Infinity)

    this._closed = false
    this._room = room
    this._mediasoupRouter = mediasoupRouter
    this._webrtc_listen_ip = webrtc_listen_ip

    // Map of broadcasters indexed by id. Each Object has:
    // - {String} id
    // - {Object} data
    //   - {RTCRtpCapabilities} rtpCapabilities
    //   - {Map<String, mediasoup.Transport>} transports
    //   - {Map<String, mediasoup.Producer>} producers
    //   - {Map<String, mediasoup.Consumers>} consumers
    this._broadcasters = new Map()
  }

  close() {
    this._closed = true
    this._room.close()
    this._mediasoupRouter.close()
    this.emit('close')
  }

  handleProtooConnection({ peerId, consume, protooWebSocketTransport }) {
    const existingPeer = this._room.getPeer(peerId)
    if (existingPeer) {
      existingPeer.close()
    }

    let peer

    try {
      peer = this._room.createPeer(peerId, protooWebSocketTransport)
    } catch (error) {
    }

    peer.data.consume = consume
    peer.data.joined = false
    peer.data.rtpCapabilities = undefined
    peer.data.sctpCapabilities = undefined

    peer.data.transports = new Map()
    peer.data.producers = new Map()
    peer.data.consumers = new Map()
    peer.data.dataProducers = new Map()
    peer.data.dataConsumers = new Map()

    peer.on('request', (request, accept, reject) => {
      this._handleRequest(peer, request, accept, reject).catch((error) => {
        reject(error)
      })
    })

    peer.on('close', () => {
      if (this._closed) {
        return
      }

      if (peer.data.joined) {
        for (const otherPeer of this._getJoinedPeers({ excludePeer: peer })) {
          otherPeer.notify('peerClosed', { peerId: peer.id }).catch(() => {})
        }
      }

      for (const transport of peer.data.transports.values()) {
        transport.close()
      }
    })
  }

  getRouterRtpCapabilities() {
    return this._mediasoupRouter.rtpCapabilities
  }

  async createBroadcaster({ id, rtpCapabilities }) {
    console.debug('Create broadcaster')
    if (this._broadcasters.has(id)) {
      throw new Error(`broadcaster with id "${id}" already exists`)
    }

    const broadcaster = {
      id,
      data: {
        rtpCapabilities,
        transports    : new Map(),
        producers     : new Map(),
        consumers     : new Map(),
      }
    }

    this._broadcasters.set(broadcaster.id, broadcaster)
    for (const otherPeer of this._getJoinedPeers()) {
      otherPeer.notify('newPeer', { id: broadcaster.id }).catch(() => {})
    }

    const peerInfos = []
    const joinedPeers = this._getJoinedPeers()

    if (rtpCapabilities) {
      for (const joinedPeer of joinedPeers) {
        const peerInfo = {
          id          : joinedPeer.id,
          producers   : [],
        }

        for (const producer of joinedPeer.data.producers.values()) {
          // Ignore Producers that the Broadcaster cannot consume.
          if (!this._mediasoupRouter.canConsume({ producerId : producer.id, rtpCapabilities })) {
            continue
          }

          peerInfo.producers.push({
            id: producer.id,
            kind: producer.kind,
          })
        }

        peerInfos.push(peerInfo)
      }
    }
    return { peers: peerInfos }
  }

  deleteBroadcaster({ broadcasterId }) {
    const broadcaster = this._broadcasters.get(broadcasterId)

    if (!broadcaster) {
      throw new Error(`broadcaster with id "${broadcasterId}" does not exist`)
    }

    for (const transport of broadcaster.data.transports.values()) {
      transport.close()
    }

    this._broadcasters.delete(broadcasterId)

    for (const peer of this._getJoinedPeers()) {
      peer.notify('peerClosed', { peerId: broadcasterId }).catch(() => {})
    }
  }

  async createBroadcasterTransport({ broadcasterId, sctpCapabilities }) {
    const broadcaster = this._broadcasters.get(broadcasterId)
    console.debug('Create broadcaster transport')
    if (!broadcaster) {
      throw new Error(`broadcaster with id "${broadcasterId}" does not exist`)
    }

    const webRtcTransportOptions = {
      listenIps: [
        {
          ip: this._webrtc_listen_ip
        }
      ],
      initialAvailableOutgoingBitrate : 1000000,
      maxSctpMessageSize: 262144,
      enableSctp: Boolean(sctpCapabilities),
      numSctpStreams: (sctpCapabilities || {}).numStreams,
    }

    const transport = await this._mediasoupRouter.createWebRtcTransport(webRtcTransportOptions)
    broadcaster.data.transports.set(transport.id, transport)

    return {
      id             : transport.id,
      iceParameters  : transport.iceParameters,
      iceCandidates  : transport.iceCandidates,
      dtlsParameters : transport.dtlsParameters,
      sctpParameters : transport.sctpParameters
    }
  }

  async connectBroadcasterTransport({ broadcasterId, transportId, dtlsParameters }) {
    console.debug("Connect broadcaster transport")
    const broadcaster = this._broadcasters.get(broadcasterId)
    if (!broadcaster) {
      throw new Error(`broadcaster with id "${broadcasterId}" does not exist`)
    }
    const transport = broadcaster.data.transports.get(transportId)

    if (!transport) {
      throw new Error(`transport with id "${transportId}" does not exist`)
    }
    await transport.connect({ dtlsParameters })
  }

  async createBroadcasterProducer({
    broadcasterId,
    transportId,
    kind,
    rtpParameters
  }) {
    console.debug("Connect broadcaster producer")
    const broadcaster = this._broadcasters.get(broadcasterId)

    if (!broadcaster) {
      throw new Error(`broadcaster with id "${broadcasterId}" does not exist`)
    }
    const transport = broadcaster.data.transports.get(transportId)

    if (!transport) {
      throw new Error(`transport with id "${transportId}" does not exist`)
    }

    const producer = await transport.produce({ kind, rtpParameters })
    broadcaster.data.producers.set(producer.id, producer)

    // Optimization: Create a server-side Consumer for each Peer.
    for (const peer of this._getJoinedPeers()) {
      this._createConsumer({
        consumerPeer: peer,
        producerPeer: broadcaster,
        producer,
      })
    }

    return { id: producer.id }
  }

  async createBroadcasterConsumer(
    {
      broadcasterId,
      transportId,
      producerId
    }
  )
  {
    const broadcaster = this._broadcasters.get(broadcasterId)

    if (!broadcaster) {
      throw new Error(`broadcaster with id "${broadcasterId}" does not exist`)
    }
    if (!broadcaster.data.rtpCapabilities) {
      throw new Error('broadcaster does not have rtpCapabilities')
    }
    const transport = broadcaster.data.transports.get(transportId)

    if (!transport) {
      throw new Error(`transport with id "${transportId}" does not exist`)
    }

    const consumer = await transport.consume({
      producerId,
      rtpCapabilities : broadcaster.data.rtpCapabilities,
    })

    broadcaster.data.consumers.set(consumer.id, consumer)

    consumer.on('transportclose', () => {
      broadcaster.data.consumers.delete(consumer.id)
    })

    consumer.on('producerclose', () => {
      broadcaster.data.consumers.delete(consumer.id)
    })

    return {
      id            : consumer.id,
      producerId,
      kind          : consumer.kind,
      rtpParameters : consumer.rtpParameters,
      type          : consumer.type,
    }
  }

  _getJoinedPeers({ excludePeer = undefined } = {}) {
    return this._room.peers.filter((peer) => peer.data.joined && peer !== excludePeer)
  }

  async _handleRequest(peer, request, accept, reject) {
    switch (request.method) {
      case 'getRouterRtpCapabilities': {
        accept(this._mediasoupRouter.rtpCapabilities)
        break
      }

      case 'join': {
        if (peer.data.joined) {
          throw new Error('Peer already joined')
        }

        const { rtpCapabilities, sctpCapabilities } = request.data

        peer.data.joined = true
        peer.data.rtpCapabilities = rtpCapabilities
        peer.data.sctpCapabilities = sctpCapabilities

        // Tell the new Peer about already joined Peers.
        // And also create Consumers for existing Producers.
        const joinedPeers = [
          ...this._getJoinedPeers(),
          ...this._broadcasters.values(),
        ]

        // Reply now the request with the list of joined peers (all but the new one).
        const peerInfos = joinedPeers
          .filter((joinedPeer) => joinedPeer.id !== peer.id)
          .map((joinedPeer) => ({ id: joinedPeer.id }))

        accept({ peers: peerInfos })

        // Mark the new Peer as joined.
        peer.data.joined = true

        for (const joinedPeer of joinedPeers) {
          // Create Consumers for existing Producers.
          for (const producer of joinedPeer.data.producers.values()) {
            this._createConsumer({
              consumerPeer: peer,
              producerPeer: joinedPeer,
              producer,
            })
          }
        }

        // Notify the new Peer to all other Peers.
        for (const otherPeer of this._getJoinedPeers({ excludePeer: peer })) {
          otherPeer.notify('newPeer', { id: peer.id })
            .catch(() => {});
        }
        break;
      }

      case 'createWebRtcTransport': {
        // NOTE: Don't require that the Peer is joined here, so the client can
        // initiate mediasoup Transports and be ready when he later joins.
        const {
          producing,
          consuming,
          sctpCapabilities
        } = request.data

        const webRtcTransportOptions = {
          listenIps: [
            {
              ip: this._webrtc_listen_ip,
            }
          ],
          initialAvailableOutgoingBitrate: 1000000,
          minimumAvailableOutgoingBitrate: 600000,
          maxSctpMessageSize: 262144,
          enableSctp     : Boolean(sctpCapabilities),
          numSctpStreams : (sctpCapabilities || {}).numStreams,
          appData        : { producing, consuming },
        }

        const transport = await this._mediasoupRouter.createWebRtcTransport(
          webRtcTransportOptions,
        )

        transport.on('sctpstatechange', (sctpState) => {
          console.debug('WebRtcTransport "sctpstatechange" event [sctpState:%s]', sctpState)
        })

        transport.on('dtlsstatechange', (dtlsState) => {
          if (dtlsState === 'failed' || dtlsState === 'closed') {
            console.warn('WebRtcTransport "dtlsstatechange" event [dtlsState:%s]', dtlsState)
          }
        })

        // Store the WebRtcTransport into the protoo Peer data Object.
        peer.data.transports.set(transport.id, transport)

        accept({
          id: transport.id,
          iceParameters: transport.iceParameters,
          iceCandidates: transport.iceCandidates,
          dtlsParameters: transport.dtlsParameters,
          sctpParameters: transport.sctpParameters,
        })
        break
      }

      case 'connectWebRtcTransport': {
        const { transportId, dtlsParameters } = request.data
        const transport = peer.data.transports.get(transportId)
        if (!transport) {
          throw new Error(`transport with id "${transportId}" not found`)
        }
        await transport.connect({ dtlsParameters })
        accept()
        break
      }

      case 'restartIce': {
        const { transportId } = request.data
        const transport = peer.data.transports.get(transportId)
        if (!transport) {
          throw new Error(`transport with id "${transportId}" not found`)
        }
        const iceParameters = await transport.restartIce()
        accept(iceParameters)
        break
      }

      case 'produce': {
        // Ensure the Peer is joined.
        if (!peer.data.joined) {
          throw new Error('Peer not yet joined')
        }

        const { transportId, kind, rtpParameters } = request.data
        let { appData } = request.data
        const transport = peer.data.transports.get(transportId)

        if (!transport) {
          throw new Error(`transport with id "${transportId}" not found`)
        }

        // Add peerId into appData to later get the associated Peer during
        // the 'loudest' event of the audioLevelObserver.
        appData = { ...appData, peerId: peer.id }

        const producer = await transport.produce({
          kind,
          rtpParameters,
          appData,
        })

        // Store the Producer into the protoo Peer data Object.
        peer.data.producers.set(producer.id, producer)

        accept({ id: producer.id })

        // Optimization: Create a server-side Consumer for each Peer.
        for (const otherPeer of this._getJoinedPeers({ excludePeer: peer })) {
          this._createConsumer({
            consumerPeer : otherPeer,
            producerPeer : peer,
            producer,
          })
        }
          break
      }

      case 'closeProducer': {
        // Ensure the Peer is joined.
        if (!peer.data.joined) {
          throw new Error('Peer not yet joined')
        }

        const { producerId } = request.data
        const producer = peer.data.producers.get(producerId)

        if (!producer) {
          throw new Error(`producer with id "${producerId}" not found`)
        }

        producer.close()

        // Remove from its map.
        peer.data.producers.delete(producer.id)

        accept()

        break
      }
    }
  }

  async _createConsumer({ consumerPeer, producerPeer, producer }) {

    // Must take the Transport the remote Peer is using for consuming.
    const transport = Array.from(consumerPeer.data.transports.values())
      .find((t) => t.appData.consuming)

    if (!transport) {
      console.warn('_createConsumer() | Transport for consuming not found')
      return
    }

    let consumer

    try {
      consumer = await transport.consume({
        producerId: producer.id,
        rtpCapabilities: consumerPeer.data.rtpCapabilities,
        paused: false
      })
    } catch (error) {
      console.warn('_createConsumer() | transport.consume():%o', error)
      return
    }

    consumerPeer.data.consumers.set(consumer.id, consumer)
    consumer.on('transportclose', () => {
      consumerPeer.data.consumers.delete(consumer.id)
    })

    consumer.on('producerclose', () => {
      consumerPeer.data.consumers.delete(consumer.id)
      consumerPeer.notify('consumerClosed', { consumerId: consumer.id }).catch(() => {})
    })

    try {
      await consumerPeer.request('newConsumer', {
        peerId: producerPeer.id,
        producerId: producer.id,
        id: consumer.id,
        kind: consumer.kind,
        rtpParameters: consumer.rtpParameters,
        type: consumer.type,
        appData: producer.appData,
      })
    } catch (error) {
      console.warn('_createConsumer() | failed:%o', error)
    }
  }
}

function getRouterOptions() {
  return {
    mediaCodecs: [{
        kind: 'audio',
        mimeType: 'audio/opus',
        clockRate: 48000,
        channels: 2,
      },
      {
        kind: 'video',
        mimeType: 'video/VP8',
        clockRate: 90000,
        parameters: {
          'x-google-start-bitrate': 1000,
        },
      },
      {
        kind: 'video',
        mimeType: 'video/VP9',
        clockRate: 90000,
        parameters: {
          'profile-id': 2,
          'x-google-start-bitrate': 1000,
        },
      },
      {
        kind: 'video',
        mimeType: 'video/h264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '4d0032',
          'level-asymmetry-allowed': 1,
          'x-google-start-bitrate': 1000,
        },
      },
      {
        kind: 'video',
        mimeType: 'video/h264',
        clockRate: 90000,
        parameters: {
          'packetization-mode': 1,
          'profile-level-id': '42e01f',
          'level-asymmetry-allowed': 1,
          'x-google-start-bitrate': 1000,
        },
      },
    ],
  }
}

module.exports = Room
