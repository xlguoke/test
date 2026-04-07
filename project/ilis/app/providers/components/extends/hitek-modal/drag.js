import 'jquery'

// 允许antd-vue的modal组件可拖拽
class dragModal {
  constructor() {
    // 获取弹窗dom
    this.windowBody = null
    this.top = 0
    this.left = 0
    this.x = 0
    this.y = 0
    this.initialStyle = {}
    this.first = true
    this.iframeTop = 0
    this.iframeLeft = 0
    this.init()
  }

  // 初始化拖拽
  init() {
    window.frameElement && (this.iframeTop = window.frameElement.offsetTop)
    window.frameElement && (this.iframeLeft = window.frameElement.offsetLeft)

    const self = this
    window.$(document).on('mousedown', () => {
      if (
        window.$(event.target).hasClass('ant-modal-header')
        || window.$(event.target).hasClass('ant-modal-title')
      ) {
        self.windowBody = window.$(event.target).parents('.ant-modal')
        self.first && self.initialPosition() && (self.first = false)
        self.setInitialData(event)

        document.onmousemove = (event) => {
          self.drag(event)
        }

        document.onmouseleave = () => {
          self.adjustment()
          document.onmousemove = null
        }

        document.onmouseup = () => {
          self.adjustment()
          document.onmousemove = null
        }
      }
    })
  }

  // 重新定位弹窗位置
  initialPosition() {
    const top = this.windowBody.offset().top
    const left = this.windowBody.offset().left

    this.initialStyle = {
      top,
      left,
    }

    this.windowBody[0].style.top = `${top}px`
    this.windowBody[0].style.left = `${left}px`
    this.windowBody[0].style.margin = 'initial'
  }

  // 设置偏移量
  setInitialData(event) {
    const top = this.windowBody.offset().top
    const left = this.windowBody.offset().left
    const { clientY, clientX } = event
    this.x = clientX - this.iframeLeft
    this.y = clientY - this.iframeTop
    this.top = top
    this.left = left
  }

  // 根据拖动计算调整位置
  drag(event) {
    const { clientY, clientX } = event
    const top = clientY - (this.y - this.top) - this.iframeTop
    const left = clientX - (this.x - this.left) - this.iframeLeft

    this.windowBody[0].style.top = `${top}px`
    this.windowBody[0].style.left = `${left}px`

    this.adjustment()
  }

  // 松开之后重新调整弹窗位置
  adjustment() {
    let left, top
    // 拖到边缘停止拖动
    if (this.windowBody.offset().left < 0) {
      left = 0
    }
    else if (
      this.windowBody.offset().left + this.windowBody.width()
      > document.body.clientWidth
    ) {
      left = document.body.clientWidth - this.windowBody.width()
    }
    else if (this.windowBody.offset().top < 0) {
      top = 0
    }
    else if (
      this.windowBody.offset().top + this.windowBody.height()
      > document.body.clientHeight
    ) {
      top = document.body.clientHeight - this.windowBody.height()
    }

    if (left !== undefined) {
      this.windowBody.css('left', `${left}px`)
      // this.windowBody.style.left = `${left}px`;
    }
    if (top !== undefined) {
      this.windowBody.css('top', `${top}px`)
      // this.windowBody.style.top = `${top}px`;
    }
  }

  reset() {
    const { top } = this.initialStyle

    this.windowBody[0].style.top = `${top}px`
    this.windowBody[0].style.left = 'initial'
    this.windowBody[0].style.margin = '0 auto'
    this.top = 0
    this.left = 0
    this.x = 0
    this.y = 0
  }

  destroyEvent() {
    window.$(document).off('mousedown', this.init)
  }
}

export default dragModal
