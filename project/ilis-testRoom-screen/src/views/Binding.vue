<template>
  <canvas ref="canvas"></canvas>
  <van-loading v-show="loading" color="#a4c1ff" size="0.5rem" vertical>加载中...</van-loading>
  <div class="bind">
    <div class="wrap font-ys">
      <div class="head">提示</div>
      <div class="body">
        <div class="unit-code">
          <p>单位编码：</p>
          <input v-model.trim="unitCode" class="font-ys" placeholder="请输入单位编码" />
        </div>
        <br />
        <div>
          <p>大屏编号：{{ bigScreenNo }}</p>
        </div>
      </div>
      <div class="foot">
        <p class="p-btn confirm" @click="onConfirm">我已绑定</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useStore } from "@/store"
import { androidTools } from "@/utils/AndroidTools"
import { storeToRefs } from "pinia"
import { onMounted, ref, onBeforeUnmount } from "vue"

onMounted(() => {
  initfontSize()
})
// 离开本页后移除时间并把根节点的样式清除
onBeforeUnmount(() => {
  window.onresize = null
  document.documentElement.style.fontSize = "unset"
})
window.onresize = () => {
  initfontSize()
}
const initfontSize = () => {
  const winW = document.body.clientWidth || window.innerWidth
  let size = (winW / 1080) * 100
  document.documentElement.style.fontSize = size + "px"
}

const store = useStore()
const { isUpdateConf } = storeToRefs(store)

const unitCode = ref("")

const bigScreenNo = ref("")

interface Point {
  x: number
  y: number
  vx: number
  vy: number
}
const canvas = ref<HTMLCanvasElement | null>(null)
let points: Point[] = []
let ctx: CanvasRenderingContext2D | null = null

/**
 * 初始化canvas
 */
const canvasInit = () => {
  if (canvas.value) {
    ctx = canvas.value.getContext("2d")
    canvas.value.width = window.innerWidth
    canvas.value.height = window.innerHeight
    if (!ctx) return

    // 初始化圆点
    for (let i = 0; i < 100; i++) {
      points.push({
        x: Math.random() * canvas.value.width,
        y: Math.random() * canvas.value.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2
      })
    }

    // 开始动画循环
    requestAnimationFrame(animate)
  }
}

/**
 * 动画循环
 */
const animate = () => {
  if (!ctx) return
  if (canvas.value && ctx) {
    // 清除画布
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height)

    // 更新每个点的位置
    points.forEach((point) => {
      point.x += point.vx
      point.y += point.vy
      if (canvas.value) {
        // 边界检测，反弹
        if (point.x > canvas.value.width || point.x < 0) point.vx *= -1
        if (point.y > canvas.value.height || point.y < 0) point.vy *= -1
      }

      // 绘制点
      if (ctx) {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = "#18e1ff"
        ctx.fill()
      }

      // 连接附近的点
      points.forEach((otherPoint) => {
        if (point !== otherPoint) {
          const distance = Math.sqrt(
            Math.pow(point.x - otherPoint.x, 2) + Math.pow(point.y - otherPoint.y, 2)
          )
          if (distance < 100 && ctx) {
            // 计算线条的透明度，越近的点，线条越明显
            const alpha = Math.max(0, Math.min(1, 1 - distance / 100))
            ctx.beginPath()
            ctx.moveTo(point.x, point.y)
            ctx.lineTo(otherPoint.x, otherPoint.y)
            ctx.strokeStyle = `rgba(51, 170, 255, ${alpha})`
            ctx.stroke()
          }
        }
      })
    })

    // 请求下一帧动画
    requestAnimationFrame(animate)
  }
}

/**
 * 确认绑定
 */
const loading = ref(false)
async function onConfirm() {
  if (!unitCode.value) {
    return alert("请输入单位编码")
  }
  if (!bigScreenNo.value) {
    return alert("请输入大屏编号")
  }
  loading.value = true
  setLocal()
  try {
    const routeUrl = await store.getScreenConfigAction()
    if (!routeUrl) {
      loading.value = false
      alert("未找到当前设备配置信息，请前往系统配置后再进行操作！")
      return
    }
    isUpdateConf.value = true
    location.replace(routeUrl)
  } catch (er) {
    loading.value = false
  }
}

function setLocal() {
  localStorage.setItem("unitCode", unitCode.value)
  localStorage.setItem("bigScreenNo", bigScreenNo.value)
}

function init() {
  unitCode.value = store.getUnitCode()
  bigScreenNo.value =
    store.getScreenNo() || androidTools.getDeviceId() || new Date().getTime().toString()
  setLocal()
}

onMounted(() => {
  init()
  canvasInit()
})
</script>

<style lang="less">
//重写 vant loading
.van-loading {
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  background-color: rgba(5, 29, 65, 0.5);
  z-index: 500;
  text-align: center;
  line-height: 100vh;

  .van-loading__text {
    color: #a4c1ff;
    margin-top: 0.2rem;
    line-height: 24px;
    font-size: 0.3rem;
  }
}
.bind {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  font-size: 0.36rem;
  color: #fff;
  z-index: 100;
  background-color: rgba(5, 29, 65, 0.7);

  .wrap {
    position: absolute;
    z-index: 9999;
    padding: 0.15rem 0.2rem;
    width: 8rem;
    height: auto;
    border: 1px solid #1890ff;
    box-sizing: border-box;
    background-color: rgba(5, 29, 65, 0.9);
    box-shadow: inset 0px 0px 23px 0px rgba(0, 149, 255, 0.6);
    overflow: hidden;

    .head {
      line-height: 0.72rem;
      background: linear-gradient(to right, transparent, #33aaff, transparent);
      text-align: center;
      color: #fff;
    }

    .body {
      margin: 0.2rem 0;
      padding: 0.2rem;
      min-height: 5rem;
      max-height: 8rem;
      overflow-y: auto;
      min-height: 1rem;
    }

    .foot {
      text-align: right;
      padding: 0.1rem;

      .p-btn {
        display: inline-block;
        padding: 0.05rem 0.2rem;
        margin-left: 0.3rem;
        border: 1px solid #1890ff;
        color: #fff;
        cursor: pointer;
      }

      .confirm {
        background: linear-gradient(180deg, #18e8ff 0%, #1890ff 100%);
      }
    }
  }
}

.unit-code {
  input {
    padding: 0.1rem 0.16rem;
    width: 100%;
    background: transparent;
    border-color: #1890ff;
    outline: none;
    box-sizing: border-box;
    &::-webkit-input-placeholder {
      color: #4d6e9e;
    }

    &::-moz-placeholder {
      color: #4d6e9e;
    }

    &::-ms-input-placeholder {
      color: #4d6e9e;
    }
  }
}
</style>
