<!-- 海康威视H5播放器 -->
<template>
  <div class="w-full h-full relative">
    <div :id="domId" class="w-full h-full" style="background-color: #000000"></div>

    <div class="absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
      <p v-if="errorMsg">{{ errorMsg }}</p>

      <LoadingOutlined v-if="playLoading" class="text-[0.8rem]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { uuid } from "@/utils/utils"
import { LoadingOutlined } from "@ant-design/icons-vue"
import { computed, defineProps, onBeforeUnmount, onMounted, ref, watch } from "vue"

const props = defineProps({
  // 播放流地址（必传）
  playUrl: {
    required: true,
    type: String,
    default: null
  },
  // 错误提示信息（非必须，根据情况传递）
  msg: {
    required: false,
    type: String,
    default: ""
  }
})

const playUrl = computed(() => props.playUrl)

const domId = ref(`video-${uuid()}`)

const errorMsg = ref("")

const playLoading = ref(false)

let player: any = null

onMounted(() => {
  initPlayer()

  window.addEventListener("resize", () => {
    if (player) {
      player.JS_Resize()
    }
  })
})

onBeforeUnmount(async () => {
  await onDispose()
})

function initPlayer() {
  player = new (window as any).JSPlugin({
    szId: domId.value,
    szBasePath: "./static/HikvisionH5player", // 必填,与h5player.min.js的引用路径一致
    iMaxSplit: 1,
    openDebug: true,
    mseWorkerEnable: true, //是否开启多线程解码，分辨率大于1080P建议开启，否则可能卡顿
    bSupporDoubleClickFull: true, //是否支持双击全屏，true-双击是全屏；false-双击无响应
    oStyle: {
      borderSelect: "none",
      background: "#111"
    }
  })

  // 事件回调绑定
  player.JS_SetWindowControlCallback({
    // 插件选中窗口回调
    windowEventSelect: function (iWndIndex) {
      // PS：我们目前就有一个窗口，触发了没意义，先留起，后面可能用得到
      console.log("windowSelect callback: ", iWndIndex)
    },
    // 插件错误回调
    pluginErrorHandler: function (iWndIndex, iErrorCode, oError) {
      console.log("pluginError callback: ", iWndIndex, iErrorCode, oError)
    },
    // 全屏切换回调
    windowFullCcreenChange: function (bFull) {
      console.log("fullScreen callback: ", bFull)
    },
    // 首帧显示回调
    firstFrameDisplay: function (iWndIndex, iWidth, iHeight) {
      console.log("firstFrame loaded callback: ", iWndIndex, iWidth, iHeight)
    },
    // 性能不足回调
    performanceLack: function (iWndIndex) {
      console.log("performanceLack callback: ", iWndIndex)
    },
    // 断流事件回调，iTime为秒级
    InterruptStream: (iWndIndex, iTime) => {
      console.log("recv InterruptStream: " + iWndIndex + ", iTime:" + iTime)
    }
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

async function onDispose() {
  await onStopPlay()
  player = null
}

function onPlay() {
  if (!player) {
    return
  }

  const index = player.currentWindowIndex

  player.JS_SetTraceId(index, true)

  playLoading.value = true
  errorMsg.value = ""

  player
    .JS_Play(
      playUrl.value,
      {
        playURL: playUrl.value,
        mode: 0,
        keepDecoder: 0
        // token
      },
      index
    )
    .then(
      () => {
        player.JS_GetTraceId(index).then((id) => {
          console.log("traceid:", id)
        })
      },
      (e) => {
        errorMsg.value = `播放失败：${e}`
        console.error(e)
      }
    )
    .finally(() => {
      playLoading.value = false
    })
}

watch(
  () => props.playUrl,
  async (val) => {
    errorMsg.value = ""
    playLoading.value = false

    await onStopPlay()

    if (val) {
      onPlay()
    }
  },
  { immediate: true }
)

watch(
  () => props.msg,
  (val) => {
    errorMsg.value = val || ""
  },
  { immediate: true }
)
</script>
