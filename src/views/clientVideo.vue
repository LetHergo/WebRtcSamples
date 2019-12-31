<template>
  <div class="test">
    <div>{{recvId}}</div>
    <div>{{status}}</div>
    <video  ref="localVideo" autoplay ></video>
    <video  ref="remoteVideo" autoplay ></video>
  </div>
</template>

<script>
import Peer from 'peerjs'
export default {
  name: 'test',
  data () {
    return {
      status: '',
      recvId: '',
      list: [],
      form: {
        id: '',
        message: ''
      },
      localStream: '',
      conn: null,
      lastPeerId: null,
      peerClient: {}
    }
  },
  mounted () {
    this.initPeer()
  },
  computed: {},
  methods: {
    gotStream (stream) {
      this.$refs.localVideo.srcObject = stream
      this.localStream = stream
    },
    handleError (error) {
      console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name)
    },
    initPeer () {
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          track.stop()
        })
      }
      const constraints = {
        audio: true,
        video: true
      }

      navigator.mediaDevices
        .getUserMedia(constraints)
        .then(this.gotStream)
        .catch(this.handleError)
      this.peerClient = new Peer(null, {
        debug: 2
      })
      this.peerClient.on('open', id => {
        // Workaround for peer.reconnect deleting previous id
        if (this.peerClient.id === null) {
          console.log('Received null id from peer open')
          this.peerClient.id = this.lastPeerId
        } else {
          this.lastPeerId = this.peerClient.id
        }
        this.recvId = this.peerClient.id
        this.status = 'Awaiting connection...'
      })
      this.peerClient.on('call', (call) => {
        console.log('client收到call', call)
        call.answer(this.localStream)
        // this.call = this.peerClient.call(this.conn.peer, this.localStream)
        // this.call.on('stream', (stream) => {
        //   console.log('received remote stream')
        //   this.$refs.remoteVideo.srcObject = stream
        // })
      })
      this.peerClient.on('connection', c => {
        // Allow only a single connection
        if (this.conn) {
          c.on('open', function () {
            c.send('Already connected to another client')
            setTimeout(function () {
              c.close()
            }, 500)
          })
          return
        }

        this.conn = c
        console.log('Connected to: ' + this.conn.peer)
        this.status = 'Connected'
        // this.conn.on('data', (data) => {
        // 监听到对方传来的数据时发送通话给对方

        // })
      })
      // this.peerClient.on('disconnected', () => {
      //   this.status = 'Connection lost. Please reconnect'
      //   console.log('Connection lost. Please reconnect')
      //   // Workaround for peer.reconnect deleting previous id
      //   this.peerClient.id = this.lastPeerId
      //   this.peerClient._lastServerId = this.lastPeerId
      //   this.peerClient.reconnect()
      // })
      this.peerClient.on('close', () => {
        this.conn = null
        this.status = 'Connection destroyed. Please refresh'
        console.log('Connection destroyed')
      })
      this.peerClient.on('error', err => {
        console.log(err)
        alert('' + err)
      })
    }
  }
}
</script>
