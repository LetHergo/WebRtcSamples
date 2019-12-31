<template>
  <div class="test">
    <div>{{status}}</div>
    <div style="margin-top: 15px;width:350px;">
      <el-form ref="form" :model="form" label-width="80px" @submit.native.prevent>
        <el-form-item label="ID">
          <el-input placeholder="请输入ID" v-model="form.id" @change="changeId" autofocus>
            <el-button slot="append">连接</el-button>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <div>
       <video  ref="remoteVideo" autoplay ></video>
    </div>
  </div>
</template>

<script>
import Peer from 'peerjs'
export default {
  name: 'test',
  data () {
    return {
      status: '',
      form: {
        id: ''
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
      this.localStream = stream
    },
    handleError (error) {
      console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name)
    },
    changeId () {
      // Close old connection
      if (this.conn) {
        this.conn.close()
      }

      // Create connection to destination peer specified in the input field
      this.conn = this.peerClient.connect(this.form.id)

      this.conn.on('open', () => {
        this.status = 'Connected to: ' + this.conn.peer
        console.log('Connected to: ' + this.conn.peer)
        this.call = this.peerClient.call(this.conn.peer, this.localStream)
        this.call.on('stream', (stream) => {
          console.log('received remote stream')
          this.$refs.remoteVideo.srcObject = stream
        })
      })
      // Handle incoming data (messages only since this is the signal sender)
      // this.conn.on('data', (data) => {
      //   console.log('Data recieved')
      //   this.list.push(`Peer:${data}`)
      // })
      this.conn.on('close', () => {
        this.conn.close()
        this.status = 'Connection closed'
      })
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
      this.peerClient.on('open', (id) => {
        // Workaround for peer.reconnect deleting previous id
        if (this.peerClient.id === null) {
          console.log('Received null id from peer open')
          this.peerClient.id = this.lastPeerId
        } else {
          this.lastPeerId = this.peerClient.id
        }
      })
      this.peerClient.on('call', (call) => {
        console.log('send收到call', call)
        call.answer(this.localStream)
      })
      this.peerClient.on('disconnected', () => {
        this.status = 'Connection lost. Please reconnect'
        console.log('Connection lost. Please reconnect')

        // Workaround for peer.reconnect deleting previous id
        this.peerClient.id = this.lastPeerId
        this.peerClient._lastServerId = this.lastPeerId
        this.peerClient.reconnect()
      })
      this.peerClient.on('close', () => {
        this.conn = null
        this.status = 'Connection destroyed. Please refresh'
        console.log('Connection destroyed')
      })
      this.peerClient.on('error', (err) => {
        console.log(err)
        alert('' + err)
      })
    }
  }
}
</script>
