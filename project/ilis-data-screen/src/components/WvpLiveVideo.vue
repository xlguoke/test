<template>
  <div class="wvp-live-video">
    <div
      ref="container"
      style="width: 100%; height: 100%; background-color: #000000; margin: 0 auto"
      @dblclick="fullscreenSwich"
    >
      <p v-if="error" class="err-msg">
        {{ error }}
      </p>
      <div ref="buttonsBox" class="buttons-box">
        <div class="buttons-box-left">
          <i v-if="!playing" class="iconfont icon-play jessibuca-btn" @click="playBtnClick"></i>
          <i v-if="playing" class="iconfont icon-pause jessibuca-btn" @click="pause"></i>
          <i class="iconfont icon-stop jessibuca-btn" @click="destroy"></i>
          <i v-if="isNotMute" class="iconfont icon-audio-high jessibuca-btn" @click="mute()"></i>
          <i
            v-if="!isNotMute"
            class="iconfont icon-audio-mute jessibuca-btn"
            @click="cancelMute()"
          ></i>
        </div>
        <div class="buttons-box-right">
          <span class="jessibuca-btn">{{ kBps }} kb/s</span>
          <i
            class="iconfont icon-camera1196054easyiconnet jessibuca-btn"
            style="font-size: 0.14rem !important"
            @click="screenshot"
          ></i>
          <i class="iconfont icon-shuaxin11 jessibuca-btn" @click="playBtnClick"></i>
          <i
            v-if="!fullscreen"
            class="iconfont icon-weibiaoti10 jessibuca-btn"
            @click="fullscreenSwich"
          ></i>
          <i
            v-if="fullscreen"
            class="iconfont icon-weibiaoti11 jessibuca-btn"
            @click="fullscreenSwich"
          ></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, nextTick, onMounted, onUnmounted, ref, watch } from "vue"
import { getLiveplay, getLiveplayOld } from "@/api/dataScreen.api"
import { getLabVideoConfigData } from "@/api/smartCockpit.test.api"

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  isPlay: {
    type: Boolean,
    default: false
  },
  sourceModule: {
    type: String,
    default: null
  }
})
const isDev = process.env.NODE_ENV === "development"
let jessibucaPlayer: any = null
const playing = ref(false)
const isNotMute = ref(false)
const quieting = ref(false)
const fullscreen = ref(false)
const loaded = ref(false)
const kBps = ref(0)
const performance = ref("") // 工作情况
const buttonsBox = ref(null)
const container = ref()

onMounted(() => {
  initLiveVideo()
})

onUnmounted(() => {
  destoryPlayer()
})

function destoryPlayer() {
  if (jessibucaPlayer) {
    jessibucaPlayer.destroy()
    jessibucaPlayer = null
  }
  playing.value = false
  loaded.value = false
  performance.value = ""
}

watch(
  () => props.isPlay,
  (val) => {
    if (!val) {
      if (jessibucaPlayer) pause()
    } else {
      initLiveVideo()
    }
  }
)

watch(
  () => props.data,
  (val) => {
    if (!val || JSON.stringify(val) === "{}") return
    destoryPlayer()
    nextTick(() => {
      initLiveVideo()
    })
  },
  {
    deep: true
  }
)

const error = ref("")
const configs = ref({
  wss_flv: "",
  ws_flv: ""
})
async function initLiveVideo() {
  error.value = ""

  if (!props.data || JSON.stringify(props.data) === "{}" || !props.isPlay) return

  if (jessibucaPlayer) {
    playBtnClick()
    return
  }

  // 蜀工驾驶舱
  if (props.sourceModule === "smartCockpit") {
    initLiveVideoSmartCockpit()
    return
  }

  try {
    // 海康威视
    if (props.data.equType === "HKWSLabColumn") {
      const res: any = await getLiveplayOld(props.data.id)
      if (res.code === 20010) {
        throw res
      }
      if (res.data && res.data.length) {
        const obj = res.data[0]
        configs.value = {
          wss_flv: obj.url,
          ws_flv: obj.url
        }
      }
    } else {
      // WVP
      const { data } = await getLiveplay(props.data)
      configs.value = data || {}
    }
    nextTick(() => {
      play()
    })
  } catch (err: any) {
    if (err && err.message) error.value = err.message
  }
}

async function initLiveVideoSmartCockpit() {
  try {
    // HKWSLabColumn - 海康威视
    // HKICLabColumn - 摄像头-海康综合安防平台
    // 其他 - WVP

    const res = await getLabVideoConfigData(props.data.id)
    if (res.code === 20010) {
      throw res
    }

    if (res.data && res.data.data) {
      configs.value = {
        wss_flv: res.data.data.url,
        ws_flv: res.data.data.url
      }
    }

    nextTick(() => {
      play()
    })
  } catch (err: any) {
    if (err && err.message) error.value = err.message
  }
}

function create() {
  const options = {}

  jessibucaPlayer = new (window as any).Jessibuca(
    Object.assign(
      {
        container: container.value,
        autoWasm: true,
        background: "",
        controlAutoHide: false,
        debug: false,
        decoder: `./static/jessibuca/decoder.js`,
        forceNoOffscreen: true,
        hasAudio: true,
        hasVideo: true,
        heartTimeout: 5,
        heartTimeoutReplay: true,
        heartTimeoutReplayTimes: 3,
        hiddenAutoPause: false,
        hotKey: false,
        isFlv: false,
        isFullResize: false,
        isNotMute: isNotMute.value,
        isResize: false,
        keepScreenOn: false,
        loadingText: "请稍等, 视频加载中......",
        loadingTimeout: 10,
        loadingTimeoutReplay: true,
        loadingTimeoutReplayTimes: 3,
        openWebglAlignment: false,
        operateBtns: {
          fullscreen: false,
          screenshot: false,
          play: false,
          audio: false,
          record: false
        },
        recordType: "webm",
        rotate: 0,
        showBandwidth: false,
        supportDblclickFullscreen: false,
        timeout: 10,
        useMSE: location.hostname !== "localhost" && location.protocol !== "https:",
        useOffscreen: false,
        useWCS: location.hostname === "localhost" || location.protocol === "https:",
        useWebFullScreen: false,
        videoBuffer: 0,
        wasmDecodeAudioSyncVideo: true,
        wasmDecodeErrorReplay: true,
        wcsUseVideoRender: true
      },
      options
    )
  )
  const jessibuca = jessibucaPlayer
  // jessibuca.on("load", function () {
  //   console.log("on load init")
  // })

  // jessibuca.on("log", function (msg) {
  //   console.log("on log", msg)
  // })
  // jessibuca.on("record", function (msg) {
  //   console.log("on record:", msg)
  // })
  jessibuca.on("pause", () => {
    playing.value = false
  })
  jessibuca.on("play", () => {
    playing.value = true
  })
  jessibuca.on("fullscreen", (msg) => {
    // console.log("on fullscreen", msg)
    fullscreen.value = msg
  })

  jessibuca.on("mute", (msg) => {
    // console.log("on mute", msg)
    isNotMute.value = !msg
  })
  // jessibuca.on("audioInfo", function (msg) {
  //   console.log("audioInfo", msg)
  // })

  // jessibuca.on("bps", function (bps) {
  // console.log('bps', bps);
  // })
  // let _ts = 0
  // jessibuca.on("timeUpdate", function (ts) {
  // console.log('timeUpdate,old,new,timestamp', _ts, ts, ts - _ts);
  // _ts = ts
  // })

  // jessibuca.on("videoInfo", function (info) {
  //   console.log("videoInfo", info)
  // })

  jessibuca.on("error", (error) => {
    console.error("error", error)
  })

  // jessibuca.on("timeout", function () {
  //   console.log("timeout")
  // })

  // jessibuca.on("start", function () {
  //   console.log("start")
  // })

  jessibuca.on("performance", (performance2) => {
    let show = "卡顿"
    if (performance2 === 2) {
      show = "非常流畅"
    } else if (performance2 === 1) {
      show = "流畅"
    }
    performance.value = show
  })
  // jessibuca.on("buffer", function (buffer) {
  // console.log('buffer', buffer);
  // })

  // jessibuca.on("stats", function (stats) {
  // console.log('stats', stats);
  // })

  jessibuca.on("kBps", (_kBps) => {
    kBps.value = Math.round(_kBps)
  })

  // 显示时间戳 PTS
  // jessibuca.on("videoFrame", function () {})

  //
  // jessibuca.on("metadata", function () {})
}
function playBtnClick() {
  play()
}
function play() {
  const isHttps = location.protocol === "https:"
  const url = configs.value[isHttps ? "wss_flv" : "ws_flv"]
  if (!url) return
  if (jessibucaPlayer) {
    destroy()
  }
  create()
  jessibucaPlayer.on("play", () => {
    playing.value = true
    loaded.value = true
    quieting.value = jessibucaPlayer.quieting
  })
  if (jessibucaPlayer.hasLoaded()) {
    jessibucaPlayer.play(url)
  } else {
    jessibucaPlayer.on("load", () => {
      jessibucaPlayer.play(url)
    })
  }
}
function pause() {
  if (jessibucaPlayer) {
    jessibucaPlayer.pause()
  }
  playing.value = false
  // err = ""
  performance.value = ""
}
function screenshot() {
  if (jessibucaPlayer) {
    jessibucaPlayer.screenshot()
  }
}
function mute() {
  if (jessibucaPlayer) {
    jessibucaPlayer.mute()
  }
}
function cancelMute() {
  if (jessibucaPlayer) {
    jessibucaPlayer.cancelMute()
  }
}
function destroy() {
  if (jessibucaPlayer) {
    jessibucaPlayer.destroy()
  }
  if (document.getElementById("buttonsBox") == null) {
    container.value.appendChild(buttonsBox.value)
  }
  jessibucaPlayer = null
  playing.value = false
  // props.err = ""
  performance.value = ""
}
// const eventcallbacK = (type, message) => {
// console.log("player 事件回调")
// console.log(type)
// console.log(message)
// }
function fullscreenSwich() {
  const isFull = isFullscreen()
  jessibucaPlayer.setFullscreen(!isFull)
  fullscreen.value = !isFull
}
function isFullscreen() {
  return (
    document.fullscreenElement ||
    (document as any).msFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).webkitFullscreenElement ||
    false
  )
}
</script>

<style lang="less" scoped>
.wvp-live-video {
  position: relative;
  width: 100%;
  height: 100%;
  font-size: 0.16rem;
  .buttons-box {
    width: 100%;
    height: 0.28rem;
    background-color: rgba(43, 51, 63, 0.7);
    position: absolute;
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex;
    left: 0;
    bottom: 0;
    user-select: none;
    z-index: 10;
  }

  .jessibuca-btn {
    width: 0.2;
    color: rgb(255, 255, 255);
    line-height: 0.27rem;
    margin: 0px 0.1rem;
    padding: 0px 2px;
    cursor: pointer;
    text-align: center;
    font-size: 0.14rem !important;
  }

  .buttons-box-right {
    position: absolute;
    right: 0;
  }
  .err-msg {
    text-align: center;
    font-size: 0.14rem;
    line-height: 1.6rem;
  }
}
</style>
