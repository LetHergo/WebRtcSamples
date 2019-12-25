<template>
  <div class="home">
    <video  autoplay playsinline ref="videoplay"></video>
    <div class="select">
      <label for="videoSource">Video source:</label>
      <select id="videoSource"></select>
    </div>
    <div v-if="loca">测试测试测试</div>
    <el-button @click="test">测试</el-button>
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      videoElement: [],
      stream: '',
      videoSelect: '',
      selectors: '',
      constraints: {
        audio: true,
        video: true
      }
    }
  },
  mounted () {
    localStorage.setItem('datas', 'test')
    this.init()
  },
  computed: {
    loca () {
      let locas = localStorage.getItem('datas')
      console.log(locas, 'locas')
      return locas
    }
  },
  methods: {
    test () {
      localStorage.setItem('datas', '')
    },
    gotDevices (deviceInfos) {
      // Handles being called several times to update labels. Preserve values.
      const values = this.selectors.map(select => select.value)
      this.selectors.forEach(select => {
        while (select.firstChild) {
          select.removeChild(select.firstChild)
        }
      })
      for (let i = 0; i !== deviceInfos.length; ++i) {
        const deviceInfo = deviceInfos[i]
        const option = document.createElement('option')
        option.value = deviceInfo.deviceId
        if (deviceInfo.kind === 'videoinput') {
          option.text =
            deviceInfo.label || `camera ${this.videoSelect.length + 1}`
          this.videoSelect.appendChild(option)
        } else {
          console.log('Some other kind of source/device: ', deviceInfo)
        }
      }
      this.selectors.forEach((select, selectorIndex) => {
        if (
          Array.prototype.slice
            .call(select.childNodes)
            .some(n => n.value === values[selectorIndex])
        ) {
          select.value = values[selectorIndex]
        }
      })
    },
    getVideo () {
      this.videoSelect = document.querySelector('select#videoSource')
      navigator.mediaDevices.enumerateDevices().then(this.gotDevices)
      this.selectors = [this.videoSelect]
      this.videoSelect.onchange = this.start
      console.log(this.videoSelect)
      console.log(this.videoSelect.onchange)
      // navigator.mediaDevices.enumerateDevices().then(res => {
      //   console.log('resssssssssssssssssss', res)
      // })
    },
    async init (e) {
      this.getVideo()
      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          this.constraints
        )
        this.handleSuccess(stream)
      } catch (error) {
        console.log(error)
      }
    },
    errorMsg (msg, error) {
      const errorElement = document.querySelector('#errorMsg')
      errorElement.innerHTML += `<p>${msg}</p>`
      if (typeof error !== 'undefined') {
        console.error(error)
      }
    },
    start () {
      if (this.stream) {
        console.log('this.stream', this.stream)
        this.stream.getTracks().forEach(track => {
          track.stop()
        })
      }
      const videoSource = this.videoSelect.value
      const constraints = {
        video: { deviceId: videoSource ? { exact: videoSource } : undefined }
      }
      navigator.mediaDevices.getUserMedia(constraints).then(this.gotStream).then(this.gotDevices)
    },
    gotStream (stream) {
      this.stream = stream // make stream available to console
      this.videoElement.srcObject = stream
      // Refresh button list in case labels have become available
      return navigator.mediaDevices.enumerateDevices()
    },
    handleSuccess (stream) {
      this.videoElement = document.querySelector('video')
      const videoTracks = stream.getVideoTracks()
      const getTracks = stream.getTracks()
      console.log('getTracks', getTracks)
      console.log('videoTracks', videoTracks)
      console.log(`Using video device: ${videoTracks[0].label}`)
      console.log('Got stream with constraints:', this.constraints)
      this.stream = stream // make variable available to browser console
      this.videoElement.srcObject = stream
    }
  }
}
</script>
