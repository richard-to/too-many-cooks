/*
The video server manages video/audio over WebRTC. A websocket server
is used for managing the WebRTC handshake process.

The video server is decoupled from the game server to improve scalability.
It also has the benefit of allow using to add features or improve performance
of the game or video servers separately.

Currently the video server is only handles one room. This is because the game
server also only supports one room at the moment.
*/
require('dotenv').config()

const http = require('http')

const express = require('express')
const mediasoup = require('mediasoup')
const protoo = require('protoo-server')

const Room = require('./room')

const WEBRTC_LISTEN_IP = process.env.INTERNAL_WEBSOCKET_LISTEN_IP
const WEBSOCKET_PORT = process.env.INTERNAL_WEBSOCKET_PORT

let httpServer
let appServer
let socketServer
let mediasoupWorker
let room


run()


async function run() {
  await runMediasoupWorker()
  await createAppServer()
  await runHttpServer()
  await runSocketServer()
}

async function runMediasoupWorker() {
  console.info('Running media soup worker...')
  mediasoupWorker = await mediasoup.createWorker({
    logLevel: 'warn',
    logTags: [
      'info',
      'ice',
      'dtls',
      'rtp',
      'srtp',
      'rtcp',
      'rtx',
      'bwe',
      'score',
      'simulcast',
      'svc',
      'sctp'
    ],
    rtcMinPort : 40000,
    rtcMaxPort : 49999,
  })

  mediasoupWorker.on('died', () => {
    console.error(
      'Mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid
    )
    setTimeout(() => process.exit(1), 2000)
  })

  // TODO: Create one room for now. In the future we should handle multiple rooms dynamically
  room = await Room.create({ mediasoupWorker, webrtc_listen_ip: WEBRTC_LISTEN_IP })
  room.on('close', () => {
    console.warn('Room closed')
  })
}

async function createAppServer() {
  // The Express App server is not currently being used. All requests go through web sockets
  console.info('Running app server...')
  appServer = express()
  appServer.use(express.json())
}

async function runHttpServer() {
  console.info('Running http server...')
  httpServer = http.createServer(appServer)
  await new Promise((resolve) => {
    httpServer.listen(WEBSOCKET_PORT, 'localhost', resolve)
  })
}

async function runSocketServer() {
  console.info('Running web socket server...')

  socketServer = new protoo.WebSocketServer(httpServer, {
    maxReceivedFrameSize     : 960000, // 960 KBytes.
    maxReceivedMessageSize   : 960000,
    fragmentOutgoingMessages : true,
    fragmentationThreshold   : 960000
  })

  socketServer.on('connectionrequest', (info, accept, reject) => {
    const url = new URL(info.request.url, info.request.headers.origin)
    const peerId  = url.searchParams.get('peerId')
    if (!peerId) {
      reject(400, 'Connection request without peerId')
      return
    }

    try {
      room.handleProtooConnection({ peerId, consume: true, protooWebSocketTransport: accept() })
    } catch (error) {
      console.error('Room creation or room joining failed: %o', error)
      reject(error)
    }
  })
}
