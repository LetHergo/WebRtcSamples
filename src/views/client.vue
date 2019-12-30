<template>
  <div class="test">
    <div>{{recvId}}</div>
    <div>{{status}}</div>
    <div>
      <el-form ref="form" :model="form" label-width="80px" @submit.native.prevent>
        <el-form-item label="messages">
          <el-row type="flex">
            <div style="width:250px;">
              <el-input
                placeholder="请输入信息"
                v-model="form.message"
                @change="changeMessage"
                autofocus
              >
                <el-button slot="append">发送</el-button>
              </el-input>
            </div>
            <el-button @click="clear">清空本地信息</el-button>
          </el-row>
        </el-form-item>
      </el-form>
    </div>
    <div v-for="(item,index) in list" :key="index">
      <li>{{item}}</li>
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
      recvId: '',
      list: [],
      form: {
        id: '',
        message: ''
      },
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
    clear () {},
    addMessage (data) {
      this.list.push(data)
    },
    changeMessage () {
      if (this.conn && this.conn.open) {
        var msg = this.form.message
        this.conn.send(msg)
        this.addMessage(`my:${msg}`)
        this.form.message = ''
      } else {
        this.$message('暂时未连接')
      }
    },
    ready () {
      console.log('ready')
      this.conn.on('data', data => {
        console.log(data)
        console.log('Data recieved')
        this.addMessage(`Peer:${data}`)
      })
      this.conn.on('close', () => {
        this.status = 'Connection reset<br>Awaiting connection...'
        this.conn = null
        this.start(true)
      })
    },
    initPeer () {
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
        this.ready()
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
      this.peerClient.on('error', err => {
        console.log(err)
        alert('' + err)
      })
    }
  }
}
</script>
