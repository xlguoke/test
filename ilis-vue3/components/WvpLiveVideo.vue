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
          <CaretRightOutlined v-if="!playing" class="jessibuca-btn" @click="playBtnClick" />
          <PauseOutlined v-if="playing" class="jessibuca-btn" @click="pause" />
          <StopOutlined class="jessibuca-btn" @click="destroy" />
          <AudioOutlined v-if="isNotMute" class=" jessibuca-btn" @click="mute()" />
          <AudioMutedOutlined v-if="!isNotMute" class=" jessibuca-btn" @click="cancelMute()" />
        </div>
        <div class="buttons-box-right">
          <span class="jessibuca-btn">{{ kBps }} kb/s</span>
          <ScissorOutlined class="jessibuca-btn" @click="screenshot" />
          <SyncOutlined class="jessibuca-btn" @click="playBtnClick" />
          <CompressOutlined v-if="fullscreen" class="jessibuca-btn" @click="fullscreenSwich" />
          <ExpandOutlined v-if="!fullscreen" class="jessibuca-btn" @click="fullscreenSwich" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as CryptoJS from 'crypto-js'
import { message } from 'ant-design-vue'
import type { PropType } from 'vue'
import { defineProps, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import {
  AudioMutedOutlined,
  AudioOutlined,
  CaretRightOutlined,
  CompressOutlined,
  ExpandOutlined,
  PauseOutlined,
  ScissorOutlined,
  StopOutlined,
  SyncOutlined,
} from '@ant-design/icons-vue'
import type { IVideoEntity } from './qchjVideo/index'
import { ILISHTTPError } from '~/types'

const props = defineProps({
  data: {
    type: Object as PropType<IVideoEntity>,
    required: true,
  },
  isPlay: {
    type: Boolean,
    default: false,
  },
})
let jessibucaPlayer: any = null
const playing = ref(false)
const isNotMute = ref(false)
const quieting = ref(false)
const fullscreen = ref(false)
const loaded = ref(false)
const kBps = ref(0)
const performance = ref('') // 工作情况
const buttonsBox = ref(null)
const container = ref()
const error = ref('')

onMounted(async () => {
  await AnyDriverHelper.createScript('jessibuca/jessibuca.js')
  initLiveVideo()
})

onUnmounted(() => {
  destoryPlayer()
})

async function getWvpToken(username: string, password: string, loginUrl: string) {
  const query = {
    username,
    password: CryptoJS.MD5(password),
  }
  const urlQueryStr = new URLSearchParams(query)
  return ilisAxios.get<any>(`${loginUrl}?${urlQueryStr}`)
}

async function getLiveplay() {
  const query = {
    startTime: props.data.startDate,
    endTime: props.data.endDate,
  }
  const wvpParams = JSON.parse(props?.data?.configParam)
  const { data } = await getWvpToken(wvpParams.username, wvpParams.password, wvpParams.loginUrl)
  const urlQueryStr = new URLSearchParams(query)
  // return ilisAxios.get<any>(`/api/laboratoryController/wvp/lab/live/url?${urlQueryStr}`)
  return ilisAxios.get<any>(`${props.data.interfaceUrl}/${wvpParams.deviceId}/${wvpParams.channelId}?${urlQueryStr}`, {
    headers: {
      'access-token': data.data.accessToken,
    },
  })
}

function destoryPlayer() {
  if (jessibucaPlayer) {
    jessibucaPlayer.destroy()
    jessibucaPlayer = null
  }
  playing.value = false
  loaded.value = false
  performance.value = ''
}

watch(
  () => props.isPlay,
  (val) => {
    if (!val) {
      if (jessibucaPlayer) {
        pause()
      }
    }
    else {
      initLiveVideo()
    }
  },
)

watch(
  () => props.data,
  (val) => {
    if (!val)
      return
    destoryPlayer()
    nextTick(() => {
      initLiveVideo()
    })
  },
  {
    deep: true,
  },
)

const configs = ref({
  wss_flv: '',
  ws_flv: '',
})
async function initLiveVideo() {
  if (!props.data || !props.isPlay)
    return
  if (props.data.equType === 'HKWSLabColumn') {
    error.value = '暂不支持海康威视'
    return
  }
  if (jessibucaPlayer) {
    playBtnClick()
    return
  }
  try {
    const { data } = await getLiveplay()
    if (data.code === 0) {
      configs.value = data.data || {}
      if (!Object.keys(configs.value)?.length) {
        error.value = '无视频'
        return
      }
      nextTick(() => {
        play()
      })
    }
  }
  catch (err) {
    if (err instanceof ILISHTTPError) {
      error.value = `视频服务返回错误信息:${err.message}`
    }
  }
}

function create() {
  const options = {}

  jessibucaPlayer = new (window as any).Jessibuca(
    Object.assign(
      {
        container: container.value,
        autoWasm: true,
        background: '',
        controlAutoHide: false,
        debug: false,
        decoder: `${import.meta.env.VITE_ILIS_DRIVERS}/jessibuca/decoder.js`,
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
        isResize: true,
        keepScreenOn: false,
        loadingText: '请稍等, 视频加载中......',
        loadingTimeout: 10,
        loadingTimeoutReplay: true,
        loadingTimeoutReplayTimes: 3,
        openWebglAlignment: false,
        operateBtns: {
          fullscreen: false,
          screenshot: false,
          play: false,
          audio: false,
          record: false,
        },
        recordType: 'webm',
        rotate: 0,
        showBandwidth: false,
        supportDblclickFullscreen: false,
        timeout: 10,
        useMSE: location.hostname !== 'localhost' && location.protocol !== 'https:',
        useOffscreen: false,
        useWCS: location.hostname === 'localhost' || location.protocol === 'https:',
        useWebFullScreen: false,
        videoBuffer: 0,
        wasmDecodeAudioSyncVideo: true,
        wasmDecodeErrorReplay: true,
        wcsUseVideoRender: true,
      },
      options,
    ),
  )
  const jessibuca = jessibucaPlayer

  jessibuca.on('pause', () => {
    playing.value = false
  })
  jessibuca.on('play', () => {
    playing.value = true
  })
  jessibuca.on('fullscreen', (msg: boolean) => {
    // console.log("on fullscreen", msg)
    fullscreen.value = msg
  })

  jessibuca.on('mute', (msg: boolean) => {
    // console.log("on mute", msg)
    isNotMute.value = !msg
  })

  jessibuca.on('error', (error: any) => {
    // console.log('error', error)
    message.error(error)
  })

  jessibuca.on('performance', (performance2: number) => {
    let show = '卡顿'
    if (performance2 === 2) {
      show = '非常流畅'
    }
    else if (performance2 === 1) {
      show = '流畅'
    }
    performance.value = show
  })

  jessibuca.on('kBps', (_kBps: number) => {
    kBps.value = Math.round(_kBps)
  })
}
function playBtnClick() {
  play()
}
function play() {
  const isHttps = location.protocol === 'https:'
  const url = configs.value[isHttps ? 'wss_flv' : 'ws_flv']
  if (!url)
    return
  if (jessibucaPlayer) {
    destroy()
  }
  create()
  jessibucaPlayer.on('play', () => {
    playing.value = true
    loaded.value = true
    quieting.value = jessibucaPlayer.quieting
  })
  if (jessibucaPlayer.hasLoaded()) {
    jessibucaPlayer.play(url)
  }
  else {
    jessibucaPlayer.on('load', () => {
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
  performance.value = ''
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
  if (document.getElementById('buttonsBox') == null) {
    container.value.appendChild(buttonsBox.value)
  }
  jessibucaPlayer = null
  playing.value = false
  performance.value = ''
}

function fullscreenSwich() {
  const isFull = isFullscreen()
  jessibucaPlayer.setFullscreen(!isFull)
  fullscreen.value = !isFull
}
function isFullscreen() {
  return (
    document.fullscreenElement
    || (document as any).msFullscreenElement
    || (document as any).mozFullScreenElement
    || (document as any).webkitFullscreenElement
    || false
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
    height: 30px;
    background-color: rgba(43, 51, 63, 0.7);
    position: absolute;
    display: flex;
    align-items: center;
    left: 0;
    bottom: 0;
    user-select: none;
    z-index: 10;
  }

  .jessibuca-btn {
    width: 0.2;
    color: rgb(255, 255, 255);
    margin: 0px 5px;
    padding: 0px 2px;
    cursor: pointer;
    text-align: center;
    font-size:14px !important;
  }

  .buttons-box-right {
    position: absolute;
    right: 0;
  }
  .err-msg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: rgb(255, 255, 255);
    text-align: center;
    font-size: 14px;
  }
}
</style>
