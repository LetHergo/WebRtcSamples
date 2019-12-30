<template>
  <div class="home">
    <div v-for="(item,index) in videoElement" :key="index" :ref="`divWrapper${index}`">
      这是视频{{index+1}}
      <video
        autoplay
        playsinline
        :ref="`videoWrapper${index}`"
        :srcObject="videoStream[index]"
      ></video>
    </div>
  </div>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      videoElement: [],
      videoStream: [],
      videoSelect: ''
    }
  },
  mounted () {
    this.init()
  },
  computed: {},
  methods: {
    init () {
      navigator.mediaDevices
        .enumerateDevices()
        .then(this.gotDevices)
        .catch(this.handleError)

      // if (window.stream) {
      //   window.stream.getTracks().forEach(function (track) {
      //     track.stop()
      //   })
      // }
    },
    handleError (error) {
      console.log('Error: ', error)
    },
    async gotDevices (deviceInfos) {
      for (var i = 0; i !== deviceInfos.length; ++i) {
        var deviceInfo = deviceInfos[i]
        console.log(deviceInfo)
        if (deviceInfo.kind === 'videoinput') {
          // console.log(deviceInfo)
          this.videoElement.push({
            video: {
              deviceId: deviceInfo.deviceId
            }
            // audio: true
          })
          try {
            const stream = await navigator.mediaDevices.getUserMedia(
              this.videoElement[this.videoElement.length - 1]
            )
            this.gotStream(stream)
          } catch (error) {
            this.handleError(error)
          }
        }
      }
      // if (window.stream) {
      //   window.stream.getTracks().forEach(function (track) {
      //     track.stop()
      //   })
      // }
    },
    gotStream (stream) {
      // window.stream = stream // make stream available to console
      // console.log(stream)
      this.videoStream.push(stream)
      this.$refs[`videoWrapper${this.videoStream.length - 1}`][0].srcObject = this.videoStream[this.videoStream.length - 1]
    }
  }
}
</script>
