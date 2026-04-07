<template>
  <div class="page sign-page">
    <div class="fix-btn">
      <p>请在虚线区域内进行签字</p>
      <van-button
        style="bottom: 286px"
        type="primary"
        plain
        size="small"
        class="but_st"
        @click="closeSign"
      >
        返回
      </van-button>
      <van-button
        style="bottom: 165px"
        type="primary"
        plain
        size="small"
        class="but_st"
        @click="clearArea()"
      >
        重写
      </van-button>
      <van-button
        style="bottom: 50px"
        type="primary"
        size="small"
        class="but_st"
        @click="saveSign()"
      >
        确认
      </van-button>
    </div>

    <div class="content">
      <div id="signWrap" class="sign-wrap">
        <canvas id="myCanvas"></canvas>
      </div>
    </div>

    <div :class="`sign-toast ${toastVisible ? 'show' : ''}`">
      {{ toastText }}
    </div>
  </div>
</template>

<script lang="ts" setup>
const emits = defineEmits(['close', 'save'])

let c: any = null
let ctx: any = null
let mousePressed = false
let lastX = 0
let lastY = 0
let original = ''
const toastText = ref('')
const toastVisible = ref(false)

function _showToast(text: string) {
  toastVisible.value = true
  toastText.value = text
  setTimeout(() => {
    toastVisible.value = false
  }, 2000)
}

nextTick(() => {
  init()
})

function init() {
  mousePressed = false
  c = document.getElementById('myCanvas')
  ctx = c.getContext('2d')
  const signWrap = document.getElementById('signWrap') as HTMLElement

  c.width = signWrap.clientWidth // 设置宽度
  c.height = signWrap.clientHeight // 设置高度
  defaultView() // 设置视图默认内容
  original = c.toDataURL() // 获取初始默认视图，用于判断是否空白签字

  // 监听touchstart事件，touchmove事件，touchend事件等事件
  initThis()
}

function defaultView() {
  ctx.save()
  ctx.translate(150, 200)
  ctx.rotate((90 * Math.PI) / 180)
  ctx.fillStyle = '#e3e3e3'
  ctx.font = '40px 微软雅黑' // 设置字体
  ctx.restore()
}
function initThis() {
  // 触摸屏
  c.addEventListener(
    'touchstart',
    function (event: TouchEvent) {
      if (event.targetTouches.length === 1) {
        event.preventDefault() // 阻止浏览器默认事件，重要
        const touch = event.targetTouches[0]
        mousePressed = true
        Draw(
          touch.pageX - this.offsetLeft,
          touch.pageY - this.offsetTop,
          false,
        )
      }
    },
    false,
  )

  c.addEventListener(
    'touchmove',
    function (event: TouchEvent) {
      if (event.targetTouches.length === 1) {
        event.preventDefault() // 阻止浏览器默认事件，重要
        const touch = event.targetTouches[0]
        if (mousePressed) {
          Draw(
            touch.pageX - this.offsetLeft,
            touch.pageY - this.offsetTop,
            true,
          )
        }
      }
    },
    false,
  )

  c.addEventListener(
    'touchend',
    (event: TouchEvent) => {
      if (event.targetTouches.length === 1) {
        event.preventDefault() // 阻止浏览器默认事件，防止手写的时候拖动屏幕，重要
        // var touch = event.targetTouches[0];
        mousePressed = false
      }
    },
    false,
  )

  // 鼠标
  c.onmousedown = function (event: MouseEvent) {
    mousePressed = true
    Draw(
      event.pageX - this.offsetLeft,
      event.pageY - this.offsetTop,
      false,
    )
  }

  c.onmousemove = function (event: MouseEvent) {
    if (mousePressed) {
      Draw(
        event.pageX - this.offsetLeft,
        event.pageY - this.offsetTop,
        true,
      )
    }
  }

  c.onmouseup = function () {
    mousePressed = false
  }
}

function Draw(x: number, y: number, isDown: boolean) {
  if (isDown) {
    ctx.beginPath()
    ctx.strokeStyle = '#000' // 颜色
    ctx.lineWidth = 8 // 线宽
    ctx.lineJoin = 'round'
    ctx.lineMax = 10 // 设置画笔最大线宽
    ctx.lineMin = 8 // 设置画笔最小线宽
    ctx.linePressure = 1.2 // 设置画笔笔触压力
    ctx.smoothness = 30 // 设置画笔笔触大小变化的平滑度。
    ctx.moveTo(lastX, lastY)
    ctx.lineTo(x, y)
    ctx.closePath()
    ctx.stroke()
  }
  lastX = x
  lastY = y
}

function closeSign() {
  emits('close')
}

// 清空画板
function clearArea() {
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  defaultView()
}

// 保存签名
function saveSign() {
  const c = document.getElementById('myCanvas') as any // 获取html的canvas对象
  if (isCanvasBlank(c)) {
    _showToast('请签名')
  }
  else {
    const image = c.toDataURL('image/png') // 得到生成后的签名base64位  url 地址
    rotateBase64Img(image, -90, (v: any) => {
      emits('save', v)
    })
  }
}

// 验证canvas画布是否为空函数
function isCanvasBlank(canvas: any) {
  return canvas.toDataURL() === original // 比较值相等则为空
}

function rotateBase64Img(src: string, edg: number, callback: any) {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  let imgW // 图片宽度
  let imgH // 图片高度
  let size // canvas初始大小
  if (edg % 90 !== 0) {
    console.error('旋转角度必须是90的倍数!')
    return ''
  }
  if (edg < 0)
    (edg = (edg % 360) + 360)
  const quadrant = (edg / 90) % 4 // 旋转象限
  const cutCoor = { sx: 0, sy: 0, ex: 0, ey: 0 } // 裁剪坐标
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = src
  image.onload = function () {
    imgW = image.width
    imgH = image.height
    size = imgW > imgH ? imgW : imgH
    canvas.width = size * 2
    canvas.height = size * 2
    switch (quadrant) {
      case 0:
        cutCoor.sx = size
        cutCoor.sy = size
        cutCoor.ex = size + imgW
        cutCoor.ey = size + imgH
        break
      case 1:
        cutCoor.sx = size - imgH
        cutCoor.sy = size
        cutCoor.ex = size
        cutCoor.ey = size + imgW
        break
      case 2:
        cutCoor.sx = size - imgW
        cutCoor.sy = size - imgH
        cutCoor.ex = size
        cutCoor.ey = size
        break
      case 3:
        cutCoor.sx = size
        cutCoor.sy = size - imgW
        cutCoor.ex = size + imgH
        cutCoor.ey = size + imgW
        break
    }
    ctx?.translate(size, size)
    ctx?.rotate((edg * Math.PI) / 180)
    // drawImage向画布上绘制图片
    ctx?.drawImage(image, 0, 0)
    // getImageData() 复制画布上指定矩形的像素数据
    const imgData = ctx?.getImageData(
      cutCoor.sx,
      cutCoor.sy,
      cutCoor.ex,
      cutCoor.ey,
    )
    if (quadrant % 2 === 0) {
      canvas.width = imgW
      canvas.height = imgH
    }
    else {
      canvas.width = imgH
      canvas.height = imgW
    }
    // putImageData() 将图像数据放回画布
    if (imgData)
      ctx?.putImageData(imgData, 0, 0)

    callback(canvas.toDataURL())
  }
}
</script>

<style scoped>
.page {
  height: 100%;
  display: flex;
  align-items: center;
  width: 100%;
  position: fixed;
  top: 0;
  background: #fff;
}

.hollow-primary-btn {
  color: #228ade;
  border-color: #228ade;
}
.tip {
  font-size: 0.3rem;
  text-align: center;
  padding: 10px;
}

.sign-page .content {
  font-size: 14px;
  color: #666;
  height: calc(100% - 20px);
  width: calc(100% - 60px);
}

.sign-wrap {
  width: 100%;
  height: 100%;
  border: 1px dashed #999;
  border-radius: 6px;
}
.fix-btn {
  height: 100%;
  text-align: center;
  width: 50px;
  position: relative;
}
.fix-btn p {
  transform: rotate(90deg);
  position: absolute;
  left: -125px;
  top: 125px;
  width: 300px;
  font-size: 14px;
  color: #cbcbcb;
}
.but_st {
  transform: rotate(90deg);
  width: 100px;
  position: absolute;
  left: -25px;
}
#myCanvas {
  color: #ff6000;
  background-color: #ffffff;
}
.sign-toast{
  position: fixed;
  right: 10px;
  top: 50%;
  padding: 0 8px;
  line-height: 30px;
  transform: translate(-50%, 0) rotate(90deg);
  z-index: 100;
  background: rgba(1,1,1,.5);
  border-radius: 4px;
  color:#fff;
  font-size: 12px;
  height: 0;
  overflow: hidden;
  transition: .2s;
}
.sign-toast.show{
  height: 30px;
}
</style>
