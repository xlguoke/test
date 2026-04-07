/**
 * 拖拽视图
 */
export class DragView {
  constructor(opts) {
    const { dragEle, areaEle } = opts

    // 拖拽元素
    this.dragEle = dragEle
    // 依据拖拽变化的区域元素
    this.areaEle = areaEle

    this.bindEvent()
  }

  bindEvent() {
    const { dragEle, areaEle } = this
    let dragEleInitialLeft = null
    let areaEleInitialWidth = null

    dragEle.onmousedown = function () {
      dragEleInitialLeft = dragEle.offsetLeft
      areaEleInitialWidth = areaEle.offsetWidth

      dragEle.style.background = '#e2e2e2'
      dragEle.style.opacity = '0.6'
      dragEle.style.width = `${dragEle.offsetWidth}px`
      dragEle.style.height = `${dragEle.offsetHeight}px`
      dragEle.style.top = `${dragEle.offsetTop}px`
      dragEle.style.left = `${dragEle.offsetLeft}px`
      dragEle.style.position = 'fixed'
      dragEle.style.zIndex = '9999'

      document.onmousemove = function (e) {
        dragEle.style.left = `${e.clientX}px`
        const distance = e.clientX - dragEleInitialLeft
        areaEle.style.width = `${areaEleInitialWidth - distance}px`
      }

      document.onmouseup = function () {
        document.onmousemove = null
        document.onmouseup = null

        dragEle.style.background = ''
        dragEle.style.opacity = ''
        dragEle.style.width = ''
        dragEle.style.height = ''
        dragEle.style.top = ''
        dragEle.style.left = ''
        dragEle.style.position = ''
        dragEle.style.zIndex = ''
      }
    }
  }
}
