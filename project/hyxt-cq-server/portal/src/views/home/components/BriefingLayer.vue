<template>
  <div
    v-if="!config.hidden"
    ref="briefingLayerRef"
    class="briefing-layer"
    :style="{
      transform: `translate(${config.x}px, ${config.y}px)`,
      top: '0px',
      left: '0px'
    }"
    @mouseenter="stopMovement()"
    @mouseleave="startMovement()"
  >
    <div class="briefing-layer-header">
      重要通知
      <CloseOutlined title="关闭" @click="removePopup()" />
    </div>
    <div class="briefing-layer-body">
      <div
        v-for="item in list"
        :key="item.id"
        class="briefing-layer-item"
        :title="item.title"
        @click="goDetail(item.id)"
      >
        {{ item.title }} >>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { CloseOutlined } from "@ant-design/icons-vue"
import { useRouter } from "vue-router"

const router = useRouter()

const props = defineProps(["list"])

const briefingLayerRef = ref()

// 注：产品说要闻只显示一条
const list = computed(() => (props.list || []).slice(0, 1))

const config = ref<{
  x: number
  y: number
  dx: number
  dy: number
  animationFrameId?: number
  hidden: boolean
  stop: boolean
}>({
  x: 100,
  y: 100,
  dx: 2,
  dy: 2,
  hidden: false,
  stop: false
})

const goDetail = (id: string) => {
  router.push(`/newsDetail?id=${id}`)
}

const startMovement = () => {
  config.value.stop = false
  animatePopups()
}

const stopMovement = () => {
  config.value.stop = true

  if (config.value.animationFrameId) {
    cancelAnimationFrame(config.value.animationFrameId)
  }
}

const removePopup = () => {
  config.value.hidden = true

  if (config.value.animationFrameId) {
    cancelAnimationFrame(config.value.animationFrameId)
  }
}

// 动画循环
const animatePopups = () => {
  if (config.value.stop) return

  const screenWidth = window.innerWidth
  const screenHeight = window.innerHeight

  const layerWidth = briefingLayerRef.value.clientWidth + 16
  const layerHeight = briefingLayerRef.value.clientHeight + 16

  // 更新位置
  config.value.x += config.value.dx * 0.5
  config.value.y += config.value.dy * 0.5

  // 边界检测和反弹
  if (config.value.x <= 0 || config.value.x >= screenWidth - layerWidth) {
    config.value.dx = -config.value.dx
    // 确保不会卡在边界
    config.value.x = config.value.x <= 0 ? 0 : screenWidth - layerWidth
  }

  if (config.value.y <= 0 || config.value.y >= screenHeight - layerHeight) {
    config.value.dy = -config.value.dy
    // 确保不会卡在边界
    config.value.y = config.value.y <= 0 ? 0 : screenHeight - layerHeight
  }

  config.value.animationFrameId = requestAnimationFrame(animatePopups)
}

// 窗口大小变化时调整弹窗位置
const handleResize = () => {
  const layerWidth = briefingLayerRef.value.clientWidth + 16
  const layerHeight = briefingLayerRef.value.clientHeight + 16

  if (config.value.x > window.innerWidth - layerWidth) {
    config.value.x = window.innerWidth - layerWidth
  }
  if (config.value.y > window.innerHeight - layerHeight) {
    config.value.y = window.innerHeight - layerHeight
  }
}

onMounted(() => {
  animatePopups()
  window.addEventListener("resize", handleResize)
})

onUnmounted(() => {
  removePopup()
  window.removeEventListener("resize", handleResize)
})
</script>

<style scoped lang="less">
.briefing-layer {
  position: fixed;
  width: 300px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  transition: transform 0.1s linear;
  z-index: 100000;
  padding: 16px;
  font-size: 14px;

  .briefing-layer-header {
    border-bottom: solid 1px #e2e2e2;
    margin-bottom: 8px;
    padding-bottom: 8px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
    position: relative;

    .anticon {
      font-size: 16px;
      cursor: pointer;
      color: #666;
      position: absolute;
      right: 16px;
      top: 5px;
    }
  }

  .briefing-layer-body {
    overflow-y: auto;
    margin-top: 8px;

    .briefing-layer-item {
      border-top: dashed 1px #e2e2e2;
      padding: 4px 0;
      cursor: pointer;
      color: #4a8de5;
      text-decoration: underline;

      &:hover {
        opacity: 0.8;
      }

      &:first-child {
        border-top: 0;
      }
    }
  }
}
</style>
