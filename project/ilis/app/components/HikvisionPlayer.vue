<!-- 海康威视H5播放器 -->
<template>
  <div class="w-full h-full relative">
    <div :id="domId" class="w-full h-full" style="background-color: #000000"></div>

    <div class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
      <p v-if="errorMsg" class="text-sm text-white">
        {{ errorMsg }}
      </p>

      <LoadingOutlined v-if="playLoading" class="text-sm text-white" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { LoadingOutlined } from '@ant-design/icons-vue'
import { computed, defineProps, onMounted, ref, watch } from 'vue'

const props = defineProps({
  // 播放流地址（必传）
  playUrl: {
    required: true,
    type: String,
    default: null,
  },
  // 是否回放
  isBackPlay: {
    required: false,
    type: Boolean,
    default: false,
  },
  backPlayStartTime: {
    required: false,
    type: String,
    default: '',
  },
  backPlayEndTime: {
    required: false,
    type: String,
    default: '',
  },
  // 错误提示信息（非必须，根据情况传递）
  msg: {
    required: false,
    type: String,
    default: '',
  },
})

const playUrl = computed(() => {
  if (props.playUrl && props.playUrl.includes('?')) {
    const arr = props.playUrl.split('?')
    return arr[0]
  }
  return props.playUrl
})

const backPlayStartTime = computed(() => {
  if (props.backPlayStartTime) {
    return `${props.backPlayStartTime.replace(' ', 'T')}.000+08:00`
  }
  return ''
})

const backPlayEndTime = computed(() => {
  if (props.backPlayEndTime) {
    return `${props.backPlayEndTime.replace(' ', 'T')}.000+08:00`
  }
  return ''
})

const domId = ref(`video-${generateGUID()}`)

const errorMsg = ref('')

const playLoading = ref(false)

let player: any = null

onMounted(async () => {
  await AnyDriverHelper.createScript('HikvisionH5player/h5player.min.js')

  initPlayer()

  window.addEventListener('resize', () => {
    if (player) {
      player.JS_Resize()
    }
  })
})

onBeforeUnmount(async () => {
  await onStopPlay()
  player = null
})

function initPlayer() {
  player = new (window as any).JSPlugin({
    szId: domId.value,
    szBasePath: `${import.meta.env.VITE_ILIS_DRIVERS}/HikvisionH5player`, // 必填,与h5player.min.js的引用路径一致
    iMaxSplit: 1,
    openDebug: true,
    mseWorkerEnable: true, // 是否开启多线程解码，分辨率大于1080P建议开启，否则可能卡顿
    bSupporDoubleClickFull: true, // 是否支持双击全屏，true-双击是全屏；false-双击无响应
    oStyle: {
      borderSelect: 'none',
      background: '#111',
    },
  })

  // 事件回调绑定
  player.JS_SetWindowControlCallback({
    // 插件选中窗口回调
    windowEventSelect(iWndIndex) {
      // PS：我们目前就有一个窗口，触发了没意义，先留起，后面可能用得到
      // eslint-disable-next-line no-console
      console.log('windowSelect callback: ', iWndIndex)
    },
    // 插件错误回调
    pluginErrorHandler(iWndIndex, iErrorCode, oError) {
      // eslint-disable-next-line no-console
      console.log('pluginError callback: ', iWndIndex, iErrorCode, oError)
    },
    // 全屏切换回调
    windowFullCcreenChange(bFull) {
      // eslint-disable-next-line no-console
      console.log('fullScreen callback: ', bFull)
    },
    // 首帧显示回调
    firstFrameDisplay(iWndIndex, iWidth, iHeight) {
      // eslint-disable-next-line no-console
      console.log('firstFrame loaded callback: ', iWndIndex, iWidth, iHeight)
    },
    // 性能不足回调
    performanceLack(iWndIndex) {
      // eslint-disable-next-line no-console
      console.log('performanceLack callback: ', iWndIndex)
    },
    // 断流事件回调，iTime为秒级
    InterruptStream: (iWndIndex, iTime) => {
      // eslint-disable-next-line no-console
      console.log(`recv InterruptStream: ${iWndIndex}, iTime:${iTime}`)
    },
  })

  if (playUrl.value) {
    onPlay()
  }
}

async function onStopPlay() {
  if (!player) {
    return
  }

  const index = player.currentWindowIndex
  await player.JS_Stop(index)
}

function onPlay() {
  if (!player) {
    return
  }

  if (props.isBackPlay) {
    onBackPlay()
    return
  }

  const index = player.currentWindowIndex

  player.JS_SetTraceId(index, true)

  playLoading.value = true
  errorMsg.value = ''

  player
    .JS_Play(
      playUrl.value,
      {
        playURL: playUrl.value,
        mode: 0,
        keepDecoder: 0,
        // token
      },
      index,
    )
    .then(
      () => {
        player.JS_GetTraceId(index).then((id) => {
          // eslint-disable-next-line no-console
          console.log('traceid:', id)
        })
      },
      (e) => {
        errorMsg.value = `播放失败：${e}`
        console.error(e)
      },
    )
    .finally(() => {
      playLoading.value = false
    })
}

function onBackPlay() {
  if (!player) {
    return
  }

  const index = player.currentWindowIndex
  player.JS_SetTraceId(index, true)

  playLoading.value = true
  errorMsg.value = ''

  player.JS_Play(playUrl.value, {
    playURL: playUrl.value,
    mode: 0,
    keepDecoder: 0,
  }, index, backPlayStartTime.value, backPlayEndTime.value)
    .then(
      () => {
        // eslint-disable-next-line no-console
        console.log('开始播放')
      },
      (e: string) => {
        errorMsg.value = `播放失败：${e}`
        console.error(e)
      },
    )
    .finally(() => {
      playLoading.value = false
    })
}

watch(
  () => props.playUrl,
  async (val) => {
    errorMsg.value = ''
    playLoading.value = false

    await onStopPlay()

    if (val) {
      onPlay()
    }
  },
  { immediate: true },
)

watch(
  () => props.msg,
  (val) => {
    errorMsg.value = val || ''
  },
  { immediate: true },
)
</script>
