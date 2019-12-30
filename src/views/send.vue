<template>
  <div class="test">
    <div>{{status}}</div>
    <div style="margin-top: 15px;">
      <el-form ref="form" :model="form" label-width="80px" @submit.native.prevent>
        <el-form-item label="ID">
          <el-input placeholder="请输入ID" v-model="form.id" @change="changeId" autofocus>
            <el-button slot="append">连接</el-button>
          </el-input>
        </el-form-item>
      </el-form>
    </div>
    <div>
      <el-form ref="form" :model="form" label-width="80px" @submit.native.prevent>
        <el-form-item label="messages">
          <el-input placeholder="请输入信息" v-model="form.message" @change="changeMessage" autofocus>
            <el-button slot="append">发送</el-button>
          </el-input>
          <el-button @click="clear">清空本地信息</el-button>
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
    changeMessage () {
      if (this.conn && this.conn.open) {
        var msg = this.form.message
        this.conn.send(msg)
        this.addMessage(`my:${msg}`)
      }
    },
    addMessage (msg) {
      this.list.push(msg)
    },
    changeId () {
      this.join()
    },
    getUrlParam (name) {
      name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]')
      var regexS = '[\\?&]' + name + '=([^&#]*)'
      var regex = new RegExp(regexS)
      var results = regex.exec(window.location.href)
      if (results == null) {
        return null
      } else {
        return results[1]
      }
    },
    join () {
      // Close old connection
      if (this.conn) {
        this.conn.close()
      }

      // Create connection to destination peer specified in the input field
      this.conn = this.peerClient.connect(this.form.id, {
        reliable: true
      })

      this.conn.on('open', () => {
        this.status = 'Connected to: ' + this.conn.peer
        console.log('Connected to: ' + this.conn.peer)

        // Check URL params for comamnds that should be sent immediately
        var command = this.getUrlParam('command')
        if (command) {
          console.log('command', command)
          this.conn.send(command)
        }
      })
      // Handle incoming data (messages only since this is the signal sender)
      this.conn.on('data', (data) => {
        console.log('Data recieved')
        this.list.push(`Peer:${data}`)
      })
      this.conn.on('close', () => {
        this.status = 'Connection closed'
      })
    },
    initPeer () {
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
